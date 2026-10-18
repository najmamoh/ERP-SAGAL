// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, use, bodyValidator, queryValidator } from "../decorators";
// import { checkCompanyHasThisSale } from "../middlewares/receivables";

// enum Receivables {
//   sale_id = 'sale_id',
//   new_received_amount = 'new_received_amount',
//   new_sale_discount = 'new_sale_discount',
//   total_price = 'total_price'
// }

// @controller('/api/receivables')
// class ReciebaleController {
//   @get('/products')
//   @queryValidator('company_id')
//   async findReceivables (req: Request, res: Response) {
//     const receivables = await prisma.$queryRaw`SELECT customer_name, customer_phone, customer_address, product_code, product_name, sale_id, sale_qty, item_price, received_amount, sale_discount, 
//     sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END AS "total_price",
//     received_amount + sale_discount AS "total_paid_and_discount", 
//     sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END - received_amount - sale_discount AS "credit",
//     product_sales.created_at AS "sale_date"
//     FROM product_sales
//     JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//     JOIN products ON product_purchases.product_id = products.product_id
//     LEFT JOIN customers ON product_sales.customer_id = customers.customer_id
//     JOIN companies ON products.company_id = companies.company_id
//     WHERE companies.company_id = ${req.query.company_id} AND sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END - received_amount - sale_discount > '0'`;
//     res.status(200).send(receivables);
//   }
//   @post('/products')
//   @bodyValidator(Receivables.sale_id, Receivables.new_received_amount, Receivables.new_sale_discount)
//   @queryValidator('company_id')
//   @use(checkCompanyHasThisSale)
//   async createReceivable (req: Request, res: Response) {
//     const { sale_id, new_sale_discount, new_received_amount} = req.body;

//     const sale = await prisma.product_sales.findUnique({
//       where: { sale_id }
//     })
//     let totalPrice = 0;
//     if (sale) {
//       totalPrice = (sale.sale_qty * Number(sale.item_price)) - Number(sale.sale_discount)
//     } else {
//       return res.status(404).send({ message: 'Sale not found.' })
//     }
//     // total received amount: previous amount + current amount
//     const totalReceivedAmount = Number(sale.received_amount) + parseFloat(new_received_amount);
//     const newSaleDiscount = Number(sale.sale_discount) + Number(new_sale_discount);
//     // validate total received amount and sale discount
//     if (totalReceivedAmount < 0 || totalReceivedAmount > totalPrice) {
//       const status = totalReceivedAmount < 0 ? `${totalReceivedAmount} - old-recieved-amount + new-received-amount must be greater than 0` : `${totalReceivedAmount} - old-received-amount + new-received-amount must be less than total price`
//       return res.status(400).send({ message: status })
//     } else if (newSaleDiscount < 0 || newSaleDiscount > totalPrice) {
//       const status = newSaleDiscount < 0 ? `${newSaleDiscount} - new-sale-discount must be greater than 0` : `${new_sale_discount} - new-sale-discount must be less than total price`
//       return res.status(400).send({ message: status })
//     }

//     const receivables = await prisma.product_sales.update({
//       where: { sale_id },
//       data: {
//         received_amount: totalReceivedAmount,
//         sale_discount: newSaleDiscount,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(receivables);
//   }
// }

// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { CustomUserRequest } from "../middlewares";
// import { Prisma } from '@prisma/client';

// export const getAllReceivables = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const pageSize = parseInt(req.query.pageSize as string) || 20;
//     const skip = (page - 1) * pageSize;

//     const companyId = req.user!.company_id;

//     // Base WHERE clause with company ID and credit > 0
//     const whereClause = Prisma.sql`
//   WHERE companies.company_id = ${companyId}
//   AND (
//     product_sales.sale_qty * product_sales.item_price + 
//     CASE 
//       WHEN products.taxable = true AND product_sales.taxable_sale = true 
//       THEN product_sales.sale_qty * product_sales.item_price * (companies.tax_percentage / 100)
//       ELSE 0::money 
//     END 
//     - product_sales.received_amount - product_sales.sale_discount
//   ) > '0'::money
// `;

