

// }



// controllers/purchases.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma, TransactionAuditType, TransactionCategory } from '@prisma/client';
import { TreasuryService } from '../services/TreasuryService';

// allert number
export const lowItems = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const userCompanyId = (req.user as any)?.company_id;
    const companyIdFilter = req.query.company_id as string | undefined;
    const companyId = companyIdFilter || userCompanyId;
    
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }

    // 1. Get total count with integer cast
    const totalQuery = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int as count
      FROM (
        SELECT p.product_id
        FROM products p
        LEFT JOIN product_purchases pp 
          ON p.product_id = pp.product_id 
          AND pp.purchase_qty > 0
        WHERE p.company_id = ${companyId}
          AND p.product_alert_number IS NOT NULL
          AND p.product_alert_number > 0
        GROUP BY p.product_id, p.product_alert_number
        HAVING COALESCE(SUM(pp.purchase_qty), 0) <= p.product_alert_number
      ) AS low_stock_products
    `;

    const total = totalQuery[0]?.count || 0;

    // 2. Get paginated results with integer cast
    const lowStockProducts = await prisma.$queryRaw<{
      product_id: number;
      product_name: string;
      product_code: string;
      product_alert_number: number;
      total_stock: number;
      product_price: number;
    }[]>`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_code,
        p.product_alert_number,
        p.product_price,
        COALESCE(SUM(pp.purchase_qty)::int, 0) as total_stock
      FROM products p
      LEFT JOIN product_purchases pp 
        ON p.product_id = pp.product_id 
        AND pp.purchase_qty > 0
      WHERE p.company_id = ${companyId}
        AND p.product_alert_number IS NOT NULL
        AND p.product_alert_number > 0
      GROUP BY 
        p.product_id, 
        p.product_name,
        p.product_code,
        p.product_alert_number,
        p.product_price
      HAVING COALESCE(SUM(pp.purchase_qty), 0) <= p.product_alert_number
      ORDER BY total_stock ASC
      LIMIT ${pageSize}
      OFFSET ${skip}
    `;

    res.status(200).json({
      lowStockProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error(`Error fetching low stock items: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
