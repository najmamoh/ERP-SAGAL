// // src/controllers/FinancialController.ts
// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { CustomUserRequest } from "../middlewares";
// import { Prisma } from '@prisma/client';
// import { Decimal } from '@prisma/client/runtime/library';

// interface FinancialReport {
//   totalSales: Prisma.Decimal;
//   neededAmount: Prisma.Decimal;
//   costOfGoodsSold: Prisma.Decimal;
//   netSale: Prisma.Decimal;
//   salaryExpenses: Prisma.Decimal;
//   otherExpenses: Prisma.Decimal;
//   totalExpenses: Prisma.Decimal;
//   income: Prisma.Decimal;
// }

// export const getProfitLossReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const { start_date, end_date } = req.query;
//     console.log(req.query)
//     const companyId = req.user!.company_id;

//     if (!start_date || !end_date) {
//       res.status(400).json({ message: 'Start and end dates are required' });
//       return;
//     }

//     // 1. Calculate Total Sales and COGS
//     const salesAggregation = await prisma.product_sales.aggregate({
//       where: {
//         created_at: {
//           gte: new Date(start_date as string),
//           lte: new Date(end_date as string)
//         },
//         product_purchases: {
//           products: { company_id: companyId }
//         }
//       },
//       _sum: {
//         received_amount: true,
//       },
//       _avg: {
//         item_price: true
//       }
//     });

//     const salesWithCost = await prisma.product_sales.findMany({
//       where: {
//         created_at: {
//           gte: new Date(start_date as string),
//           lte: new Date(end_date as string)
//         },
//         product_purchases: {
//           products: { company_id: companyId }
//         }
//       },
//       include: {
//         product_purchases: {
//           select: {
//             item_cost: true
//           }
//         }
//       }
//     });

//     // Calculate COGS and Needed Amount
//     let costOfGoodsSold = new Decimal(0);
//     let neededAmount = new Decimal(0);
    
//     salesWithCost.forEach(sale => {
//       const itemCost = sale.product_purchases?.item_cost || 0;
//       const qty = sale.sale_qty;
      
//       costOfGoodsSold = costOfGoodsSold.plus(
//         new Decimal(itemCost).times(qty)
//       );
      
//       neededAmount = neededAmount.plus(
//         new Decimal(sale.item_price).times(qty)
//       );
//     });

//     // 2. Calculate Salary Expenses
//     const salaryExpenses = await prisma.salaries.aggregate({
//       where: {
//         date: {
//           gte: new Date(start_date as string),
//           lte: new Date(end_date as string)
//         },
//         employees: {
//           company_id: companyId
//         }
//       },
//       _sum: {
//         paid_amount: true
//       }
//     });

//     // 3. Calculate Other Expenses
//     const otherExpenses = await prisma.other_expenses.aggregate({
//       where: {
//         date: {
//           gte: new Date(start_date as string),
//           lte: new Date(end_date as string)
//         },
//         company_id: companyId
//       },
//       _sum: {
//         item_cost: true
//       }
//     });

//     // Convert all values to Decimal for precise calculations
//     const totalSales = new Decimal(salesAggregation._sum.received_amount || 0);
//     const salaryExpensesTotal = new Decimal(salaryExpenses._sum.paid_amount || 0);
//     const otherExpensesTotal = new Decimal(otherExpenses._sum.item_cost || 0);

//     // Calculate final values
//     const netSale = totalSales.minus(costOfGoodsSold);
//     const totalExpenses = salaryExpensesTotal.plus(otherExpensesTotal);
//     const income = netSale.minus(totalExpenses);

//     const report: FinancialReport = {
//       totalSales,
//       neededAmount,
//       costOfGoodsSold,
//       netSale,
//       salaryExpenses: salaryExpensesTotal,
//       otherExpenses: otherExpensesTotal,
//       totalExpenses,
//       income
//     };

//     res.status(200).json(report);
//   } catch (error) {
//     console.error(`Error generating financial report: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



