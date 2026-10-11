// import { Request, Response } from "express";
// import { prisma } from '../prisma';
// import { controller, get, queryValidator } from "../decorators";

// @controller('/api/reports')
// class Reports {
//   @get('/sales')
//   @queryValidator('company_id', 'start_date', 'end_date')
//   async sales (req: Request, res: Response) {
//     let start_date = new Date();
//     let end_date = new Date();
//     if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
//        start_date = new Date(req.query.start_date);
//        end_date = new Date(req.query.end_date);
//     }

//     if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
//       res.status(400).send({ message: 'start_date or end_date are incrorrect!' })
//     }
    
//     const result = await prisma.$queryRaw`SELECT sale_id, sale_qty, item_cost, item_price, sale_discount, received_amount, product_code, product_name
//     FROM product_sales
//     JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//     JOIN products ON product_purchases.product_id = products.product_id
//     WHERE company_id = ${req.query.company_id} AND product_sales.created_at BETWEEN ${start_date} AND ${end_date}`
//     res.status(200).send(result);
//   }
//   @get('/expenses')
//   @queryValidator('company_id', 'start_date', 'end_date')
//   async expenses (req: Request, res: Response) {
//     let start_date: Date;
//     let end_date: Date;
//     if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
//        start_date = new Date(req.query.start_date);
//        end_date = new Date(req.query.end_date);
//     } else {
//       return res.status(400).send({ message: 'incorrect start_date and end_date' })
//     }

//     if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
//       res.status(400).send({ message: 'start_date or end_date are incrorrect!' })
//     }
//     let company_id;
//     if (typeof req.query.company_id == 'string') { company_id = req.query.company_id }
//     const salaryExpenses = await prisma.$queryRaw`SELECT *
//     FROM salaries
//     JOIN employees ON salaries.employee_id = employees.employee_id
//     WHERE company_id = ${company_id} AND salaries.date BETWEEN ${start_date} AND ${end_date}`
//     const otherExpenses = await prisma.$queryRaw`SELECT *
//     FROM other_expenses
//     WHERE company_id = ${company_id} AND other_expenses.date BETWEEN ${start_date} AND ${end_date}`
//     res.send({ salaryExpenses, otherExpenses });
//   }
//   @get('/purchases')
//   @queryValidator('company_id', 'start_date', 'end_date')
//   async purchases (req: Request, res: Response) {
//     let start_date: Date;
//     let end_date: Date;
//     if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
//        start_date = new Date(req.query.start_date);
//        end_date = new Date(req.query.end_date);
//     } else {
//       return res.status(400).send({ message: 'incorrect start_date and end_date' })
//     }

//     if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
//       res.status(400).send({ message: 'start_date or end_date are incrorrect!' })
//     }
    
//     let company_id;
//     if (typeof req.query.company_id == 'string') { company_id = req.query.company_id }
//     const purchases = await prisma.products.findMany({
//       where: {
//         company_id
//       },
//       include: {
//         product_purchases: {
//           where: {
//             created_at: {
//               gte: new Date(start_date),
//               lte: new Date(end_date)
//             }
//           },
//           include: {
//             product_sales: true
//           }
//         }
//       }
//     })
//     res.status(200).send({ purchases })
//   }
  
//   @get('/incomestatement')
//   @queryValidator('company_id', 'start_date', 'end_date')
//   async incomeStatement (req: Request, res: Response) {
//     let start_date: Date;
//     let end_date: Date;
//     if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
//        start_date = new Date(req.query.start_date);
//        end_date = new Date(req.query.end_date);
//     } else {
//       return res.status(400).send({ message: 'incorrect start_date and end_date' })
//     }

//     if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
//       res.status(400).send({ message: 'start_date or end_date are incrorrect!' })
//     }
//     let company_id;
//     if (typeof req.query.company_id == 'string') { company_id = req.query.company_id }

//     const salesInfo = await prisma.$queryRaw`SELECT SUM(sale_qty * item_price - sale_discount) AS "total_sales", SUM(received_amount) AS "cash_sales", SUM(sale_qty * item_cost) AS "total_sales_cost"
//     FROM product_sales
//     JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
//     JOIN products ON product_purchases.product_id = products.product_id
//     WHERE company_id = ${company_id} AND product_sales.created_at BETWEEN ${start_date} AND ${end_date}
//     GROUP BY company_id`;
    