//     // Count total receivables
//     const countQuery = Prisma.sql`
//       SELECT COUNT(*)::integer as total
//       FROM product_sales
//       JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//       JOIN products ON product_purchases.product_id = products.product_id
//       JOIN companies ON products.company_id = companies.company_id
//       LEFT JOIN customers ON product_sales.customer_id = customers.customer_id
//       ${whereClause}
//     `;

//     // Get paginated receivables data
//     const dataQuery = Prisma.sql`
//       SELECT 
//         customers.customer_name,
//         customers.customer_phone,
//         customers.customer_address,
//         products.product_code,
//         products.product_name,
//         product_sales.sale_id,
//         product_sales.sale_qty,
//         product_sales.item_price,
//         product_sales.received_amount,
//         product_sales.sale_discount,
//         product_sales.taxable_sale,
//         (product_sales.sale_qty * product_sales.item_price) +
//         CASE 
//           WHEN products.taxable AND product_sales.taxable_sale 
//           THEN product_sales.sale_qty * product_sales.item_price * (companies.tax_percentage / 100)
//           ELSE 0 
//         END AS "total_price",
//         (product_sales.received_amount + product_sales.sale_discount) AS "total_paid_and_discount",
//         (product_sales.sale_qty * product_sales.item_price) +
//         CASE 
//           WHEN products.taxable AND product_sales.taxable_sale 
//           THEN product_sales.sale_qty * product_sales.item_price * (companies.tax_percentage / 100)
//           ELSE 0 
//         END 
//         - product_sales.received_amount - product_sales.sale_discount AS "credit",
//         product_sales.created_at AS "sale_date"
//       FROM product_sales
//       JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//       JOIN products ON product_purchases.product_id = products.product_id
//       JOIN companies ON products.company_id = companies.company_id
//       LEFT JOIN customers ON product_sales.customer_id = customers.customer_id
//       ${whereClause}
//       ORDER BY product_sales.created_at DESC
//       LIMIT ${pageSize} OFFSET ${skip}
//     `;

//     const [totalResult, receivables] = await prisma.$transaction([
//       prisma.$queryRaw<{ total: number }[]>(countQuery),
//       prisma.$queryRaw<any[]>(dataQuery)
//     ]);

//     const total = totalResult[0]?.total || 0;

//     res.status(200).json({
//       data: receivables,
//       total,
//       page,
//       pageSize,
//       totalPages: Math.ceil(total / pageSize)
//     });
//   } catch (error) {
//     console.error(`Error fetching receivables: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const updateReceivable = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     // Authorization check
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden! You don\'t have permission' });
//       return;
//     }

//     const saleId = parseInt(req.params.id);
//     const { new_received_amount, new_sale_discount } = req.body;

//     // Validate request body
//     if (typeof new_received_amount === 'undefined' || typeof new_sale_discount === 'undefined') {
//       res.status(400).json({ message: 'Missing required fields: new_received_amount and new_sale_discount' });
//       return;
//     }

//     // Validate numeric values
//     if (isNaN(Number(new_received_amount)) || isNaN(Number(new_sale_discount))) {
//       res.status(400).json({ message: 'Invalid numeric values' });
//       return;
//     }

//     // Get existing sale with company verification
//     const existingSale = await prisma.product_sales.findFirst({
//       where: { 
//         sale_id: saleId,
//         product_purchases: {
//           products: { company_id: req.user!.company_id }
//         }
//       },
//       include: {
//         product_purchases: {
//           include: {
//             products: {
//               include: {
//                 companies: true
//               }
//             }
//           }
//         }
//       }
//     });

//     if (!existingSale) {
//       res.status(404).json({ message: 'Sale not found or access denied' });
//       return;
//     }

