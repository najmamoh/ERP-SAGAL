import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma } from "@prisma/client";

export const getAllInvoices = async (req: CustomUserRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const user = req.user as any;
    const roles = user?.roles || [];
    const isMainAdmin = !user?.company_id && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
    const companyIdFilter = req.query.company_id as string | undefined;

    const where: any = {};
    if (isMainAdmin) {
      if (companyIdFilter && companyIdFilter.trim() !== '') {
        where.company_id = companyIdFilter;
      }
    } else {
      where.company_id = user.company_id;
    }
    
    if (req.query.status) where.status = req.query.status;
    if (req.query.customer_id) where.customer_id = parseInt(req.query.customer_id as string);
    const search = (req.query.search as string || '').trim();
    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { customer: { customer_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, invoices] = await prisma.$transaction([
      prisma.invoice.count({ where }), 
      prisma.invoice.findMany({
        where,
        include: {
          items: { include: { product: true } },
          service_items: { include: { service: true } },
          service_sales: true,
          customer: true,
          company: true
        },
        skip,
        take: pageSize,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      })
    ]);

    res.json({
      data: invoices,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInvoice = async (req: CustomUserRequest, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = { id: req.params.id };
    if (user?.company_id) where.company_id = user.company_id;

    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        items: { include: { product: true } },
        service_items: { include: { service: true } },
        service_sales: true,
        customer: true,
        company: true,
        product_sales: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Use stored totals when available (multi-item); otherwise derive from related sales
    let totalPaidAmount: Prisma.Decimal;
    let totalDiscount: Prisma.Decimal;

    if (invoice.total_paid_amount != null && invoice.total_discount_amount != null) {
      totalPaidAmount = new Prisma.Decimal(invoice.total_paid_amount);
      totalDiscount = new Prisma.Decimal(invoice.total_discount_amount);
    } else if (invoice.customer_id != null && invoice.issue_date && invoice.company_id) {
      const transactionSales = await prisma.product_sales.findMany({
        where: {
          customer_id: invoice.customer_id,
          company_users: { company_id: invoice.company_id },
          created_at: {
            gte: new Date(new Date(invoice.issue_date).getTime() - 60000),
            lte: new Date(new Date(invoice.issue_date).getTime() + 60000),
          }
        },
        select: {
          received_amount: true,
          sale_discount: true,
        }
      });

      totalPaidAmount = transactionSales.reduce(

        (sum, sale) => sum.plus(new Prisma.Decimal(sale.received_amount)),
        new Prisma.Decimal(0)
      );
      totalDiscount = transactionSales.reduce(
      // Fallback: if no customer_id, use the linked sale
        (sum, sale) => sum.plus(new Prisma.Decimal(sale.sale_discount)),
        new Prisma.Decimal(0)
      );
    } else if (invoice.product_sales) {
      totalPaidAmount = new Prisma.Decimal(invoice.product_sales.received_amount || 0);
      totalDiscount = new Prisma.Decimal(invoice.product_sales.sale_discount || 0);
    } else {
    // Add calculated totals to invoice response
      totalPaidAmount = new Prisma.Decimal(0);
      totalDiscount = new Prisma.Decimal(0);
    }

    const invoiceWithTotals = {
      ...invoice,
      total_paid_amount: totalPaidAmount.toString(),
      total_discount_amount: totalDiscount.toString(),
    };

    res.json(invoiceWithTotals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteInvoice = async (req: CustomUserRequest, res: Response) => {
  try {
    // if (!['admin', 'superAdmin'].includes(req.user!.role)) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    const companyId = (req.body?.company_id || (req.user as any)?.company_id) as string | undefined;
    const where: any = { id: req.params.id };
    if (companyId) where.company_id = companyId;

    const invoice = await prisma.invoice.findFirst({
      where,
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (['PAID', 'VOID'].includes(invoice.status)) {
      return res.status(400).json({ message: "Cannot delete paid/void invoices" });
    }

    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};