//     const salaryExpenses = await prisma.$queryRaw`SELECT SUM(paid_amount) AS "total_salaries_expenses"
//     FROM salaries
//     JOIN employees ON salaries.employee_id = employees.employee_id
//     WHERE company_id = ${company_id} AND salaries.created_at BETWEEN ${start_date} AND ${end_date}
//     GROUP BY company_id`;

//     const otherExpenes = await prisma.$queryRaw`SELECT SUM(item_qty * item_cost) AS "total_other_expenses"
//     FROM other_expenses
//     WHERE company_id = ${company_id} AND other_expenses.created_at BETWEEN ${start_date} AND ${end_date}
//     GROUP BY company_id`
//     res.status(200).send({ salesInfo, salaryExpenses, otherExpenes })
//   }
// }


import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';
import { aggregateProductSalesRevenueAndCogs } from '../utils/saleCogsAggregation';

function getReportCompanyId(req: CustomUserRequest): string | null {
  const user = req.user as any;
  const userRoles = user?.roles || [];
  const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
  
  // For company users (non-admin), always use their company_id from auth
  // For admin users, allow query param to override (for viewing other companies)
  if (!isMainAdmin && user?.company_id) {
    return user.company_id;
  }
  
  // Admin can specify company_id in query, otherwise use their own if they have one
  return (req.query.company_id as string) || user?.company_id || null;
}

/**
 * SALES REPORT – SINGLE SOURCE OF TRUTH
 * All amounts are calculated here; frontend must display backend values only.
 *
 * RULES:
 * 1. COST — always from **purchase data** tied to the product (never from `products.product_cost` alone):
 *    - **Primary:** `product_sales.purchase_id` → `product_purchases` → **item_cost** (same row links to `products` via `product_id`).
 *    - **Else:** `product_sales.unit_cost` (snapshot saved at sale).
 *    - **Else (warehouse / no batch link):** `warehouse_stock.unit_cost`, or latest `product_purchases.item_cost` for that `product_id` in the company.
 *    Per line: line_cost = unit_cost × quantity.
 *
 * 2. SALE PRICE (item_price): Per line — (qty × unit sale price) − line discount (each product_sales row).
 *
 * 3. DISCOUNT (sale_discount): Per line — that line’s sale_discount.
 *
 * 4. RECEIVED (received_amount): Per line — that line’s received_amount (stored on each product_sales row).
 *
 * 5. GROSS PROFIT (accrual): line_net − line_cost — margin on the sale at agreed price (before cash timing).
 *
 * 6. PROFIT / CASH MARGIN: received_amount − line_cost — cash in minus purchase cost (your example: qty 2 × $5 cost = $10,
 *    received $24 ⇒ profit $14). Use this for “cash vs inventory cost” in the period.
 *
 * 7. All monetary output rounded to 2 decimals via roundMoney() to avoid float errors.
 */
const roundMoney = (n: number): number => Math.round(n * 100) / 100;