//     // Validate nested relations
//     if (!existingSale.product_purchases || 
//         !existingSale.product_purchases.products ||
//         !existingSale.product_purchases.products.companies) {
//       res.status(400).json({ message: 'Incomplete sale data - missing purchase or product information' });
//       return;
//     }

//     // Calculate total price with tax using Prisma Decimal
//     const saleQty = new Prisma.Decimal(existingSale.sale_qty);
//     const itemPrice = new Prisma.Decimal(existingSale.item_price);
//     const totalPrice = saleQty.mul(itemPrice);
    
//     let tax = new Prisma.Decimal(0);
//     // if (existingSale.taxable_sale && existingSale.product_purchases.products.taxable) {
//     //   const taxPercentage = new Prisma.Decimal(
//     //     existingSale.product_purchases.products.companies.tax_percentage
//     //   );
//     //   tax = totalPrice.mul(taxPercentage).div(100);
//     // }
    
//     const totalPriceWithTax = totalPrice.add(tax);

//     // Calculate new amounts with Decimal
//     const currentReceived = new Prisma.Decimal(existingSale.received_amount);
//     const currentDiscount = new Prisma.Decimal(existingSale.sale_discount);
    
//     const newReceived = currentReceived.add(new Prisma.Decimal(new_received_amount));
//     const newDiscount = currentDiscount.add(new Prisma.Decimal(new_sale_discount));
//     const totalPaid = newReceived.add(newDiscount);

//     // Validate new values
//     if (newReceived.lt(0) || newReceived.gt(totalPriceWithTax)) {
//       res.status(400).json({ 
//         message: `Received amount must be between 0 and ${totalPriceWithTax}` 
//       });
//       return;
//     }

//     if (newDiscount.lt(0) || newDiscount.gt(totalPriceWithTax)) {
//       res.status(400).json({ 
//         message: `Discount amount must be between 0 and ${totalPriceWithTax}` 
//       });
//       return;
//     }

//     if (totalPaid.gt(totalPriceWithTax)) {
//       res.status(400).json({ 
//         message: `Total paid amount (received + discount) cannot exceed ${totalPriceWithTax}`
//       });
//       return;
//     }

//     // Update the sale
//     const updatedSale = await prisma.product_sales.update({
//       where: { sale_id: saleId },
//       data: {
//         received_amount: newReceived,
//         sale_discount: newDiscount,
//         updated_at: new Date()
//       }
//     });

//     res.status(200).json(updatedSale);
//   } catch (error) {
//     console.error(`Error updating receivable: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




// import { Request, Response } from 'express';
// import { prisma } from '../prisma';
// import { CustomUserRequest } from '../middlewares';

// export const getReceivables = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }

//     const receivables = await prisma.$queryRaw`SELECT customer_name, customer_phone, customer_address, product_code, product_name, sale_id, sale_qty, item_price, received_amount, sale_discount, 
//     sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END AS "total_price",
//     received_amount + sale_discount AS "total_paid_and_discount", 
//     sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END - received_amount - sale_discount AS "credit",
//     product_sales.created_at AS "sale_date"
//     FROM product_sales
//     JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//     JOIN products ON product_purchases.product_id = products.product_id
//     LEFT JOIN customers ON product_sales.customer_id = customers.customer_id
//     JOIN companies ON products.company_id = companies.company_id
//     WHERE companies.company_id = ${req.user!.company_id} AND sale_qty * item_price + CASE WHEN taxable = true AND taxable_sale = true THEN sale_qty * item_price * (tax_percentage / 100) ELSE '0' END - received_amount - sale_discount > '0'`;
//     res.status(200).json(receivables);
//   } catch (error) {
//     console.error(`Error fetching receivables: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const createReceivable = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }

//     const { sale_id, new_sale_discount, new_received_amount } = req.body;
//    if(!sale_id||!new_sale_discount||!new_received_amount){
//     res.status(400).json({
//       message: 'Please Enter valid data.',
//     });
//     return;
//    }
//     // Fetch sale details from the database
//     const sale = await prisma.product_sales.findUnique({ where: { sale_id } });
//     if (!sale) {
//       res.status(404).json({ message: 'Sale not found.' });
//       return;
//     }

