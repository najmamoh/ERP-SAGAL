// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, bodyValidator, lengthValidator, queryValidator } from "../decorators";

// enum OtherExpenses {
//   item_name =  'item_name',
//   item_qty = 'item_qty',
//   item_cost = 'item_cost',
//   paid_amount = 'paid_amount',
//   date = 'date',
//   company_id = 'company_id'
// }

// @controller('/api')
// class VendorController {
//   @get('/otherexpenses')
//   @queryValidator('company_id')
//   async findAll (req: Request, res: Response) {
//     const otherExpenes = await prisma.other_expenses.findMany({
//       where: {
//         company_id: String(req.query.company_id)
//       }
//     });
//     res.status(200).send(otherExpenes);
//   }
//   @get('/otherexpenses/:id')
//   async findOne (req: Request, res: Response) {
//     const otherExpense = await prisma.other_expenses.findUnique({
//       where: { expense_id: parseInt(req.params.id) }
//     })
//     res.status(200).send(otherExpense);
//   }
//   @post('/otherexpenses')
//   @bodyValidator(OtherExpenses.item_name, OtherExpenses.item_qty, OtherExpenses.item_cost, OtherExpenses.paid_amount, OtherExpenses.date, OtherExpenses.company_id)
//   @lengthValidator(64, OtherExpenses.item_name)
//   @lengthValidator(255, OtherExpenses.item_qty, OtherExpenses.item_cost, OtherExpenses.paid_amount, OtherExpenses.company_id)
//   async create (req: Request, res: Response) {
//     const { item_name, item_qty, item_cost, paid_amount, date,  company_id } = req.body;
//     const otherExpense = await prisma.other_expenses.create({
//       data: {
//         item_name,
//         item_qty,
//         item_cost,
//         paid_amount,
//         date: new Date(date + ' 12:00'),
//         companies: {
//           connect: { company_id }
//         }
//       }
//     })
//     res.status(201).send(otherExpense);
//   }
//   @put('/otherexpenses/:id')
//   @bodyValidator(OtherExpenses.item_name, OtherExpenses.item_qty, OtherExpenses.item_cost, OtherExpenses.paid_amount, OtherExpenses.date)
//   @lengthValidator(64, OtherExpenses.item_name)
//   @lengthValidator(255, OtherExpenses.item_qty, OtherExpenses.item_cost, OtherExpenses.paid_amount)
//   async update (req: Request, res: Response) {
//     const { item_name, item_qty, item_cost, paid_amount, date } = req.body;
//     const updatedOtherExpense = await prisma.other_expenses.update({
//       where: { expense_id: parseInt(req.params.id)},
//       data: {
//         item_name,
//         item_qty,
//         item_cost,
//         paid_amount,
//         date: new Date(date),
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedOtherExpense);
//   }
//   @del('/otherexpenses/:id')
//   async delete (req: Request, res: Response) {
//     const deletedOtherExpense = await prisma.other_expenses.delete({
//       where: { expense_id: parseInt(req.params.id)}
//     })
//     res.status(204).send({ message: 'Deleted Successfully' });
//   }
// }


import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma } from '@prisma/client';
import { TreasuryService } from '../services/TreasuryService';
import { TransactionAuditType, TransactionCategory } from '@prisma/client';

// export const getAllOtherExpenses = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     console.log(req.user?.role)
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: "Forbidden! You don't have permission" });
//       return;
//     }

//     const pageNumber = parseInt(req.query.page_number as string) || 1;
//     const pageSize = parseInt(req.query.page_size as string) || 10;

//     const otherExpenses = await prisma.other_expenses.findMany({
//       where: { company_id: req.user!.company_id },
//       skip: (pageNumber - 1) * pageSize,
//       take: pageSize,
//     });
//     res.status(200).json(otherExpenses);
//   } catch (error) {
//     console.error(`Error fetching other expenses: ${error}`);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