export const getSalesReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = getReportCompanyId(req);
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const { start_date, end_date, page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const startDate = new Date(start_date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end_date as string);
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Fetch all product_sales for the company in date range (no pagination yet — needed for invoice grouping).
    const salesWhere: any = {
      created_at: { gte: startDate, lte: endDate },
      OR: [
        { product_purchases: { vendors: { company_id: companyId } } },
        { company_users: { company_id: companyId } },
      ],
    };

    // For each sale: find the purchase of that sale (when sale.purchase_id is set) and include it so we have that sale's cost from the purchase (item_cost).
    const allSales = await prisma.product_sales.findMany({
      where: salesWhere,
      include: {
        product_purchases: {
          include: { products: true },
        },
        warehouse_stock: {
          include: { product: true },
        },
        customers: {
          select: { customer_name: true, customer_phone: true, customer_address: true },
        },
        company_users: { select: { full_name: true } },
        Invoice: {
          select: {
            id: true,
            invoice_number: true,
            status: true,
            total_amount: true,
            total_paid_amount: true,
            total_discount_amount: true,
            sale_id: true,
            /** Line items keep product_id when stock_id/purchase_id were cleared after sale */
            items: {
              select: { id: true, product_id: true },
              orderBy: { id: 'asc' },
            },
          },
        },
      },
      orderBy: { sale_id: 'asc' },
    });

    // Find invoice "anchor" sale_ids so we can group consecutive sales into the same transaction.
    // Invoice.sale_id points to the FIRST product_sales of a multi-item checkout.
    const saleIds = allSales.map((s) => s.sale_id).filter((id) => id != null) as number[];
    const invoiceAnchors =
      saleIds.length > 0
        ? await prisma.invoice.findMany({
            where: { sale_id: { in: saleIds } },
            select: { sale_id: true },
            orderBy: { sale_id: 'asc' },
          })
        : [];
    const anchorSet = invoiceAnchors.map((inv) => inv.sale_id as number).sort((a, b) => a - b);

    // Group consecutive sales that share the same invoice anchor into one transaction row.
    const groups: (typeof allSales)[] = [];
    for (const sale of allSales) {
      const sid = sale.sale_id as number;
      // Find which invoice anchor "owns" this sale (largest anchor ≤ sid)
      const txAnchor = [...anchorSet].reverse().find((a) => a <= sid);
      const lastGroup = groups[groups.length - 1];
      const lastGroupAnchor = lastGroup?.length
        ? [...anchorSet].reverse().find((a) => a <= (lastGroup[0].sale_id as number))
        : undefined;

      if (lastGroup && lastGroup.length > 0 && txAnchor === lastGroupAnchor) {
        lastGroup.push(sale);
      } else {
        groups.push([sale]);
      }
    }

    // Convert any value (Prisma Decimal, PostgreSQL money string "$5.00", number, string) to number.
    const toNum = (v: unknown): number => {
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      // Prisma.Decimal object
      if (typeof v === 'object') {
        if (typeof (v as any).toNumber === 'function') return (v as any).toNumber();
        if ('$numberDecimal' in (v as any)) return parseFloat((v as any).$numberDecimal) || 0;
      }
      // PostgreSQL money type comes back as a string like "$5.00" or "-$1,234.56"
      // Strip everything except digits, dots and leading minus, then parse.
      const cleaned = String(v).replace(/[^0-9.\-]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // Collect product IDs for latest-purchase cost map: purchase line, warehouse, and invoice lines
    // (after a stock row is deleted, stock_id is null but InvoiceItem still has product_id).
    const productIdsNeedingCost = new Set<number>();
    for (const sale of allSales) {
      const pp = sale.product_purchases as any;
      const ws = (sale as any).warehouse_stock;
      if (pp?.products?.product_id != null) productIdsNeedingCost.add(Number(pp.products.product_id));
      if (ws != null) {
        const pid = ws.product_id ?? ws?.product?.product_id;
        if (pid != null) productIdsNeedingCost.add(Number(pid));
      }
      const inv = (sale as any).Invoice;
      if (Array.isArray(inv) && inv[0]?.items?.length) {
        for (const it of inv[0].items as { product_id?: number }[]) {
          if (it?.product_id != null) productIdsNeedingCost.add(Number(it.product_id));
        }
      }
    }

    /** Latest `product_purchases.item_cost` per product (prefer vendor linked to this company). */
    const latestPurchaseCostByProduct: Record<number, number> = {};
    const ingestPurchaseRows = (
      rows: Array<{
        product_id: number | null;
        item_cost: unknown;
        vendors?: { company_id: string | null } | null;
      }>,
      strictCompanyOnly: boolean
    ) => {
      for (const p of rows) {
        const pid = p.product_id;
        if (pid == null || latestPurchaseCostByProduct[pid] !== undefined) continue;
        const v = p.vendors;
        if (strictCompanyOnly) {
          if (!v || v.company_id !== companyId) continue;
        } else {
          if (v && v.company_id != null && v.company_id !== companyId) continue;
        }
        latestPurchaseCostByProduct[pid] = toNum(p.item_cost);
      }
    };

    if (productIdsNeedingCost.size > 0) {
      const ids = Array.from(productIdsNeedingCost);
      const strictPurchases = await prisma.product_purchases.findMany({
        where: {
          product_id: { in: ids },
          vendors: { company_id: companyId },
        },
        select: { product_id: true, item_cost: true, created_at: true, vendors: { select: { company_id: true } } },
        orderBy: { created_at: 'desc' },
      });
      ingestPurchaseRows(strictPurchases, true);

      const stillMissing = ids.filter((id) => latestPurchaseCostByProduct[id] === undefined);
      if (stillMissing.length > 0) {
        const loose = await prisma.product_purchases.findMany({
          where: { product_id: { in: stillMissing } },
          select: { product_id: true, item_cost: true, created_at: true, vendors: { select: { company_id: true } } },
          orderBy: { created_at: 'desc' },
        });
        ingestPurchaseRows(loose, false);
      }
    }

    /**
     * Resolve unit COGS for one sale line.
     *
     * Data model: `products` 1—N `product_purchases` (each batch has `item_cost` + `product_id`).
     * `product_sales.purchase_id` points at the **batch** sold from → cost = that row’s `item_cost`.
     * If there is no purchase link, we still try to resolve cost through **product** → latest company purchase.
     * Optional `productIdFromInvoice` comes from InvoiceItem order when stock/purchase links are missing.
     */
    const resolveUnitCostForLine = (sale: (typeof allSales)[0], productIdFromInvoice?: number | null): number => {
      let unitCost = 0;

      // A) Direct relation: sale → product_purchases (batch) → item_cost; purchase row also ties to product via product_id
      const pp = sale.product_purchases as { item_cost?: unknown; products?: { product_id?: number } | null } | null;
      if (pp != null) {
        unitCost = toNum(pp.item_cost);
      }

      // B) Snapshot on the sale line (written when selling from stock/purchase)
      if (unitCost === 0 && (sale as any).unit_cost != null) {
        unitCost = toNum((sale as any).unit_cost);
      }

      const ws = (sale as any).warehouse_stock;
      const prod = ws?.product;
      const productIdFromStock = ws?.product_id ?? prod?.product_id;

      // C) Warehouse line: stock unit cost, or product → latest product_purchases.item_cost for this company
      if (unitCost === 0 && ws) {
        const stockCost = ws.unit_cost != null ? toNum(ws.unit_cost) : 0;
        if (stockCost > 0) {
          unitCost = stockCost;
        } else if (productIdFromStock != null) {
          const fallback = latestPurchaseCostByProduct[Number(productIdFromStock)];
          if (fallback != null) unitCost = fallback;
        }
      }

      // D) Still zero: resolve by product through purchase table (latest batch cost for this product in company)
      if (unitCost === 0) {
        const pidFromPurchase = pp?.products?.product_id;
        const anyProductId = productIdFromStock ?? pidFromPurchase;
        if (anyProductId != null) {
          const fallback = latestPurchaseCostByProduct[Number(anyProductId)];
          if (fallback != null) unitCost = fallback;
        }
      }

      // E) Invoice line product_id (typical after warehouse row deleted: stock_id null, purchase_id null, but invoice items remain)
      if (unitCost === 0 && productIdFromInvoice != null && productIdFromInvoice > 0) {
        const fallback = latestPurchaseCostByProduct[Number(productIdFromInvoice)];
        if (fallback != null) unitCost = fallback;
      }

      return unitCost;
    };

    const resolveProductNameCode = (sale: (typeof allSales)[0]): { name: string; code: string } => {
      let product_name = '';
      let product_code = 'N/A';
      if (sale.product_purchases != null) {
        const pp = sale.product_purchases as any;
        if (pp.products) {
          product_name = String(pp.products.product_name ?? '').trim();
          product_code = String(pp.products.product_code ?? '').trim() || 'N/A';
        }
      }
      const ws = (sale as any).warehouse_stock;
      const prod = ws?.product;
      if (prod && !product_name) {
        product_name = String(prod.product_name ?? '').trim();
        product_code = String(prod.product_code ?? '').trim() || 'N/A';
      }
      if (!product_name) product_name = `Unknown (Sale #${sale.sale_id})`;
      return { name: product_name, code: product_code };
    };

    // One row per sale line (item): watch, mobile, etc. — not one row per whole invoice.
    const allFormatted = groups
      .flatMap((group) => {
        const sortedGroup = [...group].sort((a, b) => Number(a.sale_id) - Number(b.sale_id));
        const first = sortedGroup[0];
        const invoiceRecord = sortedGroup.find((s) => (s.Invoice as any)?.length > 0)?.Invoice as any;
        const invoice = Array.isArray(invoiceRecord) ? invoiceRecord[0] : null;
        // Soft-delete behavior: keep sale rows in DB but hide VOID invoices from reports.
        if (invoice?.status === 'VOID') return [];
        const invItems = (invoice?.items ?? []) as Array<{ product_id?: number }>;

        return sortedGroup.map((sale, lineIndex) => {
          const cust = (sale as any).customers as any;
          const cu = (sale as any).company_users as any;
          const qty = toNum(sale.sale_qty);
          const productIdFromInvoice =
            invItems[lineIndex]?.product_id != null ? Number(invItems[lineIndex].product_id) : null;
          const unitCost = resolveUnitCostForLine(sale, productIdFromInvoice);
          const lineCost = roundMoney(qty * unitCost);
          const unitSalePrice = toNum(sale.item_price);
          const lineDiscount = toNum(sale.sale_discount);
          const lineNet = roundMoney(qty * unitSalePrice - lineDiscount);
          const received = toNum(sale.received_amount);
          const netPrice = lineNet;
          /** Accrual: revenue (after discount) minus COGS for this line */
          const grossProfit = roundMoney(netPrice - lineCost);
          /** Cash: money received minus purchase cost (real cash vs inventory cost for the line) */
          const profit = roundMoney(received - lineCost);
          const balanceDue = roundMoney(Math.max(0, netPrice - received));
          const { name: product_name, code: product_code } = resolveProductNameCode(sale);
          const dateVal = sale.created_at;

          return {
            sale_id: sale.sale_id,
            /** First line of the invoice (multi-item checkout anchor) */
            invoice_sale_id: invoice?.sale_id ?? first.sale_id,
            invoice_id: invoice?.id ?? null,
            invoice_number: invoice?.invoice_number ?? null,
            status: invoice?.status ?? null,
            sale_qty: qty,
            /** Per-unit cost from purchase (or stock / latest purchase when no purchase link) */
            unit_purchase_cost: roundMoney(unitCost).toFixed(2),
            /** Total purchase cost for this line = unit_purchase_cost × qty */
            line_purchase_cost: lineCost.toFixed(2),
            /** Same as line_purchase_cost (legacy field for grids) */
            item_cost: lineCost.toFixed(2),
            /** Per-unit selling price on this sale line */
            unit_sale_price: roundMoney(unitSalePrice).toFixed(2),
            /** Line sale total after discount (qty × unit sale price − line discount) */
            item_price: lineNet.toFixed(2),
            sale_discount: roundMoney(lineDiscount).toFixed(2),
            received_amount: roundMoney(received).toFixed(2),
            gross_profit: grossProfit.toFixed(2),
            profit: profit.toFixed(2),
            balance_due: balanceDue.toFixed(2),
            product_name: product_name,
            product_code: product_code,
            customer_name: cust ? String(cust.customer_name ?? 'N/A') : 'N/A',
            customer_phone: cust ? String(cust.customer_phone ?? '') : '',
            customer_address: cust ? String(cust.customer_address ?? '') : '',
            sold_by: cu ? String(cu.full_name ?? 'N/A') : 'N/A',
            created_at:
              dateVal instanceof Date
                ? dateVal.toISOString()
                : dateVal
                ? new Date(dateVal as any).toISOString()
                : '',
          };
        });
      })
      .reverse();

    const total = allFormatted.length;
    const paginatedData = allFormatted.slice(skip, skip + pageSizeNum);

    // Report-level totals (100% from backend – single source of truth for trust)
    let sumCost = 0;
    let sumPrice = 0;
    let sumDiscount = 0;
    let sumReceived = 0;
    let sumProfitCash = 0;
    let sumGrossProfit = 0;
    let sumBalanceDue = 0;
    for (const row of allFormatted) {
      sumCost += parseFloat(row.item_cost);
      sumPrice += parseFloat(row.item_price);
      sumDiscount += parseFloat(row.sale_discount);
      sumReceived += parseFloat(row.received_amount);
      sumProfitCash += parseFloat(row.profit);
      sumGrossProfit += parseFloat(row.gross_profit);
      sumBalanceDue += parseFloat(row.balance_due);
    }

    res.status(200).json({
      data: paginatedData,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: skip + pageSizeNum < total,
      report_summary: {
        total_cost: roundMoney(sumCost).toFixed(2),
        total_sale_price: roundMoney(sumPrice).toFixed(2),
        total_discount: roundMoney(sumDiscount).toFixed(2),
        total_received: roundMoney(sumReceived).toFixed(2),
        /** Sum of (received − line cost) — cash vs purchase cost in period */
        total_profit: roundMoney(sumProfitCash).toFixed(2),
        /** Sum of (line net − line cost) — gross margin on sales at invoice value */
        total_gross_profit: roundMoney(sumGrossProfit).toFixed(2),
        total_balance_due: roundMoney(sumBalanceDue).toFixed(2),
        row_count: total,
      },
    });
  } catch (error) {
    console.error(`Error fetching sales report: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};



type CountResult = Array<{ total: number }>;

export const getExpensesReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = getReportCompanyId(req);
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const { start_date, end_date } = req.query;

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Expenses report returns ALL rows in the date range (no LIMIT) so totals match the database.
    const [salaryTotal, salarySum, salaryExpenses] = await prisma.$transaction([
      prisma.$queryRaw<CountResult>`
        SELECT COUNT(*)::integer as total
        FROM salaries
        JOIN employees ON salaries.employee_id = employees.employee_id
        WHERE employees.company_id = ${companyId}
          AND salaries.date BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<{ total_amount: number | string | null }[]>`
        SELECT COALESCE(SUM(salaries.paid_amount::numeric), 0) AS total_amount
        FROM salaries
        JOIN employees ON salaries.employee_id = employees.employee_id
        WHERE employees.company_id = ${companyId}
          AND salaries.date BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw`
        SELECT *
        FROM salaries
        JOIN employees ON salaries.employee_id = employees.employee_id
        WHERE employees.company_id = ${companyId}
          AND salaries.date BETWEEN ${startDate} AND ${endDate}
        ORDER BY salaries.date ASC, salaries.salary_id ASC
      `
    ]);

    const [otherTotal, otherSum, otherExpenses] = await prisma.$transaction([
      prisma.$queryRaw<CountResult>`
        SELECT COUNT(*)::integer as total
        FROM other_expenses
        WHERE company_id = ${companyId}
          AND date BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<{
        total_amount: number | string | null;
        total_paid: number | string | null;
        total_unpaid: number | string | null;
      }[]>`
        SELECT
          COALESCE(SUM(item_qty * item_cost::numeric), 0) AS total_amount,
          COALESCE(SUM(paid_amount::numeric), 0) AS total_paid,
          COALESCE(
            SUM(item_qty * item_cost::numeric) - SUM(paid_amount::numeric),
            0
          ) AS total_unpaid
        FROM other_expenses
        WHERE company_id = ${companyId}
          AND date BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw`
        SELECT *
        FROM other_expenses
        WHERE company_id = ${companyId}
          AND date BETWEEN ${startDate} AND ${endDate}
        ORDER BY date ASC, expense_id ASC
      `
    ]);

    const salaryCount = salaryTotal[0]?.total ?? 0;
    const otherCount = otherTotal[0]?.total ?? 0;
    const salaryTotalAmount = Number(salarySum[0]?.total_amount ?? 0);
    const otherTotalAmount = Number(otherSum[0]?.total_amount ?? 0);
    const otherTotalPaid = Number(otherSum[0]?.total_paid ?? 0);
    const otherTotalUnpaid = Number(otherSum[0]?.total_unpaid ?? 0);

    res.status(200).json({
      salaryExpenses: {
        data: salaryExpenses,
        total: salaryCount,
        totalAmount: salaryTotalAmount,
        page: 1,
        pageSize: salaryCount,
        hasMore: false
      },
      otherExpenses: {
        data: otherExpenses,
        total: otherCount,
        totalAmount: otherTotalAmount,
        totalPaid: otherTotalPaid,
        totalUnpaid: otherTotalUnpaid,
        page: 1,
        pageSize: otherCount,
        hasMore: false
      }
    });
  } catch (error) {
    console.error(`Error fetching expenses report: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPurchasesReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = getReportCompanyId(req);
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const { start_date, end_date, page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Filter purchases by vendor's company_id (products don't have company_id anymore)
    const [totalResult, purchases] = await prisma.$transaction([
      prisma.$queryRaw<CountResult>`
        SELECT COUNT(DISTINCT products.product_id)::integer as total
        FROM products
        JOIN product_purchases ON products.product_id = product_purchases.product_id
        JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
        WHERE vendors.company_id = ${companyId}
          AND product_purchases.created_at BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.products.findMany({
        where: {
          product_purchases: {
            some: {
              created_at: { gte: startDate, lte: endDate },
              vendors: {
                company_id: companyId
              }
            }
          }
        },
        include: {
          product_purchases: {
            where: {
              created_at: { gte: startDate, lte: endDate },
              vendors: {
                company_id: companyId
              }
            },
            include: { 
              product_sales: true,
              vendors: {
                select: {
                  vendor_name: true,
                  company_id: true
                }
              }
            }
          }
        },
        skip,
        take: pageSizeNum,
      })
    ]);

    const total = totalResult[0]?.total || 0;

    const hasMore = skip + pageSizeNum < total;

    res.status(200).json({
      data: purchases,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore
    });
  } catch (error) {
    console.error(`Error fetching purchases report: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Income Statement remains the same as it returns aggregated data

export const getIncomeStatement = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = getReportCompanyId(req);
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const { start_date, end_date } = req.query;

    const startDate = new Date(start_date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end_date as string);
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const {
      totalSalesRevenue: total_sales,
      costOfGoodsSold: total_sales_cost,
      totalCashReceived: cash_sales,
      totalBalanceDue: balance_due_sales,
    } = await aggregateProductSalesRevenueAndCogs(prisma, companyId, startDate, endDate);

    const salesInfo =
      total_sales > 0 || cash_sales > 0 || total_sales_cost > 0 || balance_due_sales > 0
        ? [
            {
              total_sales: total_sales.toString(),
              cash_sales: cash_sales.toString(),
              total_sales_cost: total_sales_cost.toString(),
              balance_due_sales: balance_due_sales.toString(),
            },
          ]
        : [];

    const salaryExpenses = await prisma.$queryRaw`
      SELECT SUM(paid_amount) AS "total_salaries_expenses"
      FROM salaries
      JOIN employees ON salaries.employee_id = employees.employee_id
      WHERE employees.company_id = ${companyId}
        AND salaries.created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY employees.company_id
    `;

    const otherExpenses = await prisma.$queryRaw`
      SELECT SUM(item_qty * item_cost) AS "total_other_expenses"
      FROM other_expenses
      WHERE company_id = ${companyId}
        AND created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY company_id
    `;

    res.status(200).json({
      salesInfo: salesInfo || null,
      salaryExpenses: salaryExpenses || null,
      otherExpenses: otherExpenses || null
    });
  } catch (error) {
    console.error(`Error fetching income statement: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Unpaid / partial-paid other expenses for a company and date range.
 * SELECT only — does not modify any data.
 * unpaid: paid_amount = 0; partial: 0 < paid < (qty × cost)
 */
export const getUnpaidExpensesReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = getReportCompanyId(req);
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const { start_date, end_date } = req.query;
    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const rows = await prisma.$queryRaw<
      {
        expense_id: number;
        item_name: string;
        item_qty: number;
        item_cost: unknown;
        paid_amount: unknown;
        line_total: unknown;
        unpaid_amount: unknown;
        payment_status: string;
        date: Date;
        company_id: string;
      }[]
    >`
      SELECT
        expense_id,
        item_name,
        item_qty,
        item_cost,
        paid_amount,
        (item_qty * item_cost::numeric) AS line_total,
        ((item_qty * item_cost::numeric) - paid_amount::numeric) AS unpaid_amount,
        CASE
          WHEN paid_amount::numeric <= 0 THEN 'unpaid'
          ELSE 'partial'
        END AS payment_status,
        date,
        company_id
      FROM other_expenses
      WHERE company_id = ${companyId}
        AND date BETWEEN ${startDate} AND ${endDate}
        AND paid_amount::numeric < (item_qty * item_cost::numeric)
      ORDER BY date ASC, expense_id ASC
    `;

    const summaryRows = await prisma.$queryRaw<
      {
        row_count: number;
        total_line: unknown;
        total_paid: unknown;
        total_unpaid: unknown;
      }[]
    >`
      SELECT
        COUNT(*)::integer AS row_count,
        COALESCE(SUM(item_qty * item_cost::numeric), 0) AS total_line,
        COALESCE(SUM(paid_amount::numeric), 0) AS total_paid,
        COALESCE(SUM((item_qty * item_cost::numeric) - paid_amount::numeric), 0) AS total_unpaid
      FROM other_expenses
      WHERE company_id = ${companyId}
        AND date BETWEEN ${startDate} AND ${endDate}
        AND paid_amount::numeric < (item_qty * item_cost::numeric)
    `;

    const summary = summaryRows[0] || {
      row_count: 0,
      total_line: 0,
      total_paid: 0,
      total_unpaid: 0,
    };

    res.status(200).json({
      data: rows,
      total: Number(summary.row_count) || 0,
      totalLineAmount: Number(summary.total_line) || 0,
      totalPaid: Number(summary.total_paid) || 0,
      totalUnpaid: Number(summary.total_unpaid) || 0,
    });
  } catch (error) {
    console.error(`Error fetching unpaid expenses report: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};