//     // Convert values to numbers to ensure calculations are correct
//     const saleQty = Number(sale.sale_qty);
//     const itemPrice = Number(sale.item_price);
//     const currentDiscount = Number(sale.sale_discount);
//     const currentReceived = Number(sale.received_amount);
    
//     // Calculate total price and remaining balance
//     const totalPrice = saleQty * itemPrice;
//     const owedAmount = totalPrice - currentDiscount - currentReceived;

//     const newReceivedAmount = parseFloat(new_received_amount);
//     const newSaleDiscount = parseFloat(new_sale_discount);

//     // Check for negative values
//     if (newReceivedAmount < 0 || newSaleDiscount < 0) {
//       res.status(400).json({
//         message: 'Received amount and discount cannot be negative.',
//       });
//       return;
//     }

//     // Check if combined new payments exceed owed amount
//     if (newReceivedAmount + newSaleDiscount > owedAmount) {
//       res.status(400).json({
//         message: `The sum of new received amount (${newReceivedAmount}) and discount (${newSaleDiscount}) exceeds the remaining balance of ${owedAmount}.`,
//       });
//       return;
//     }

//     // Calculate updated values
//     const updatedReceivedAmount = currentReceived + newReceivedAmount;
//     const updatedDiscount = currentDiscount + newSaleDiscount;

//     // Update the sale record with the new values
//     const updatedReceivable = await prisma.product_sales.update({
//       where: { sale_id },
//       data: {
//         received_amount: updatedReceivedAmount,
//         sale_discount: updatedDiscount,
//         updated_at: new Date(),
//       },
//     });

//     res.status(200).json(updatedReceivable);
//   } catch (error) {
//     console.error(`Error updating receivable: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };





import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';
import { Prisma } from '@prisma/client';
import { TransactionAuditType, TransactionCategory } from '@prisma/client';
import { TreasuryService } from '../services/TreasuryService';

/** Parse money / Decimal / string so Prisma math matches DB (avoids wrong portions, e.g. 105 vs 100). */
function moneyDecimal(v: unknown): Prisma.Decimal {
  if (v == null) return new Prisma.Decimal(0);
  if (v instanceof Prisma.Decimal) return v;
  if (typeof v === 'object' && v !== null && typeof (v as { toNumber?: () => number }).toNumber === 'function') {
    return new Prisma.Decimal((v as { toNumber: () => number }).toNumber());
  }
  const cleaned = String(v).replace(/[^0-9.-]/g, '') || '0';
  return new Prisma.Decimal(cleaned);
}

