import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';


export const getAllPayments = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const [total, payments] = await prisma.$transaction([
      prisma.paid_company.count({
        // where: { company_id: req.user!.company_id }
      }),
      prisma.paid_company.findMany({
        // where: { company_id: req.user!.company_id },
        orderBy: { payment_date: 'desc' },
        include: { company: true },
        skip,
        take: pageSize,
      })
    ]);

    res.status(200).json({
      data: payments,
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    });
  } catch (error) {
    console.error(`Error fetching payments: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPayment = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const payment = await prisma.paid_company.findFirst({
      where: { 
        id: parseInt(req.params.id),
        // company_id: req.body!.company_id 
      },
      include: { company: true }
    });
    
    payment ? res.status(200).json(payment) : res.status(404).json({ message: 'Payment not found' });
  } catch (error) {
    console.error(`Error fetching payment: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createPayment = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
    //   res.status(403).json({ message: 'Forbidden' });
    //   return;
    // }

    const { amount_paid, months_covered, company_id } = req.body;
    const companyId = req.body.company_id;

    // Validate input
    if (!amount_paid || !months_covered || !company_id) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (Number(amount_paid) <= 0 || months_covered <= 0) {
      res.status(400).json({ message: 'Amount and months must be positive values' });
      return;
    }

    const company = await prisma.companies.findUnique({
      where: { company_id: companyId }
    });

    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Convert Decimal values to numbers
    const subscriptionFee = Number(company.subscribtion_fee || 0);
    const currentDebt = Number(company.debt || 0);
    const expectedAmount = subscriptionFee * months_covered;
    const paidAmount = Number(amount_paid);

    if (paidAmount > expectedAmount) {
      res.status(400).json({ message: 'Payment exceeds expected amount' });
      return;
    }

    // Handle null subscription end date
    const startDate = company.subscription_end_date ? new Date(company.subscription_end_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months_covered);

    // Calculate debt
    const debtIncrease = expectedAmount - paidAmount;

    await prisma.$transaction([
      prisma.paid_company.create({
        data: {
          company_id: companyId,
          expected_amount: expectedAmount,
          amount_paid: paidAmount,
          payment_date: new Date(),
          start_date: startDate,
          end_date: endDate,
          months_covered: months_covered
        }
      }),
      prisma.companies.update({
        where: { company_id: companyId },
        data: {
          subscription_end_date: endDate,
          debt: currentDebt + debtIncrease
        }
      })
    ]);

    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error(`Error creating payment: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePayment = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const paymentId = parseInt(req.params.id);
    const { amount_paid, months_covered, company_id } = req.body;

    // Validate input
    if (!amount_paid || Number(amount_paid) <= 0 || 
        !months_covered || Number(months_covered) <= 0 || 
        !company_id) {
      res.status(400).json({ message: 'Invalid input parameters' });
      return;
    }

    // Get existing payment
    const payment = await prisma.paid_company.findFirst({
      where: { 
        id: paymentId,
        company_id: company_id 
      }
    });

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    // Get company and validate
    const company = await prisma.companies.findUnique({
      where: { company_id: company_id }
    });

    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Convert values
    const subscriptionFee = Number(company.subscribtion_fee);
    const newMonthsCovered = Number(months_covered);
    const newPaidAmount = Number(amount_paid);
    const previousPaidAmount = Number(payment.amount_paid);
    const currentDebt = Number(company.debt || 0);

    // Calculate new expected amount based on subscription fee and months covered
    const newExpectedAmount = subscriptionFee * newMonthsCovered;

    // Calculate debt adjustment
    const previousDebtComponent = Number(payment.expected_amount) - previousPaidAmount;
    const newDebtComponent = newExpectedAmount - newPaidAmount;
    const debtChange = newDebtComponent - previousDebtComponent;

    // Calculate new dates
    const startDate = new Date(payment.start_date);
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(startDate.getMonth() + newMonthsCovered);

    // Perform transaction
    await prisma.$transaction([
      // Update payment
      prisma.paid_company.update({
        where: { id: paymentId },
        data: { 
          amount_paid: newPaidAmount,
          months_covered: newMonthsCovered,
          expected_amount: newExpectedAmount,
          end_date: newEndDate,
          updated_at: new Date()
        }
      }),
      
      // Update company debt and subscription end date
      prisma.companies.update({
        where: { company_id: company_id },
        data: { 
          debt: currentDebt + debtChange,
          subscription_end_date: newEndDate
        }
      })
    ]);

    res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error(`Error updating payment: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePayment = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const paymentId = parseInt(req.params.id);
    const payment = await prisma.paid_company.findFirst({
      where: { 
        id: paymentId,
        // company_id: req.body!.company_id 
      }
    });

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    const company = await prisma.companies.findUnique({
      where: { company_id: req.body!.company_id }
    });

    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Convert Decimal values to numbers
    const currentCompanyDebt = Number(company.debt || 0);
    const expectedAmount = Number(payment.expected_amount);
    const paidAmount = Number(payment.amount_paid);

    const debtAdjustment = (expectedAmount - paidAmount) * -1;

    // Handle possible null subscription end date
    const currentEndDate = company.subscription_end_date || new Date(0); // Fallback to epoch date
    const newEndDate = currentEndDate < payment.end_date ? currentEndDate : payment.start_date;

    await prisma.$transaction([
      prisma.paid_company.delete({
        where: { id: paymentId }
      }),
      prisma.companies.update({
        where: { company_id: company.company_id },
        data: { 
          debt: currentCompanyDebt + debtAdjustment,
          subscription_end_date: newEndDate
        }
      })
    ]);

    res.status(204).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting payment: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};