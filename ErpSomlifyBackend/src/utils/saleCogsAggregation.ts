/**
 * Shared logic: revenue (line net) and COGS for product_sales in a period.
 * Matches sales report rules (purchase batch cost, unit_cost snapshot, warehouse, invoice line product_id, latest purchase).
 */
import type { PrismaClient } from '@prisma/client';

const roundMoney = (n: number): number => Math.round(n * 100) / 100;

function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'object') {
    if (typeof (v as any).toNumber === 'function') return (v as any).toNumber();
    if ('$numberDecimal' in (v as any)) return parseFloat((v as any).$numberDecimal) || 0;
  }
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

export type SaleCogsAggregate = {
  /** Sum of (qty × unit sale price − line discount) per line */
  totalSalesRevenue: number;
  /** Sum of (qty × resolved unit COGS) per line */
  costOfGoodsSold: number;
  /** Sum of received_amount (cash in) per line */
  totalCashReceived: number;
  /** Sum of max(0, line net − received) — still owed on sales in period */
  totalBalanceDue: number;
};

/**
 * Aggregate revenue and COGS for all product sale lines in the date range for a company.
 */
export async function aggregateProductSalesRevenueAndCogs(
  prisma: PrismaClient,
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<SaleCogsAggregate> {
  const salesWhere = {
    created_at: { gte: startDate, lte: endDate },
    OR: [
      { product_purchases: { vendors: { company_id: companyId } } },
      { company_users: { company_id: companyId } },
    ],
  };

  const allSales = await prisma.product_sales.findMany({
    where: salesWhere,
    include: {
      product_purchases: { include: { products: true } },
      warehouse_stock: { include: { product: true } },
      Invoice: {
        select: {
          id: true,
          status: true,
          sale_id: true,
          items: {
            select: { id: true, product_id: true },
            orderBy: { id: 'asc' as const },
          },
        },
      },
    },
    orderBy: { sale_id: 'asc' },
  });

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

  const groups: (typeof allSales)[] = [];
  for (const sale of allSales) {
    const sid = sale.sale_id as number;
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

  const resolveUnitCostForLine = (sale: (typeof allSales)[0], productIdFromInvoice?: number | null): number => {
    let unitCost = 0;
    const pp = sale.product_purchases as { item_cost?: unknown; products?: { product_id?: number } | null } | null;
    if (pp != null) {
      unitCost = toNum(pp.item_cost);
    }
    if (unitCost === 0 && (sale as any).unit_cost != null) {
      unitCost = toNum((sale as any).unit_cost);
    }
    const ws = (sale as any).warehouse_stock;
    const productIdFromStock = ws?.product_id ?? ws?.product?.product_id;
    if (unitCost === 0 && ws) {
      const stockCost = ws.unit_cost != null ? toNum(ws.unit_cost) : 0;
      if (stockCost > 0) {
        unitCost = stockCost;
      } else if (productIdFromStock != null) {
        const fallback = latestPurchaseCostByProduct[Number(productIdFromStock)];
        if (fallback != null) unitCost = fallback;
      }
    }
    if (unitCost === 0) {
      const pidFromPurchase = pp?.products?.product_id;
      const anyProductId = productIdFromStock ?? pidFromPurchase;
      if (anyProductId != null) {
        const fallback = latestPurchaseCostByProduct[Number(anyProductId)];
        if (fallback != null) unitCost = fallback;
      }
    }
    if (unitCost === 0 && productIdFromInvoice != null && productIdFromInvoice > 0) {
      const fallback = latestPurchaseCostByProduct[Number(productIdFromInvoice)];
      if (fallback != null) unitCost = fallback;
    }
    return unitCost;
  };

  let totalSalesRevenue = 0;
  let costOfGoodsSold = 0;
  let totalCashReceived = 0;
  let totalBalanceDue = 0;

  for (const group of groups) {
    const sortedGroup = [...group].sort((a, b) => Number(a.sale_id) - Number(b.sale_id));
    const invoiceRecord = sortedGroup.find((s) => (s.Invoice as any)?.length > 0)?.Invoice as any;
    const invoice = Array.isArray(invoiceRecord) ? invoiceRecord[0] : null;
    // Soft-delete behavior: ignore VOID transactions in P/L and income aggregations.
    if (invoice?.status === 'VOID') continue;
    const invItems = (invoice?.items ?? []) as Array<{ product_id?: number }>;

    sortedGroup.forEach((sale, lineIndex) => {
      const qty = toNum(sale.sale_qty);
      const productIdFromInvoice =
        invItems[lineIndex]?.product_id != null ? Number(invItems[lineIndex].product_id) : null;
      const unitCost = resolveUnitCostForLine(sale, productIdFromInvoice);
      const lineCost = roundMoney(qty * unitCost);
      const unitSalePrice = toNum(sale.item_price);
      const lineDiscount = toNum(sale.sale_discount);
      const lineNet = roundMoney(qty * unitSalePrice - lineDiscount);
      const received = toNum(sale.received_amount);
      totalSalesRevenue += lineNet;
      costOfGoodsSold += lineCost;
      totalCashReceived += received;
      totalBalanceDue += roundMoney(Math.max(0, lineNet - received));
    });
  }

  return {
    totalSalesRevenue: roundMoney(totalSalesRevenue),
    costOfGoodsSold: roundMoney(costOfGoodsSold),
    totalCashReceived: roundMoney(totalCashReceived),
    totalBalanceDue: roundMoney(totalBalanceDue),
  };
}