export const getReceivables = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const isMainAdmin = !user?.company_id && (user?.roles || []).some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    // Company users: only their company (from token). Admin: filter by query company_id or return empty.
    const search = (req.query.search as string || '').trim();
    const companyId = user?.company_id
      ? user.company_id
      : (req.query.company_id as string) || null;

    if (!companyId) {
      if (isMainAdmin) {
        res.status(200).json([]);
        return;
      }
      res.status(400).json({ message: 'Company ID is required.' });
      return;
    }

    // Get invoices with receivables: use invoice's stored total_paid_amount so each invoice shows its real balance due.
    // (Previously we summed by customer+created_at which merged all same-day sales and produced wrong totals.)
    const receivables = await prisma.$queryRaw<any[]>`
      SELECT 
        i.id AS "invoice_id",
        i.invoice_number,
        i.issue_date AS "sale_date",
        i.due_date,
        i.status AS "invoice_status",
        i.total_amount AS "total_due",
        i.tax_amount,
        i.total_paid_amount,
        i.total_discount_amount,
        c.customer_id,
        c.customer_name,
        c.customer_phone,
        c.customer_address,
        COALESCE(i.total_paid_amount, 0::money) AS "total_paid",
        COALESCE(i.total_discount_amount, 0::money) AS "total_discount",
        COALESCE(i.total_paid_amount, 0::money) AS "total_paid_and_discount",
        (i.total_amount - COALESCE(i.total_paid_amount, 0::money)) AS "receivable_amount",
        (
          SELECT json_agg(
            json_build_object(
              'product_code', p.product_code,
              'product_name', p.product_name,
              'quantity', ii.quantity,
              'unit_price', ii.unit_price,
              'discount', ii.discount
            )
          )
          FROM "InvoiceItem" ii
          JOIN products p ON ii.product_id = p.product_id
          WHERE ii.invoice_id = i.id
        ) AS "items"
      FROM "Invoice" i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      WHERE i.company_id = ${companyId as string}
        AND i.status != 'VOID'
        AND i.status != 'DRAFT'
        AND i.sale_id IS NOT NULL
        AND (i.total_amount - COALESCE(i.total_paid_amount, 0::money))::numeric > 0.01
        ${search
          ? Prisma.sql`AND (
              i.invoice_number ILIKE ${'%' + search + '%'}
              OR COALESCE(c.customer_name, '') ILIKE ${'%' + search + '%'}
            )`
          : Prisma.empty}
      ORDER BY i.created_at DESC NULLS LAST, i.id DESC
    `;

    // Map to frontend-expected shape: total_price, received_amount, credit (debt). List all products with comma.
    const mapped = receivables.map((r: any) => {
      const totalDue = Number(r.total_due ?? 0);
      const totalPaid = Number(r.total_paid ?? 0);
      const receivable = Number(r.receivable_amount ?? 0);
      const itemsArr = Array.isArray(r.items) ? r.items : (r.items ? [r.items] : []);
      const productNames = itemsArr.map((it: any) => it?.product_name).filter(Boolean);
      const productNameList = productNames.length > 0 ? productNames.join(', ') : `Invoice ${r.invoice_number ?? ''}`;
      const totalQty = itemsArr.reduce((sum: number, it: any) => sum + (Number(it?.quantity) || 0), 0);
      const firstProduct = itemsArr[0];
      return {
        ...r,
        sale_id: r.invoice_id,
        total_price: String(totalDue),
        received_amount: String(totalPaid),
        total_paid_and_discount: String(totalPaid + Number(r.total_discount ?? 0)),
        credit: String(receivable),
        product_name: productNameList,
        product_code: firstProduct?.product_code ?? '',
        sale_qty: totalQty || 1,
      };
    });

    // Server-side summary from same data so Total / Received / Debt are real and trustable
    const summary = mapped.reduce(
      (acc, row) => {
        acc.totalSales += parseFloat(row.total_price || '0');
        acc.totalReceived += parseFloat(row.received_amount || '0');
        acc.totalDebt += parseFloat(row.credit || '0');
        return acc;
      },
      { totalSales: 0, totalReceived: 0, totalDebt: 0 }
    );

    res.status(200).json({
      data: mapped,
      total: mapped.length,
      page: 1,
      pageSize: mapped.length || 20,
      summary: {
        totalSales: Math.round(summary.totalSales * 100) / 100,
        totalReceived: Math.round(summary.totalReceived * 100) / 100,
        totalDebt: Math.round(summary.totalDebt * 100) / 100,
      },
    });
  } catch (error) {
    console.error(`Error fetching receivables: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const createReceivable = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { invoice_id, sale_id, new_sale_discount, new_received_amount } = req.body;
    
    // Accept either invoice_id or sale_id (for backward compatibility)
    if (!invoice_id && !sale_id) {
      res.status(400).json({ message: 'Please provide either invoice_id or sale_id.' });
      return;
    }

    if (new_sale_discount == null || new_received_amount == null) {
      res.status(400).json({ message: 'Please enter valid data (new_sale_discount and new_received_amount are required).' });
      return;
    }

    const newReceivedAmount = new Prisma.Decimal(new_received_amount);
    const newSaleDiscount = new Prisma.Decimal(new_sale_discount);

    // Validate inputs
    if (newReceivedAmount.lt(0) || newSaleDiscount.lt(0)) {
      res.status(400).json({ message: 'Values cannot be negative.' });
      return;
    }

    const companyId = (req.body.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (body or auth).' });
      return;
    }

    let invoice;
    // Check if sale_id is actually a UUID (invoice_id format) - happens when frontend sends invoice_id as sale_id
    const isUUID = sale_id && typeof sale_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sale_id);
    
    if (invoice_id || isUUID) {
      const idToUse = invoice_id || (isUUID ? sale_id : null);
      invoice = await prisma.invoice.findFirst({
        where: { id: idToUse as string, company_id: companyId },
        include: { customer: true }
      });
    } else if (sale_id) {
      // sale_id is the Invoice.sale_id foreign key (integer)
      invoice = await prisma.invoice.findFirst({
        where: { sale_id: Number(sale_id), company_id: companyId },
        include: { customer: true }
      });
    }

    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found.' });
      return;
    }

    // Find anchor sale (the one linked to invoice)
    const anchorSale = invoice.sale_id 
      ? await prisma.product_sales.findUnique({
          where: { sale_id: invoice.sale_id }
        })
      : null;

    if (!anchorSale) {
      res.status(404).json({ message: 'Anchor sale not found for this invoice.' });
      return;
    }

    // Find all sales that belong to this invoice: invoice.sale_id is the first; others have consecutive sale_ids and same invoice (no other invoice between).
    const allInvoiceStarts = await prisma.invoice.findMany({
      where: { company_id: companyId, sale_id: { not: null } },
      select: { sale_id: true },
      orderBy: { sale_id: 'asc' },
    });
    const starts = (allInvoiceStarts.map((i) => i.sale_id).filter(Boolean) as number[]).sort((a, b) => a - b);
    const nextStart = starts.find((s) => s > (invoice.sale_id ?? 0)) ?? 999999999;
    const transactionSales = await prisma.product_sales.findMany({
      where: {
        sale_id: { gte: invoice.sale_id!, lt: nextStart },
      },
      orderBy: { sale_id: 'asc' },
    });

    if (transactionSales.length === 0) {
      res.status(404).json({ message: 'No sales found for this transaction.' });
      return;
    }

    // Calculate current totals from all sales in transaction (cash only)
    const currentTotalReceived = transactionSales.reduce(
      (sum, sale) => sum.plus(moneyDecimal(sale.received_amount)),
      new Prisma.Decimal(0)
    );

    // Line net = qty × unit price − line discount (same as sales report). Use moneyDecimal for DB money types.
    const lineNetAmount = (sale: (typeof transactionSales)[0]) =>
      moneyDecimal(sale.sale_qty).mul(moneyDecimal(sale.item_price)).minus(moneyDecimal(sale.sale_discount));

    const lineNets = transactionSales.map((s) => lineNetAmount(s));
    const totalInvoiceNet = lineNets.reduce((sum, n) => sum.plus(n), new Prisma.Decimal(0));

    const totalDue = moneyDecimal(invoice.total_amount);

    // Invoice total is net; only subtract cash received (do not subtract line discount again).
    const remainingBalance = totalDue.minus(currentTotalReceived);

    const newTotalPayment = newReceivedAmount.plus(newSaleDiscount);
    if (newTotalPayment.gt(remainingBalance)) {
      const remStr = remainingBalance.toFixed ? remainingBalance.toFixed(2) : String(remainingBalance);
      res.status(400).json({
        message: `Total payments exceed remaining balance of ${remStr}.`,
      });
      return;
    }

    /**
     * Split payment across lines by line-net weight. Last line gets remainder so sums match exactly
     * (avoids 100 → 105 from Decimal rounding / bad ratios).
     */
    const buildShares = (): { saleId: number; addR: Prisma.Decimal; addD: Prisma.Decimal }[] => {
      const n = transactionSales.length;
      if (n === 1) {
        return [
          {
            saleId: transactionSales[0].sale_id as number,
            addR: newReceivedAmount,
            addD: newSaleDiscount,
          },
        ];
      }
      if (totalInvoiceNet.gt(0)) {
        let sumR = new Prisma.Decimal(0);
        let sumD = new Prisma.Decimal(0);
        const out: { saleId: number; addR: Prisma.Decimal; addD: Prisma.Decimal }[] = [];
        for (let i = 0; i < n; i++) {
          const sid = transactionSales[i].sale_id as number;
          if (i === n - 1) {
            out.push({
              saleId: sid,
              addR: newReceivedAmount.minus(sumR),
              addD: newSaleDiscount.minus(sumD),
            });
          } else {
            const w = lineNets[i].div(totalInvoiceNet);
            const addR = newReceivedAmount.mul(w);
            const addD = newSaleDiscount.mul(w);
            sumR = sumR.plus(addR);
            sumD = sumD.plus(addD);
            out.push({ saleId: sid, addR, addD });
          }
        }
        return out;
      }
      // Fallback: equal split with remainder on last line
      const equal = new Prisma.Decimal(1).div(n);
      let sumR = new Prisma.Decimal(0);
      let sumD = new Prisma.Decimal(0);
      const out: { saleId: number; addR: Prisma.Decimal; addD: Prisma.Decimal }[] = [];
      for (let i = 0; i < n; i++) {
        const sid = transactionSales[i].sale_id as number;
        if (i === n - 1) {
          out.push({
            saleId: sid,
            addR: newReceivedAmount.minus(sumR),
            addD: newSaleDiscount.minus(sumD),
          });
        } else {
          const addR = newReceivedAmount.mul(equal);
          const addD = newSaleDiscount.mul(equal);
          sumR = sumR.plus(addR);
          sumD = sumD.plus(addD);
          out.push({ saleId: sid, addR, addD });
        }
      }
      return out;
    };

    const paymentShares = buildShares();

    await prisma.$transaction(async (tx) => {
      for (const sh of paymentShares) {
        const saleRow = transactionSales.find((s) => s.sale_id === sh.saleId);
        if (!saleRow) continue;
        await tx.product_sales.update({
          where: { sale_id: sh.saleId },
          data: {
            received_amount: moneyDecimal(saleRow.received_amount).plus(sh.addR),
            sale_discount: moneyDecimal(saleRow.sale_discount).plus(sh.addD),
            updated_at: new Date(),
          },
        });
      }

      // Calculate new totals after payment
      const updatedSales = await tx.product_sales.findMany({
        where: {
          sale_id: { in: transactionSales.map(s => s.sale_id) }
        }
      });

      const newTotalReceived = updatedSales.reduce(
        (sum, sale) => sum.plus(moneyDecimal(sale.received_amount)),
        new Prisma.Decimal(0)
      );
      const newTotalDiscount = updatedSales.reduce(
        (sum, sale) => sum.plus(moneyDecimal(sale.sale_discount)),
        new Prisma.Decimal(0)
      );

      // Align with receivable list: balance due = total_amount − total_paid_amount (cash only)
      const newRemaining = totalDue.minus(newTotalReceived);

      let status: 'PAID' | 'PARTIAL' | 'ISSUED';
      if (newTotalReceived.gte(totalDue)) {
        status = 'PAID';
      } else if (newTotalReceived.gt(0)) {
        status = 'PARTIAL';
      } else {
        status = 'ISSUED';
      }

      // Update invoice status and stored totals so receivable list shows correct balance
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status,
          total_paid_amount: newTotalReceived,
          total_discount_amount: newTotalDiscount,
        },
      });

      // Record treasury movement if payment received
      if (newReceivedAmount.gt(0)) {
        await TreasuryService.recordMovement(
          companyId,
          newReceivedAmount,
          TransactionAuditType.DEBIT,
          TransactionCategory.SALE,
          (req.user as any)?.user_id,
          `INV-${invoice.invoice_number}`,
          `Receivable payment for invoice ${invoice.invoice_number}`,
          tx
        );
      }
    });

    // Return updated invoice with all sales
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json({
      invoice: updatedInvoice,
      message: 'Receivable updated successfully'
    });
  } catch (error) {
    console.error(`Error updating receivable: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** Get service receivables (service_sales with credit > 0) */
export const getServiceReceivables = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const serviceSales = await prisma.service_sales.findMany({
      where: { company_id: companyId },
      include: {
        customer: true,
        items: { include: { service: { include: { Job: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
    const withCredit = serviceSales.filter((s) => {
      const total = new Prisma.Decimal(s.total_amount).minus(s.sale_discount);
      const credit = total.minus(s.received_amount);
      return credit.gt(0);
    });
    const data = withCredit.map((s) => {
      const total = new Prisma.Decimal(s.total_amount).minus(s.sale_discount);
      const credit = total.minus(s.received_amount);
      return {
        ...s,
        total_price: total.toString(),
        total_paid_and_discount: new Prisma.Decimal(s.received_amount).plus(s.sale_discount).toString(),
        credit: credit.toString(),
        sale_date: s.created_at,
        type: 'service',
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching service receivables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** Add payment to a service sale (receivable) */
export const createServiceReceivable = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { service_sale_id, new_received_amount, new_sale_discount } = req.body;
    if (!service_sale_id || new_received_amount == null || new_sale_discount == null) {
      res.status(400).json({ message: 'service_sale_id, new_received_amount, and new_sale_discount are required' });
      return;
    }
    const companyId = (req.body.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'company_id is required (body or auth).' });
      return;
    }
    const sale = await prisma.service_sales.findFirst({
      where: { id: service_sale_id, company_id: companyId },
      include: { Invoice: true },
    });
    if (!sale) {
      res.status(404).json({ message: 'Service sale not found' });
      return;
    }
    const totalPrice = new Prisma.Decimal(sale.total_amount).minus(sale.sale_discount);
    const currentReceived = new Prisma.Decimal(sale.received_amount);
    const currentDiscount = new Prisma.Decimal(sale.sale_discount);
    const newReceived = currentReceived.plus(new_received_amount);
    const newDiscount = currentDiscount.plus(new_sale_discount);
    const totalPaid = newReceived.plus(newDiscount);
    if (totalPaid.gt(totalPrice)) {
      res.status(400).json({
        message: `Total payments exceed balance. Remaining: ${totalPrice.minus(currentReceived).minus(currentDiscount)}`,
      });
      return;
    }
    if (Number(new_received_amount) < 0 || Number(new_sale_discount) < 0) {
      res.status(400).json({ message: 'Values cannot be negative' });
      return;
    }
    const paymentAmount = new Prisma.Decimal(new_received_amount);
    await prisma.$transaction(async (tx) => {
      await tx.service_sales.update({
        where: { id: service_sale_id },
        data: {
          received_amount: newReceived,
          sale_discount: newDiscount,
          updated_at: new Date(),
        },
      });
      if (sale.Invoice[0]) {
        let status: 'PAID' | 'PARTIAL' | 'ISSUED' = newReceived.gte(totalPrice.minus(newDiscount)) ? 'PAID' : newReceived.gt(0) ? 'PARTIAL' : 'ISSUED';
        await tx.invoice.update({
          where: { id: sale.Invoice[0].id },
          data: { status },
        });
      }
      if (paymentAmount.gt(0)) {
        await TreasuryService.recordMovement(
          companyId,
          paymentAmount,
          TransactionAuditType.DEBIT,
          TransactionCategory.SERVICE_SALE,
          (req.user as any)?.user_id,
          `SVC-${service_sale_id}`,
          `Receivable payment for service sale ${service_sale_id}`,
          tx
        );
      }
    });
    const updated = await prisma.service_sales.findUnique({
      where: { id: service_sale_id },
      include: { customer: true, items: { include: { service: true } } },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating service receivable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
