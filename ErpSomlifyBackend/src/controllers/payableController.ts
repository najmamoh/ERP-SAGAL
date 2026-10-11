// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, use, bodyValidator, queryValidator } from "../decorators";
// import { checkCompanyHasThisPurchase } from "../middlewares";

// enum Payable {
//   purchase_id = 'purchase_id',
//   new_paid_amount = 'new_paid_amount',
//   new_purchase_discount = 'new_purchase_discount'
// }

// @controller('/api/payables')
// class RecievableController {
//   @get('/products')
//   @queryValidator('company_id')
//   async findPayable (req: Request, res: Response) {
//     const payables = await prisma.$queryRaw`SELECT vendor_name, vendor_phone, vendor_address,product_code, product_name, purchase_id, purchase_qty, item_cost, paid_amount, purchase_discount, purchase_qty * item_cost AS "total_cost", paid_amount + purchase_discount AS "total_paid_and_discount", purchase_debt AS "debt", product_purchases.created_at
// FROM product_purchases
// JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
// JOIN products ON product_purchases.product_id = products.product_id
// WHERE products.company_id = ${req.query.company_id} AND purchase_debt > '0'`
//     res.status(200).send(payables);
//   }

//   @post('/products')
//   @bodyValidator(Payable.purchase_id, Payable.new_paid_amount, Payable.new_purchase_discount)
//   @use(checkCompanyHasThisPurchase)
//   async createPayable (req: Request, res: Response) {
//     const { purchase_id, new_paid_amount } = req.body;
//     const purchase = await prisma.product_purchases.findUnique({
//       where: { purchase_id }
//     })
//     let totalCost = 0;
//     if (purchase) {
//       totalCost = (purchase.purchase_qty * Number(purchase.item_cost)) - Number(purchase.purchase_discount);
//     } else {
//       return res.status(404).send({ message: 'Purchase not found.' })
//     }
//     // make new purchase discount
//     const new_purchase_discount = Number(purchase.purchase_discount) + Number(req.body.new_purchase_discount);

//     // validate TotalPaid and purchase_discount
//     const paidAmount = Number(purchase.paid_amount) + Number(new_paid_amount)
//     if (paidAmount < 0 || paidAmount > totalCost) {
//       const status = paidAmount < 0 ? `${paidAmount} - Total paid amount is less than 0` : `${paidAmount} Paid amount is greater than total cost`
//       return res.status(404).send({ message: status })
//     } else if (new_purchase_discount < 0 || new_purchase_discount > totalCost) {
//       const status = new_purchase_discount < 0 ? `${new_purchase_discount} - new_purchase_discount is less than 0` : `${new_purchase_discount} new_purchase_discount is greater than total cost`
//       return res.status(404).send({ message: status })
//     }

//     const payables = await prisma.product_purchases.update({
//       where: { purchase_id: parseInt(purchase_id)},
//       data: {
//         paid_amount: paidAmount,
//         purchase_discount: new_purchase_discount,
//         purchase_debt: totalCost - paidAmount,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(payables);
//   }
// }


import { Prisma } from '@prisma/client';


import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