//searched purchase 
export const getSearchAllPurchases = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const userCompanyId = (req.user as any)?.company_id;
    const companyIdFilter = req.query.company_id as string | undefined;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');

    const companyId = companyIdFilter || userCompanyId;
    const whereClause: any = {
      purchase_qty: { gt: 0 },
    };
    
    if (companyId) {
      whereClause.products = {
        company_id: companyId,
        OR: search ? [
          { product_name: { contains: search as string } },
          { product_code: { contains: search as string } }
        ] : undefined
      };
    } else if (!isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    } else if (search) {
      whereClause.products = {
        OR: [
          { product_name: { contains: search as string } },
          { product_code: { contains: search as string } }
        ]
      };
    }

    const [total, purchases] = await prisma.$transaction([
      prisma.product_purchases.count({ where: whereClause }),
      prisma.product_purchases.findMany({
        where: whereClause,
        include: { products: true, vendors: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(pageSize),
      })
    ]);

    res.status(200).json({ data: purchases, total, page, pageSize });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPurchasAll = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const userCompanyId = (req.user as any)?.company_id;
    const companyIdFilter = req.query.company_id as string | undefined;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    
    const where: any = { purchase_qty: { gt: 0 } };
    const companyId = companyIdFilter || userCompanyId;
    if (companyId) {
      // Include vendor purchases AND transferred stock (product belongs to company, vendor_id may be null)
      where.OR = [
        { vendors: { company_id: companyId } },
        { products: { company_id: companyId } },
      ];
    } else if (!isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }

    const purchases = await prisma.product_purchases.findMany({
      where,
      include: { products: true, vendors: true },
      orderBy: { created_at: 'desc' },
    });
    res.status(200).json(purchases);
  } catch (error) {
    console.error(`Error fetching purchases: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getAllPurchases = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const companyIdFilter = req.query.company_id as string | undefined;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    const userCompanyId = (req.user as any)?.company_id;

    // Admin users see all purchases; regular users only their company's. Optional company_id filter for admin.
    const search = (req.query.search as string || '').trim();
    const whereClause: any = {
      purchase_qty: { gt: 0 },
    };
    if (isMainAdmin) {
      if (companyIdFilter && companyIdFilter.trim() !== '') {
        whereClause.vendors = { company_id: companyIdFilter };
      }
    } else {
      if (userCompanyId) {
        whereClause.vendors = { company_id: userCompanyId };
      } else {
        res.status(400).json({ message: 'Company ID is required' });
        return;
      }
    }
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { container_number: { contains: search, mode: 'insensitive' } },
            { products: { product_name: { contains: search, mode: 'insensitive' } } },
            { products: { product_code: { contains: search, mode: 'insensitive' } } },
            { vendors: { vendor_name: { contains: search, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    const [total, purchases] = await prisma.$transaction([
      prisma.product_purchases.count({ where: whereClause }),
      prisma.product_purchases.findMany({
        where: whereClause,
        include: { products: true, vendors: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      })
    ]);

    res.status(200).json({
      data: purchases,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error(`Error fetching purchases: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getPurchase = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const userCompanyId = (req.user as any)?.company_id;
    const where: any = { purchase_id: parseInt(req.params.id) };
    if (userCompanyId) {
      where.vendors = { company_id: userCompanyId };
    }

    const startDateRaw = typeof req.query.start_date === 'string' ? req.query.start_date.trim() : '';
    const endDateRaw = typeof req.query.end_date === 'string' ? req.query.end_date.trim() : '';
    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    if (endDate && !Number.isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate && !Number.isNaN(startDate.getTime())) dateFilter.gte = startDate;
    if (endDate && !Number.isNaN(endDate.getTime())) dateFilter.lte = endDate;
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const purchase = await prisma.product_purchases.findFirst({
      where,
      include: {
        products: true,
        vendors: true,
        cost_entries: {
          where: hasDateFilter ? { created_at: dateFilter } : undefined,
          orderBy: { created_at: 'asc' },
        },
        payment_entries: {
          where: hasDateFilter ? { created_at: dateFilter } : undefined,
          orderBy: { created_at: 'asc' },
        },
      }
    });
    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    let same_container: any[] = [];
    if (purchase.container_number) {
      same_container = await prisma.product_purchases.findMany({
        where: {
          container_number: purchase.container_number,
          purchase_id: { not: purchase.purchase_id },
          ...(userCompanyId ? { vendors: { company_id: userCompanyId } } : {}),
        },
        include: {
          products: { select: { product_name: true, product_code: true } },
          payment_entries: {
            where: hasDateFilter ? { created_at: dateFilter } : undefined,
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { purchase_id: 'asc' },
      });
    }

    res.status(200).json({ ...purchase, same_container });
  } catch (error) {
    console.error(`Error fetching purchase: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** POST /api/purchases/:id/costs — add an extra cost onto this purchase and record it as a transaction. */
export const addPurchaseCost = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const purchaseId = parseInt(req.params.id, 10);
    const amount = parseFloat(String(req.body.amount ?? '').replace(',', '.'));
    const description = req.body.description ? String(req.body.description).trim() : '';

    if (!purchaseId || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ message: 'Amount greater than 0 is required' });
      return;
    }

    const purchase = await prisma.product_purchases.findUnique({
      where: { purchase_id: purchaseId },
      include: { vendors: true },
    });
    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    const userCompanyId = (req.user as any)?.company_id as string | undefined;
    if (userCompanyId && purchase.vendors?.company_id && purchase.vendors.company_id !== userCompanyId) {
      res.status(403).json({ message: 'You can only add costs to your company purchases' });
      return;
    }

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.purchase_cost_entries.create({
        data: {
          purchase_id: purchaseId,
          amount,
          description: description || null,
        },
      });
      await tx.product_purchases.update({
        where: { purchase_id: purchaseId },
        data: {
          extra_cost: { increment: amount },
          // Extra cost is paid when added — include it in Paid
          paid_amount: { increment: amount },
          updated_at: new Date(),
        },
      });

      const companyId = purchase.vendors?.company_id || userCompanyId;
      const userId = (req.user as any)?.user_id;
      if (companyId && userId) {
        const treasury = await TreasuryService.ensureTreasury(companyId, tx);
        const balance = Number(treasury.balance);
        if (balance >= amount) {
          await TreasuryService.recordMovement(
            companyId,
            amount,
            TransactionAuditType.CREDIT,
            TransactionCategory.EXPENSE,
            userId,
            String(purchaseId),
            description || `Extra cost on purchase #${purchaseId}`,
            tx
          );
        }
      }

      return created;
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('addPurchaseCost error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** POST /api/purchases/:id/selling-price — set product selling price after costs are done. */
export const setPurchaseSellingPrice = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const purchaseId = parseInt(req.params.id, 10);
    const sellingPrice = parseFloat(String(req.body.selling_price ?? req.body.product_price ?? '').replace(',', '.'));

    if (!purchaseId || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      res.status(400).json({ message: 'Selling price must be 0 or greater' });
      return;
    }

    const purchase = await prisma.product_purchases.findUnique({
      where: { purchase_id: purchaseId },
      include: { vendors: true, products: true },
    });
    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }
    if (!purchase.product_id) {
      res.status(400).json({ message: 'This purchase has no product linked' });
      return;
    }

    const userCompanyId = (req.user as any)?.company_id as string | undefined;
    if (userCompanyId && purchase.vendors?.company_id && purchase.vendors.company_id !== userCompanyId) {
      res.status(403).json({ message: 'You can only set price on your company purchases' });
      return;
    }

    const product = await prisma.products.update({
      where: { product_id: purchase.product_id },
      data: { product_price: sellingPrice },
    });

    res.status(200).json({
      message: 'Selling price updated',
      product_id: product.product_id,
      product_price: product.product_price,
    });
  } catch (error) {
    console.error('setPurchaseSellingPrice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const createPurchases = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     // Authorization check
//     console.log(req.user!.role)
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden! You don\'t have permission' });
//       return;
//     }

//     // if (!Array.isArray(req.body)) {
//     //   res.status(400).json({ message: 'Request body must be an array' });
//     //   return;
//     // }

//     // Validate and process each purchase
//     for (const purchase of req.body) {
//       const { product_id, purchase_qty, item_cost, purchase_discount, paid_amount } = purchase;

//       // Validate required fields
//       if (!product_id || !purchase_qty || !item_cost || !purchase_discount || !paid_amount) {
//         res.status(400).json({ message: 'Missing required fields' });
//         return;
//       }

//       // Validate field lengths
//       const stringFields = [
//         purchase_qty.toString(),
//         item_cost.toString(),
//         purchase_discount.toString(),
//         paid_amount.toString()
//       ];
//       if (stringFields.some(field => field.length > 64)) {
//         res.status(400).json({ message: 'Field exceeds 64 character limit' });
//         return;
//       }

//       // Verify product belongs to user's company
//       const product = await prisma.products.findFirst({
//         where: { product_id, company_id: req.user!.company_id }
//       });
//       if (!product) {
//         res.status(403).json({ message: `Product ${product_id} not found` });
//         return;
//       }

//       // Calculate financials
//       const totalCost = purchase_qty * parseFloat(item_cost);
//       const purchase_debt = totalCost - parseFloat(paid_amount) - parseFloat(purchase_discount);

//       if (parseFloat(paid_amount) + parseFloat(purchase_discount) > totalCost) {
//         res.status(400).json({ message: 'Payment exceeds total cost' });
//         return;
//       }

//       // Add calculated fields
//       purchase.purchase_debt = purchase_debt;
//       purchase.expiry_date = new Date(purchase.expiry_date);
//       purchase.manufacture_date = new Date(purchase.manufacture_date);
//     }

//     const createdPurchases = await prisma.product_purchases.createMany({ data: req.body });
//     res.status(201).json(createdPurchases);
//   } catch (error) {
//     console.error(`Error creating purchases: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };





export const createPurchases = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // console.log(req.user!.role);
    // if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
    //   res.status(403).json({ message: "Forbidden! You don't have permission" });
    //   return;
    // }

    // Ensure request body is always treated as an array
    const purchases = Array.isArray(req.body) ? req.body : [req.body];
    const purchasesToCreate: any[] = [];
    const warehouseQuantities: { product_id: number; quantity: number; item_cost: number }[] = [];

    const toNumber = (value: unknown, emptyAsZero = false): number | null => {
      if (value === '' || value === null || value === undefined) {
        return emptyAsZero ? 0 : null;
      }
      const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : null;
    };

    for (const purchase of purchases) {
      const { product_id, purchase_qty, item_cost, purchase_discount, paid_amount, expiry_date, manufacture_date, vendor_id, container_number } = purchase;

      const qty = toNumber(purchase_qty);
      const cost = toNumber(item_cost);
      const discount = toNumber(purchase_discount, true) ?? 0;
      const paid = toNumber(paid_amount, true) ?? 0;
      const productId = Number(product_id);
      const vendorId = Number(vendor_id);

      if (!productId || qty == null || cost == null) {
        res.status(400).json({ message: 'Product, quantity, and cost are required' });
        return;
      }
      if (!vendorId) {
        res.status(400).json({ message: 'Select a vendor' });
        return;
      }
      if (qty <= 0) {
        res.status(400).json({ message: 'Quantity must be greater than 0' });
        return;
      }
      if (cost < 0 || discount < 0 || paid < 0) {
        res.status(400).json({ message: 'Numeric values cannot be negative' });
        return;
      }

      const product = await prisma.products.findUnique({
        where: { product_id: productId }
      });
      if (!product) {
        res.status(403).json({ message: `Product ${productId} not found` });
        return;
      }

      const totalCost = qty * cost;
      const debtValue = totalCost - paid - discount;

      if (paid + discount > totalCost) {
        res.status(400).json({ message: 'Payment exceeds total cost' });
        return;
      }

      const purchaseData: any = {
        purchase_qty: qty,
        item_cost: new Prisma.Decimal(cost),
        purchase_discount: new Prisma.Decimal(discount),
        paid_amount: new Prisma.Decimal(paid),
        purchase_debt: new Prisma.Decimal(debtValue),
        product_id: productId,
        vendor_id: vendorId,
        container_number: container_number ? String(container_number).trim() : null,
        extra_cost: new Prisma.Decimal(0),
      };

      // Add dates only if they exist and are valid
      if (manufacture_date && !isNaN(new Date(manufacture_date).getTime())) {
        purchaseData.manufacture_date = new Date(manufacture_date);
      }
      if (expiry_date && !isNaN(new Date(expiry_date).getTime())) {
        purchaseData.expiry_date = new Date(expiry_date);
      }

      purchasesToCreate.push(purchaseData);
      warehouseQuantities.push({ product_id: productId, quantity: qty, item_cost: cost });
    }

    // Group by product_id for warehouse: total quantity and weighted-average cost (real cost from purchase)
    const productToQtyAndCost: Record<number, { qty: number; costSum: number }> = {};
    for (const w of warehouseQuantities) {
      const pid = w.product_id;
      if (!pid || w.quantity <= 0) continue;
      if (!productToQtyAndCost[pid]) productToQtyAndCost[pid] = { qty: 0, costSum: 0 };
      productToQtyAndCost[pid].qty += w.quantity;
      productToQtyAndCost[pid].costSum += w.quantity * (w.item_cost ?? 0);
    }
    const warehouseAdditions = Object.entries(productToQtyAndCost).map(([productIdStr, v]) => ({
      product_id: parseInt(productIdStr, 10),
      quantity: v.qty,
      unit_cost: v.qty > 0 ? v.costSum / v.qty : 0,
    }));

    // Create purchases and add to default warehouse (purchases go to warehouse only, not company store)
    const result = await prisma.$transaction(async (tx) => {
      const createdRows: any[] = [];
      for (const data of purchasesToCreate) {
        const row = await tx.product_purchases.create({ data });
        createdRows.push(row);
        const paidNow = Number(data.paid_amount);
        if (paidNow > 0) {
          await tx.purchase_payment_entries.create({
            data: {
              purchase_id: row.purchase_id,
              amount: paidNow,
              discount: Number(data.purchase_discount) || 0,
              description: data.container_number
                ? `Initial payment · Container ${data.container_number}`
                : 'Initial payment',
            },
          });
        }
      }
      const createdPurchases = createdRows.length === 1 ? createdRows[0] : { count: createdRows.length };

      // Admin (no company_id): items go to main warehouse. Company users: items go to their company warehouse.
      const userCompanyId = (req.user as any)?.company_id;
      let targetWarehouse = null;
      if (userCompanyId) {
        targetWarehouse = await tx.warehouses.findFirst({
          where: { company_id: userCompanyId, is_active: true },
          orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
        });
      }
      if (!targetWarehouse) {
        // Main warehouse (no company_id) — admin purchases go here, then admin transfers to companies
        targetWarehouse = await tx.warehouses.findFirst({
          where: { company_id: null, is_active: true },
          orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
        });
      }
      if (!targetWarehouse && !userCompanyId) {
        // Admin flow and no main warehouse: create one so purchases have a place to go
        const mainWarehouse = await tx.warehouses.create({
          data: {
            warehouse_name: 'Main Warehouse',
            description: 'Default warehouse for admin purchases. Transfer stock to companies from the Warehouse page.',
            is_active: true,
            is_default: true,
            company_id: null,
          },
        });
        targetWarehouse = mainWarehouse;
      }
      if (!targetWarehouse) {
        targetWarehouse = await tx.warehouses.findFirst({
          where: { is_active: true },
          orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
        });
      }

      if (!targetWarehouse && warehouseQuantities.length > 0) {
        throw new Error('Create a warehouse first. Purchases go to warehouse only.');
      }

      if (targetWarehouse) {
        for (const p of warehouseAdditions) {
          const productId = p.product_id;
          const qty = p.quantity;
          const incomingUnitCost = p.unit_cost;
          if (productId && qty > 0) {
            const existing = await tx.warehouse_stock.findUnique({
              where: {
                warehouse_id_product_id: {
                  warehouse_id: targetWarehouse.warehouse_id,
                  product_id: productId,
                },
              },
            });
            if (existing) {
              const existingQty = Number(existing.quantity);
              const existingCost = Number((existing as any).unit_cost ?? 0);
              const newQty = existingQty + qty;
              const newUnitCost = newQty > 0 ? (existingQty * existingCost + qty * incomingUnitCost) / newQty : incomingUnitCost;
              await tx.warehouse_stock.update({
                where: { stock_id: existing.stock_id },
                data: {
                  quantity: newQty,
                  unit_cost: newUnitCost,
                } as any,
              });
            } else {
              await tx.warehouse_stock.create({
                data: {
                  warehouse_id: targetWarehouse.warehouse_id,
                  product_id: productId,
                  quantity: qty,
                  unit_cost: incomingUnitCost,
                } as any,
              });
            }
          }
        }
      }

      return createdPurchases;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(`Error creating purchases: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// export const updatePurchase = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     // Authorization check
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }

//     const { product_id, ...updateData } = req.body;

//     // Verify existing purchase belongs to company
//     const existingPurchase = await prisma.product_purchases.findFirst({
//       where: {
//         purchase_id: parseInt(req.params.id),
//         products: { company_id: req.user!.company_id }
//       }
//     });
//     if (!existingPurchase) {
//       res.status(404).json({ message: 'Purchase not found' });
//       return;
//     }

//     // Verify new product belongs to company if changing product
//     if (product_id && product_id !== existingPurchase.product_id) {
//       const product = await prisma.products.findFirst({
//         where: { product_id, company_id: req.user!.company_id }
//       });
//       if (!product) {
//         res.status(403).json({ message: 'Invalid product' });
//         return;
//       }
//     }

//     // Update purchase
//     const updatedPurchase = await prisma.product_purchases.update({
//       where: { purchase_id: parseInt(req.params.id) },
//       data: {
//         ...updateData,
//         // Remove these if they're coming from updateData
//         purchase_id: undefined, // Explicitly exclude
//         // Convert dates
//         expiry_date: new Date(updateData.expiry_date),
//         manufacture_date: new Date(updateData.manufacture_date),
//         updated_at: new Date()
//       }
//     });
//     res.status(200).json(updatedPurchase);
//   } catch (error) {
//     console.error(`Error updating purchase: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


export const updatePurchase = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Authorization check
    // if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
    //   res.status(403).json({ message: 'Forbidden' });
    //   return;
    // }

    const { product_id, ...updateData } = req.body;
    const purchaseId = parseInt(req.params.id);

    // Validate numerical inputs
    const numericalFields = [
      'item_cost',
      'purchase_qty',
      'purchase_discount',
      'paid_amount'
    ];

    for (const field of numericalFields) {
      if (updateData[field] && parseFloat(updateData[field]) < 0) {
        res.status(400).json({ message: `${field} cannot be negative` });
        return;
      }
    }

    // Verify existing purchase
    const userCompanyId = (req.user as any)?.company_id;
    const existingPurchase = await prisma.product_purchases.findFirst({
      where: userCompanyId
        ? { purchase_id: purchaseId, vendors: { company_id: userCompanyId } }
        : { purchase_id: purchaseId }
    });

    if (!existingPurchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    // Merge existing and updated values
    const mergedData = {
      item_cost: updateData.item_cost ?? existingPurchase.item_cost,
      purchase_qty: updateData.purchase_qty ?? existingPurchase.purchase_qty,
      purchase_discount: updateData.purchase_discount ?? existingPurchase.purchase_discount,
      paid_amount: updateData.paid_amount ?? existingPurchase.paid_amount,
    };

    // Convert to numbers (allow fractions e.g. 0.3)
    const item_cost = parseFloat(mergedData.item_cost);
    const purchase_qty = parseFloat(String(mergedData.purchase_qty).replace(',', '.'));
    const purchase_discount = parseFloat(mergedData.purchase_discount);
    const paid_amount = parseFloat(mergedData.paid_amount);

    // Calculate totals
    const totalCost = item_cost * purchase_qty;
    const maxAllowedPayment = totalCost - purchase_discount;

    // Validate monetary integrity
    if (purchase_discount > totalCost) {
      res.status(400).json({
        message: `Discount (${purchase_discount}) exceeds total cost (${totalCost})`
      });
      return;
    }

    if (paid_amount > maxAllowedPayment) {
      res.status(400).json({
        message: `Paid amount (${paid_amount}) exceeds net total (${maxAllowedPayment})`
      });
      return;
    }

    // Calculate debt
    const purchase_debt = maxAllowedPayment - paid_amount;
    if (purchase_debt < 0) {
      res.status(400).json({
        message: 'Debt calculation resulted in negative value'
      });
      return;
    }

    // Verify product belongs to company if changing
    if (product_id && product_id !== existingPurchase.product_id) {
      const product = await prisma.products.findFirst({
        where: {
          product_id: parseInt(product_id),
          product_purchases: {
            some: {
              vendors: { company_id: req.user!.company_id }
            }
          }
        }
      });
      if (!product) {
        res.status(403).json({ message: 'Invalid product' });
        return;
      }
    }

    // Update purchase with validated data
    const updatedPurchase = await prisma.product_purchases.update({
      where: { purchase_id: purchaseId },
      data: {
        ...updateData,
        item_cost,
        purchase_qty,
        purchase_discount,
        paid_amount,
        purchase_debt: purchase_debt.toString(),
        expiry_date: new Date(updateData.expiry_date || existingPurchase.expiry_date),
        manufacture_date: new Date(updateData.manufacture_date || existingPurchase.manufacture_date),
        updated_at: new Date(),
        product_id: product_id ? parseInt(product_id) : existingPurchase.product_id
      }
    });

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error(`Error updating purchase: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const deletePurchase = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const purchaseId = parseInt(req.params.id);
    if (isNaN(purchaseId)) {
      res.status(400).json({ message: 'Invalid purchase id' });
      return;
    }

    const userCompanyId = (req.user as any)?.company_id as string | undefined;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin =
      userRoles.includes('admin') ||
      userRoles.includes('superAdmin') ||
      userRoles.includes('super_admin');

    const purchase = await prisma.product_purchases.findFirst({
      where: userCompanyId
        ? { purchase_id: purchaseId, vendors: { company_id: userCompanyId } }
        : { purchase_id: purchaseId }
      ,
      include: { vendors: { select: { company_id: true } } }
    });
    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    // 1) Strict relation guard: this purchase cannot be deleted once sales exist on this batch.
    const relatedSalesCount = await prisma.product_sales.count({
      where: { purchase_id: purchase.purchase_id },
    });
    if (relatedSalesCount > 0) {
      res.status(400).json({
        message: 'Cannot delete purchase with existing sales records'
      });
      return;
    }

    // Use company scope for company users; admin checks globally.
    const companyIdForTransferCheck = purchase.vendors?.company_id ?? userCompanyId ?? null;

    // 2) Block deletion if this product has non-cancelled transfer history.
    // This protects inventory movement history from being broken.
    if (companyIdForTransferCheck && purchase.product_id) {
      const relatedTransfer = await prisma.warehouse_transfers.findFirst({
        where: {
          product_id: purchase.product_id,
          ...(isMainAdmin ? {} : { company_id: companyIdForTransferCheck }),
          status: { not: 'CANCELLED' },
        },
        select: { transfer_id: true, status: true },
      });
      if (relatedTransfer) {
        res.status(400).json({
          message: 'Cannot delete purchase: item has been transferred to store. Void it instead.',
        });
        return;
      }
    }

    // 3) If remaining batch qty is 0, this batch has already been consumed by downstream flows.
    if (Number(purchase.purchase_qty) === 0) {
      res.status(400).json({
        message: 'Cannot delete purchase that has been sold out or transferred (quantity is 0). Void it instead.'
      });
      return;
    }

    // 4) Block deletion if this product has already been sold from warehouse/store stock path.
    // Even when product_sales.purchase_id is null, stock_id sales indicate downstream relation.
    if (purchase.product_id) {
      const soldFromStock = await prisma.product_sales.findFirst({
        where: {
          stock_id: { not: null },
          warehouse_stock: {
            product_id: purchase.product_id,
            ...(isMainAdmin || !companyIdForTransferCheck ? {} : { warehouse: { company_id: companyIdForTransferCheck } }),
          },
        },
        select: { sale_id: true },
      });
      if (soldFromStock) {
        res.status(400).json({
          message: 'Cannot delete purchase: related stock has sales records. Void it instead.',
        });
        return;
      }
    }

    await prisma.product_purchases.delete({
      where: { purchase_id: purchaseId }
    });
    res.status(204).json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error(`Error deleting purchase: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const payPurchaseDebt = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ message: "Invalid payment amount" });
      return;
    }

    const purchase = await prisma.product_purchases.findUnique({
      where: { purchase_id: Number(id) }
    });

    if (!purchase) {
      res.status(404).json({ message: "Purchase not found" });
      return;
    }

    if (purchase.purchase_debt.lte(0)) {
      res.status(400).json({ message: "No payable remaining" });
      return;
    }

    const paymentAmount = new Prisma.Decimal(amount);

    if (paymentAmount.gt(purchase.purchase_debt)) {
      res.status(400).json({
        message: "Payment exceeds remaining payable",
      });
      return;
    }

    const newPaidAmount = purchase.paid_amount.plus(paymentAmount);
    const newDebt = purchase.purchase_debt.minus(paymentAmount);

    // Update
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      const updated = await tx.product_purchases.update({
        where: { purchase_id: Number(id) },
        data: {
          paid_amount: newPaidAmount,
          purchase_debt: newDebt.lte(0)
            ? new Prisma.Decimal(0)
            : newDebt,
        },
      });
      await tx.purchase_payment_entries.create({
        data: {
          purchase_id: Number(id),
          amount: paymentAmount,
          discount: 0,
          description: purchase.container_number
            ? `Debt payment · Container ${purchase.container_number}`
            : 'Debt payment',
        },
      });
      return updated;
    });

    res.status(200).json({
      message: newDebt.lte(0)
        ? "Purchase fully paid"
        : "Partial payment successful",
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Pay purchase error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