export const getAllOtherExpenses = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const roles = user?.roles || [];
    const isMainAdmin = !user?.company_id && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));

    const { page = 1, pageSize = 10, company_id, startDate, endDate, search } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const searchTerm = (search as string)?.trim() || '';

    const whereClause: Prisma.other_expensesWhereInput = {};
    if (isMainAdmin) {
      if (company_id && String(company_id).trim() !== '') {
        whereClause.company_id = String(company_id);
      }
    } else {
      whereClause.company_id = user.company_id;
    }

    // Add search filter (item_name)
    if (searchTerm) {
      whereClause.item_name = { contains: searchTerm, mode: 'insensitive' };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(String(startDate));
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    const [total, otherExpenses] = await prisma.$transaction([
      prisma.other_expenses.count({ where: whereClause }),
      prisma.other_expenses.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(pageSize),
        include: {
          companies: {
            select: {
              company_name: true,
              company_id: true
            }
          }
        }
      })
    ]);

    res.status(200).json({
      data: otherExpenses,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize))
    });
  } catch (error) {
    console.error(`Error fetching other expenses: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getOtherExpense = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const expense = await prisma.other_expenses.findFirst({
      where: {
        expense_id: parseInt(req.params.id),
        ...(user?.company_id ? { company_id: user.company_id } : {}),
      },
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error(`Error fetching expense: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOtherExpense = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const companyId = req.body.company_id || user?.company_id;
    if (!companyId) {
      res.status(400).json({ message: "Company ID is required (body or auth)." });
      return;
    }

    const { item_name, item_qty, item_cost, paid_amount, date } = req.body;
    if (!item_name || !item_qty || !item_cost || !paid_amount || !date) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (item_name.length > 64 || item_qty.length > 255 || item_cost.length > 255 || paid_amount.length > 255) {
      res.status(400).json({ message: "Invalid field lengths" });
      return;
    }

    const paidAmount = new Prisma.Decimal(paid_amount);
    const userId = user?.user_id ?? user?.id ?? 1;

    const newExpense = await prisma.$transaction(async (tx) => {
      const expense = await tx.other_expenses.create({
        data: {
          item_name,
          item_qty,
          item_cost,
          paid_amount,
          date: new Date(date + ' 12:00'),
          company_id: companyId,
        },
      });

      // Subtract paid_amount from treasury to keep data integrity
      if (paidAmount.gt(0)) {
        await TreasuryService.recordMovement(
          companyId,
          paidAmount,
          TransactionAuditType.CREDIT,
          TransactionCategory.EXPENSE,
          userId,
          `EXPENSE-${expense.expense_id}`,
          `Expense: ${item_name}`,
          tx
        );
      }

      return expense;
    });

    res.status(201).json(newExpense);
  } catch (error: any) {
    console.error(`Error creating expense: ${error}`);
    if (error?.message === 'Insufficient treasury balance') {
      res.status(400).json({ message: 'Insufficient treasury balance for this expense.' });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOtherExpense = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { item_name, item_qty, item_cost, paid_amount, date } = req.body;
    const expenseId = parseInt(req.params.id);
    const where: any = { expense_id: expenseId };
    if (user?.company_id) where.company_id = user.company_id;

    const existingExpense = await prisma.other_expenses.findFirst({ where });
    if (!existingExpense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    if (item_name != null && String(item_name).length > 64) {
      res.status(400).json({ message: "Invalid field lengths" });
      return;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };
    if (item_name != null) updateData.item_name = item_name;
    if (item_qty != null) updateData.item_qty = Number(item_qty);
    if (item_cost != null) updateData.item_cost = item_cost;
    if (paid_amount != null) updateData.paid_amount = paid_amount;
    if (date != null) updateData.date = new Date(date);

    const updatedExpense = await prisma.other_expenses.update({
      where: { expense_id: expenseId },
      data: updateData as any,
    });
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(`Error updating expense: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteOtherExpense = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const where: any = { expense_id: parseInt(req.params.id) };
    if (user?.company_id) where.company_id = user.company_id;

    const existingExpense = await prisma.other_expenses.findFirst({ where });
    if (!existingExpense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    await prisma.other_expenses.delete({
      where: { expense_id: parseInt(req.params.id) },
    });
    res.status(204).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error(`Error deleting expense: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};