export const findPayable = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');

    // Company users see only their payables (incl. transfer purchases); admin sees all
    const raw = !isMainAdmin && userCompanyId
      ? await prisma.$queryRaw<any[]>`
          SELECT COALESCE(vendors.vendor_name, 'No vendor') AS vendor_name,
                 COALESCE(vendors.vendor_phone, '') AS vendor_phone,
                 COALESCE(vendors.vendor_address, '') AS vendor_address,
                 product_code, product_name, purchase_id, purchase_qty, item_cost,
                 paid_amount, purchase_discount,
                 (purchase_qty * item_cost)::numeric AS "total_cost",
                 (paid_amount + purchase_discount)::numeric AS "total_paid_and_discount",
                 purchase_debt::numeric AS "debt",
                 product_purchases.created_at,
                 vendors.company_id AS "company_id"
          FROM product_purchases
          LEFT JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
          JOIN products ON product_purchases.product_id = products.product_id
          WHERE purchase_debt::numeric > 0 AND vendors.company_id = ${userCompanyId}
          ORDER BY product_purchases.created_at DESC`
      : await prisma.$queryRaw<any[]>`
          SELECT COALESCE(vendors.vendor_name, 'No vendor') AS vendor_name,
                 COALESCE(vendors.vendor_phone, '') AS vendor_phone,
                 COALESCE(vendors.vendor_address, '') AS vendor_address,
                 product_code, product_name, purchase_id, purchase_qty, item_cost,
                 paid_amount, purchase_discount,
                 (purchase_qty * item_cost)::numeric AS "total_cost",
                 (paid_amount + purchase_discount)::numeric AS "total_paid_and_discount",
                 purchase_debt::numeric AS "debt",
                 product_purchases.created_at,
                 vendors.company_id AS "company_id"
          FROM product_purchases
          LEFT JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
          JOIN products ON product_purchases.product_id = products.product_id
          WHERE purchase_debt::numeric > 0
          ORDER BY product_purchases.created_at DESC`;

    // Map to plain values so frontend always gets strings/numbers (Decimal/Money can serialize oddly)
    const payables = raw.map((row: any) => ({
      vendor_name: row.vendor_name ?? '',
      vendor_phone: row.vendor_phone ?? '',
      vendor_address: row.vendor_address ?? '',
      product_code: row.product_code ?? '',
      product_name: row.product_name ?? '',
      purchase_id: Number(row.purchase_id),
      purchase_qty: row.purchase_qty != null ? Number(row.purchase_qty) : 0,
      item_cost: row.item_cost != null ? String(Number(row.item_cost)) : '0',
      paid_amount: row.paid_amount != null ? String(Number(row.paid_amount)) : '0',
      purchase_discount: row.purchase_discount != null ? String(Number(row.purchase_discount)) : '0',
      total_cost: row.total_cost != null ? String(Number(row.total_cost)) : '0',
      total_paid_and_discount: row.total_paid_and_discount != null ? String(Number(row.total_paid_and_discount)) : '0',
      debt: row.debt != null ? String(Number(row.debt)) : '0',
      created_at: row.created_at,
      company_id: row.company_id ?? null,
    }));

    res.status(200).json(payables);
  } catch (error) {
    console.error(`Error fetching payables: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const createPayable = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden! You dont have permission' });
//       return;
//     }

//     const { purchase_id, new_paid_amount, new_purchase_discount } = req.body;

//     if (!purchase_id || new_paid_amount === undefined || new_purchase_discount === undefined) {
//       res.status(400).json({ message: 'Missing required fields' });
//       return;
//     }

//     const purchase = await prisma.product_purchases.findUnique({
//       where: { purchase_id: Number(purchase_id) },
//       include: { products: true }
//     });

//     if (!purchase) {
//       res.status(404).json({ message: 'Purchase not found' });
//       return;
//     }

//     if (purchase.products!.company_id !== req.user!.company_id) {
//       res.status(403).json({ message: 'Forbidden! Purchase does not belong to your company' });
//       return;
//     }

//     const totalCost = (purchase.purchase_qty * Number(purchase.item_cost)) - Number(purchase.purchase_discount);
//     const newPaidAmount = Number(purchase.paid_amount) + Number(new_paid_amount);
//     const newPurchaseDiscount = Number(purchase.purchase_discount) + Number(new_purchase_discount);

//     if (newPaidAmount < 0 || newPaidAmount > totalCost) {
//       const message = newPaidAmount < 0 ? 'Paid amount cannot be negative' : 'Paid amount exceeds total cost';
//       res.status(400).json({ message });
//       return;
//     }

//     if (newPurchaseDiscount < 0 || newPurchaseDiscount > totalCost) {
//       const message = newPurchaseDiscount < 0 ? 'Discount cannot be negative' : 'Discount exceeds total cost';
//       res.status(400).json({ message });
//       return;
//     }

//     const updatedPurchase = await prisma.product_purchases.update({
//       where: { purchase_id: Number(purchase_id) },
//       data: {
//         paid_amount: newPaidAmount,
//         purchase_discount: newPurchaseDiscount,
//         purchase_debt: totalCost - newPaidAmount,
//         updated_at: new Date()
//       }
//     });

//     res.status(200).json(updatedPurchase);
//   } catch (error) {
//     console.error(`Error updating payable: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



export const createPayable = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const userRoles = (req.user as any)?.roles || [];
    const canPay = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (!canPay) {
      res.status(403).json({ message: 'Forbidden! You do not have permission to pay payables.' });
      return;
    }

    const { purchase_id, new_paid_amount, new_purchase_discount } = req.body;

    if (!purchase_id || new_paid_amount === undefined || new_purchase_discount === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Convert and validate input values
    const newPaidAmount = Number(new_paid_amount);
    const newPurchaseDiscount = Number(new_purchase_discount);

    if (newPaidAmount < 0 || newPurchaseDiscount < 0) {
      res.status(400).json({ message: 'Values cannot be negative' });
      return;
    }

    const purchase = await prisma.product_purchases.findUnique({
      where: { purchase_id: Number(purchase_id) },
      include: { products: true, vendors: true }
    });

    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    // Calculate financial values
    const totalCost = Number(purchase.purchase_qty) * Number(purchase.item_cost);
    const existingPaid = Number(purchase.paid_amount);
    const existingDiscount = Number(purchase.purchase_discount);
    const currentDebt = totalCost - existingPaid - existingDiscount;

    // Financial integrity checks
    if (newPaidAmount > currentDebt) {
      res.status(400).json({
        message: `New payment (${newPaidAmount}) exceeds remaining debt of ${currentDebt}`,
        maxAllowed: currentDebt
      });
      return;
    }

    if (newPurchaseDiscount > currentDebt) {
      res.status(400).json({
        message: `New discount (${newPurchaseDiscount}) exceeds remaining debt of ${currentDebt}`,
        maxAllowed: currentDebt
      });
      return;
    }

    if (newPaidAmount + newPurchaseDiscount > currentDebt) {
      res.status(400).json({
        message: `Combined payment+discount (${newPaidAmount + newPurchaseDiscount}) exceeds debt ${currentDebt}`,
        maxAllowed: currentDebt
      });
      return;
    }

    // Update purchase records and save payment history for Purchase Details
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      const updated = await tx.product_purchases.update({
        where: { purchase_id: Number(purchase_id) },
        data: {
          paid_amount: existingPaid + newPaidAmount,
          purchase_discount: existingDiscount + newPurchaseDiscount,
          purchase_debt: currentDebt - newPaidAmount - newPurchaseDiscount,
          updated_at: new Date()
        }
      });

      if (newPaidAmount > 0 || newPurchaseDiscount > 0) {
        await tx.purchase_payment_entries.create({
          data: {
            purchase_id: Number(purchase_id),
            amount: newPaidAmount,
            discount: newPurchaseDiscount,
            description: purchase.container_number
              ? `Debt payment · Container ${purchase.container_number}`
              : 'Debt payment',
          },
        });
      }

      return updated;
    });

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error(`Error updating payable: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

