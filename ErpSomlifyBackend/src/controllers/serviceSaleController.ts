import { Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma } from "@prisma/client";
import { TransactionAuditType, TransactionCategory } from "@prisma/client";
import { TreasuryService } from "../services/TreasuryService";

/** Create service sale(s). Accepts single object or array (multi-create). Each element can have multiple items. */
export const createServiceSales = async (req: CustomUserRequest, res: Response) => {
  try {
    const userRoles = (req.user as any)?.roles || [];
    const isAdminUser = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');

    if (!isAdminUser) {
      const seller = await prisma.company_users.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!seller || (seller.company_id ?? '') !== (req.user!.company_id ?? '')) {
        return res.status(403).json({ message: "Invalid seller credentials" });
      }
    }

    const salesData = Array.isArray(req.body) ? req.body : [req.body];
    const companyId = req.user!.company_id ?? req.body?.company_id ?? req.body?.[0]?.company_id;
    if (!companyId) {
      return res.status(400).json({ message: "company_id is required for service sales" });
    }
    const userId = req.user!.user_id;

    const created = await prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const sale of salesData) {
        const { items, customer_id, received_amount, sale_discount } = sale as {
          items: Array<{ service_id: string; quantity: number; unit_price: number | string; discount?: number | string }>;
          customer_id?: number;
          received_amount: number | string;
          sale_discount?: number | string;
        };

        if (!items || !Array.isArray(items) || items.length === 0) {
          throw { status: 400, message: "items array is required and must not be empty" };
        }
        if (received_amount == null || received_amount === "") {
          throw { status: 400, message: "received_amount is required" };
        }

        const receivedDecimal = new Prisma.Decimal(received_amount);
        const discountDecimal = new Prisma.Decimal(sale_discount ?? 0);
        if (receivedDecimal.lt(0) || discountDecimal.lt(0)) {
          throw { status: 400, message: "received_amount and sale_discount cannot be negative" };
        }

        let totalAmount = new Prisma.Decimal(0);
        const lineItems: Array<{ service_id: string; quantity: number; unit_price: Prisma.Decimal; discount: Prisma.Decimal; service?: any }> = [];

        for (const item of items) {
          const { service_id, quantity, unit_price, discount } = item;
          if (!service_id || quantity == null || unit_price == null) {
            throw { status: 400, message: "Each item must have service_id, quantity, unit_price" };
          }
          const qty = Number(quantity);
          const up = new Prisma.Decimal(unit_price);
          const d = new Prisma.Decimal(discount ?? 0);
          if (qty <= 0 || up.lt(0) || d.lt(0)) {
            throw { status: 400, message: "Invalid item: quantity > 0, unit_price and discount >= 0" };
          }

          const service = await tx.service.findFirst({
            where: { id: service_id, company_id: companyId, is_deleted: false },
          });
          if (!service) {
            throw { status: 404, message: `Service ${service_id} not found or not in company` };
          }

          const lineTotal = up.mul(qty).minus(d);
          totalAmount = totalAmount.plus(lineTotal);
          lineItems.push({ service_id, quantity: qty, unit_price: up, discount: d, service });
        }

        const totalAfterDiscount = totalAmount.minus(discountDecimal);
        if (totalAfterDiscount.lt(0)) {
          throw { status: 400, message: "sale_discount cannot exceed total amount" };
        }
        if (receivedDecimal.gt(totalAfterDiscount)) {
          throw { status: 400, message: "received_amount cannot exceed total after discount" };
        }

        const remaining = totalAfterDiscount.minus(receivedDecimal);
        if (remaining.gt(0) && (customer_id == null || String(customer_id) === "")) {
          throw { status: 400, message: "Customer required when payment is not 100% (receivable)" };
        }

        let status: "PAID" | "ISSUED" | "PARTIAL";
        if (receivedDecimal.gte(totalAfterDiscount)) {
          status = "PAID";
        } else if (receivedDecimal.equals(0)) {
          status = "ISSUED";
        } else {
          status = "PARTIAL";
        }

        const serviceSale = await tx.service_sales.create({
          data: {
            company_id: companyId,
            customer_id: customer_id ?? undefined,
            sold_by: isAdminUser ? null : userId,
            total_amount: totalAmount,
            sale_discount: discountDecimal,
            received_amount: receivedDecimal,
          },
        });

        for (const it of lineItems) {
          await tx.service_sale_items.create({
            data: {
              service_sale_id: serviceSale.id,
              service_id: it.service_id,
              quantity: it.quantity,
              unit_price: it.unit_price,
              discount: it.discount,
            },
          });
        }

        if (receivedDecimal.gt(0)) {
          await TreasuryService.recordMovement(
            companyId,
            receivedDecimal,
            TransactionAuditType.DEBIT,
            TransactionCategory.SERVICE_SALE,
            userId,
            `SVC-${serviceSale.id}`,
            `Service sale payment #${serviceSale.id}`,
            tx
          );
        }

        const invoiceNumber = `INV-SVC-${serviceSale.id}`;
        await tx.invoice.create({
          data: {
            invoice_number: invoiceNumber,
            issue_date: new Date(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status,
            total_amount: totalAfterDiscount,
            tax_amount: new Prisma.Decimal(0),
            company_id: companyId,
            customer_id: customer_id ?? null,
            service_sale_id: serviceSale.id,
            service_items: {
              create: lineItems.map((it) => ({
                service_id: it.service_id,
                quantity: it.quantity,
                unit_price: it.unit_price,
                discount: it.discount,
                description: it.service?.name ?? null,
              })),
            },
          },
        });

        const withItems = await tx.service_sales.findUnique({
          where: { id: serviceSale.id },
          include: {
            items: { include: { service: true } },
            customer: true,
            company_users: { select: { full_name: true, email: true, user_id: true } },
          },
        });
        results.push(withItems);
      }
      return results;
    });

    return res.status(201).json(created);
  } catch (error: any) {
    console.error("Error creating service sales:", error);
    if (error?.status && error?.message) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllServiceSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const [total, sales] = await prisma.$transaction([
      prisma.service_sales.count({ where: { company_id: companyId } }),
      prisma.service_sales.findMany({
        where: { company_id: companyId },
        include: {
          items: { include: { service: { include: { Job: true } } } },
          customer: true,
          company_users: { select: { full_name: true, email: true, user_id: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    res.status(200).json({
      data: sales,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching service sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getServiceSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const sale = await prisma.service_sales.findFirst({
      where: { id: req.params.id, company_id: companyId },
      include: {
        items: { include: { service: { include: { Job: true } } } },
        customer: true,
        company_users: { select: { full_name: true, email: true, user_id: true } },
        Invoice: true,
      },
    });
    sale ? res.status(200).json(sale) : res.status(404).json({ message: "Service sale not found" });
  } catch (error) {
    console.error("Error fetching service sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateServiceSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { items, customer_id, received_amount, sale_discount } = req.body;
    const saleId = req.params.id;
    const companyId = req.user!.company_id;

    const existing = await prisma.service_sales.findFirst({
      where: { id: saleId, company_id: companyId },
      include: { items: true, Invoice: true },
    });
    if (!existing) {
      res.status(404).json({ message: "Service sale not found" });
      return;
    }

    if (items == null || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "items array is required" });
      return;
    }

    const discountDecimal = new Prisma.Decimal(sale_discount ?? 0);
    const receivedDecimal = new Prisma.Decimal(received_amount ?? 0);
    let totalAmount = new Prisma.Decimal(0);
    const lineItems: Array<{ service_id: string; quantity: number; unit_price: Prisma.Decimal; discount: Prisma.Decimal }> = [];

    for (const item of items) {
      const { service_id, quantity, unit_price, discount } = item;
      if (!service_id || quantity == null || unit_price == null) {
        res.status(400).json({ message: "Each item must have service_id, quantity, unit_price" });
        return;
      }
      const qty = Number(quantity);
      const up = new Prisma.Decimal(unit_price);
      const d = new Prisma.Decimal(discount ?? 0);
      const lineTotal = up.mul(qty).minus(d);
      totalAmount = totalAmount.plus(lineTotal);
      lineItems.push({ service_id, quantity: qty, unit_price: up, discount: d });
    }

    const totalAfterDiscount = totalAmount.minus(discountDecimal);
    if (totalAfterDiscount.lt(0) || receivedDecimal.gt(totalAfterDiscount)) {
      res.status(400).json({ message: "Invalid amounts or discount" });
      return;
    }
    const remaining = totalAfterDiscount.minus(receivedDecimal);
    if (remaining.gt(0) && (customer_id == null || String(customer_id) === "")) {
      res.status(400).json({ message: "Customer required when not fully paid" });
      return;
    }

    let status: "PAID" | "ISSUED" | "PARTIAL";
    if (receivedDecimal.gte(totalAfterDiscount)) status = "PAID";
    else if (receivedDecimal.equals(0)) status = "ISSUED";
    else status = "PARTIAL";

    const prevReceived = new Prisma.Decimal(existing.received_amount);
    const treasuryDelta = receivedDecimal.minus(prevReceived);

    await prisma.$transaction(async (tx) => {
      await tx.service_sale_items.deleteMany({ where: { service_sale_id: saleId } });
      for (const it of lineItems) {
        await tx.service_sale_items.create({
          data: {
            service_sale_id: saleId,
            service_id: it.service_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount: it.discount,
          },
        });
      }
      await tx.service_sales.update({
        where: { id: saleId },
        data: {
          total_amount: totalAmount,
          sale_discount: discountDecimal,
          received_amount: receivedDecimal,
          customer_id: customer_id ?? null,
          updated_at: new Date(),
        },
      });

      const inv = existing.Invoice[0];
      if (inv) {
        await tx.invoiceServiceItem.deleteMany({ where: { invoice_id: inv.id } });
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            status,
            total_amount: totalAfterDiscount,
            customer_id: customer_id ?? null,
            service_items: {
              create: lineItems.map((it) => ({
                service_id: it.service_id,
                quantity: it.quantity,
                unit_price: it.unit_price,
                discount: it.discount,
              })),
            },
          },
        });
      }

      if (treasuryDelta.gt(0)) {
        await TreasuryService.recordMovement(
          companyId,
          treasuryDelta,
          TransactionAuditType.DEBIT,
          TransactionCategory.SERVICE_SALE,
          req.user!.user_id,
          `SVC-${saleId}`,
          `Additional payment for service sale #${saleId}`,
          tx
        );
      }
    });

    const updated = await prisma.service_sales.findUnique({
      where: { id: saleId },
      include: {
        items: { include: { service: true } },
        customer: true,
        company_users: { select: { full_name: true, email: true, user_id: true } },
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating service sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteServiceSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const sale = await prisma.service_sales.findFirst({
      where: { id: req.params.id, company_id: req.user!.company_id },
      include: { Invoice: true },
    });
    if (!sale) {
      res.status(404).json({ message: "Service sale not found" });
      return;
    }
    const inv = sale.Invoice[0];
    if (inv) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: "VOID" },
      });
    }
    await prisma.service_sale_items.deleteMany({ where: { service_sale_id: sale.id } });
    await prisma.service_sales.delete({ where: { id: sale.id } });
    res.status(200).json({ message: "Service sale voided successfully" });
  } catch (error) {
    console.error("Error deleting service sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