// src/controllers/FinancialController.ts
import { Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { aggregateProductSalesRevenueAndCogs } from "../utils/saleCogsAggregation";

function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  if (typeof v === 'object' && v !== null && '$numberDecimal' in v) {
    return parseFloat((v as { $numberDecimal: string }).$numberDecimal) || 0;
  }
  return Number(v) || 0;
}

function toStr(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export const getProfitLossReport = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { start_date, end_date, company_id: queryCompanyId } = req.query;
    const user = req.user as { company_id?: string; roles?: string[] } | undefined;
    const companyId = (queryCompanyId as string) || user?.company_id;

    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth)' });
      return;
    }

    if (!start_date || !end_date) {
      res.status(400).json({ message: 'Start and end dates are required' });
      return;
    }

    const startDate = new Date(start_date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end_date as string);
    endDate.setHours(23, 59, 59, 999);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    /** Same COGS + revenue rules as Sales Report (purchase batch, unit_cost, stock, invoice lines, latest purchase). */
    const {
      totalSalesRevenue: totalSalesNum,
      costOfGoodsSold: costOfGoodsSoldNum,
      totalCashReceived: cashReceivedNum,
      totalBalanceDue: balanceDueNum,
    } = await aggregateProductSalesRevenueAndCogs(prisma, companyId, startDate, endDate);

    const salaryRes = await prisma.salaries.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
        employees: { company_id: companyId },
      },
      _sum: { paid_amount: true },
    });
    const salaryExpensesNum = toNum(salaryRes._sum?.paid_amount);

    const otherExpensesFromRows = await prisma.other_expenses.findMany({
      where: {
        company_id: companyId,
        date: { gte: startDate, lte: endDate },
      },
      select: { item_qty: true, item_cost: true, paid_amount: true },
    });
    let otherExpensesTotalNum = 0;
    let otherExpensesPaidNum = 0;
    otherExpensesFromRows.forEach((e) => {
      otherExpensesTotalNum += (Number(e.item_qty) || 0) * toNum(e.item_cost);
      otherExpensesPaidNum += toNum(e.paid_amount);
    });
    const otherExpensesUnpaidNum = Math.max(otherExpensesTotalNum - otherExpensesPaidNum, 0);

    /** Gross profit on cash collected: cash received − COGS */
    const netSaleNum = cashReceivedNum - costOfGoodsSoldNum;
    /** Accrued expense total (qty × cost + salaries paid) — for display */
    const totalExpensesNum = salaryExpensesNum + otherExpensesTotalNum;
    /** Actually paid in the date range — used for profit / loss */
    const paidExpensesNum = salaryExpensesNum + otherExpensesPaidNum;

    /** Net sale (cash gross) − paid expenses */
    const incomeNum = netSaleNum - paidExpensesNum;
    /** Cash received − COGS − paid expenses */
    const incomeCashNum = cashReceivedNum - costOfGoodsSoldNum - paidExpensesNum;

    const report = {
      totalSales: toStr(totalSalesNum),
      neededAmount: toStr(0),
      cashReceivedFromSales: toStr(cashReceivedNum),
      balanceDueOnSales: toStr(balanceDueNum),
      costOfGoodsSold: toStr(costOfGoodsSoldNum),
      netSale: toStr(netSaleNum),
      salaryExpenses: toStr(salaryExpensesNum),
      otherExpenses: toStr(otherExpensesTotalNum),
      otherExpensesPaid: toStr(otherExpensesPaidNum),
      otherExpensesUnpaid: toStr(otherExpensesUnpaidNum),
      totalExpenses: toStr(totalExpensesNum),
      paidExpenses: toStr(paidExpensesNum),
      income: toStr(incomeNum),
      incomeCash: toStr(incomeCashNum),
    };

    res.status(200).json(report);
  } catch (error) {
    console.error(`Error generating financial report:`, error);
    res.status(500).json({
      message: 'Failed to generate financial report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};