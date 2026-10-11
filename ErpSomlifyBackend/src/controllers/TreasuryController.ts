import { Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { TreasuryService } from "../services/TreasuryService";
import { TransferReceiverType } from "@prisma/client";

export const getTreasuryBalance = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Support both company users (req.user.company_id) and main users (query.company_id)
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const treasury = await TreasuryService.ensureTreasury(companyId);
    res.status(200).json(treasury);
  } catch (error) {
    console.error(`Error fetching treasury balance: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Admin: treasury balances for all companies (optional company_id filter). */
export const getAllTreasuryBalances = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const userCompanyId = user?.company_id;
    const roles = user?.roles || [];
    const isMainAdmin = !userCompanyId && roles.some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    if (!isMainAdmin) {
      res.status(403).json({ message: 'Only main admin can view all company treasury balances.' });
      return;
    }

    const filterCompanyId = req.query.company_id as string | undefined;
    const companies = await prisma.companies.findMany({
      where: {
        isBanned: false,
        ...(filterCompanyId ? { company_id: filterCompanyId } : {}),
      },
      select: {
        company_id: true,
        company_name: true,
        treasury: { select: { id: true, balance: true } },
      },
      orderBy: { company_name: 'asc' },
    });

    const items = companies.map((c) => {
      const raw = c.treasury?.balance;
      const balance = raw != null ? Number(raw) : 0;
      return {
        company_id: c.company_id,
        company_name: c.company_name,
        treasury_id: c.treasury?.id ?? null,
        balance: Number.isFinite(balance) ? balance : 0,
      };
    });

    const total_balance = items.reduce((sum, i) => sum + i.balance, 0);

    res.status(200).json({
      data: items,
      total_balance,
      count: items.length,
    });
  } catch (error) {
    console.error(`Error fetching all treasury balances: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTreasuryTransactions = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Support both company users (req.user.company_id) and main users (query.company_id)
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const treasury = await TreasuryService.ensureTreasury(companyId);

    const [total, transactions] = await prisma.$transaction([
      prisma.treasuryTransaction.count({ where: { treasury_id: treasury.id } }),
      prisma.treasuryTransaction.findMany({
        where: { treasury_id: treasury.id },
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    res.status(200).json({
      data: transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error(`Error fetching treasury transactions: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { receiver_id, receiver_type, amount, description, company_id: bodyCompanyId } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = req.user as any;
    const senderCompanyId = (bodyCompanyId as string) || user?.company_id;
    const userId = user?.user_id;
    const roles: string[] = user?.roles || [];
    const isMainAdmin = !user?.company_id && roles.some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));

    if (!senderCompanyId || !userId) {
      res.status(400).json({ message: 'Company ID and User ID are required (pass company_id in body for main users).' });
      return;
    }

    if (!receiver_id || !receiver_type || !amount) {
      res.status(400).json({ message: "Missing required fields: receiver_id, receiver_type, amount" });
      return;
    }

    // Company users can only transfer to BANK (not to other branches)
    if (!isMainAdmin && receiver_type !== 'BANK') {
      res.status(403).json({ message: "Company users can only transfer money to a bank account." });
      return;
    }

    const referenceId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transfer = await prisma.$transaction(async (tx) => {
      return await TreasuryService.initiateTransfer(
        senderCompanyId,
        receiver_id,
        receiver_type as TransferReceiverType,
        amount,
        userId,
        referenceId,
        tx
      );
    });

    res.status(201).json({
      message: "Transfer initiated successfully",
      transfer,
    });
  } catch (error: any) {
    console.error(`Error creating transfer: ${error}`);
    res.status(400).json({ message: error.message || "Internal server error" });
  }
};

export const requestWithdrawal = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { bank_id, amount } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = req.user as any;
    const companyId = user?.company_id;
    const userId = user?.user_id;

    if (!companyId || !userId) {
      res.status(400).json({ message: 'Company ID is required. Only company admins can request withdrawals.' });
      return;
    }
    if (!bank_id || !amount) {
      res.status(400).json({ message: "Missing required fields: bank_id, amount" });
      return;
    }

    const referenceId = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transfer = await prisma.$transaction(async (tx) => {
      return await TreasuryService.requestWithdrawal(companyId, bank_id, amount, userId, referenceId, tx);
    });

    res.status(201).json({
      message: "Withdrawal request submitted. Pending main admin approval.",
      transfer,
    });
  } catch (error: any) {
    console.error(`Error requesting withdrawal: ${error}`);
    res.status(400).json({ message: error.message || "Internal server error" });
  }
};

export const confirmTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userId = (req.user as any)?.user_id;
    if (!userId) {
      res.status(400).json({ message: 'User ID is required.' });
      return;
    }

    const transfer = await prisma.$transaction(async (tx) => {
      return await TreasuryService.confirmTransfer(id, userId, tx);
    });

    res.status(200).json({
      message: "Transfer confirmed successfully",
      transfer,
    });
  } catch (error: any) {
    console.error(`Error confirming transfer: ${error}`);
    res.status(400).json({ message: error.message || "Internal server error" });
  }
};

export const cancelTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userId = (req.user as any)?.user_id;
    if (!userId) {
      res.status(400).json({ message: 'User ID is required.' });
      return;
    }

    const transfer = await prisma.$transaction(async (tx) => {
      return await TreasuryService.cancelTransfer(id, userId, tx);
    });

    res.status(200).json({
      message: "Transfer cancelled successfully",
      transfer,
    });
  } catch (error: any) {
    console.error(`Error cancelling transfer: ${error}`);
    res.status(400).json({ message: error.message || "Internal server error" });
  }
};

export const getTransfers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Support company users (req.user.company_id), main users with filter (query.company_id), or main users "all companies" (no company_id)
    const user = req.user as any;
    const queryCompanyId = req.query.company_id as string;
    const userCompanyId = user?.company_id;
    const companyId = queryCompanyId || userCompanyId;
    const roles = user?.roles || [];
    const isMainAdmin = !userCompanyId && roles.some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    // Main admin without company_id = all companies; otherwise company_id is required
    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const type = req.query.type; // 'sent' or 'received'

    const whereClause: any = {};
    if (companyId) {
      if (type === 'sent') {
        whereClause.sender_company_id = companyId;
      } else if (type === 'received') {
        whereClause.receiver_id = companyId;
        whereClause.receiver_type = TransferReceiverType.BRANCH;
      } else {
        whereClause.OR = [
          { sender_company_id: companyId },
          { receiver_id: companyId, receiver_type: TransferReceiverType.BRANCH }
        ];
      }
    } else {
      // Main admin "all companies" - no company filter; show all transfers
    }

    const transfers = await prisma.moneyTransfer.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        sender: { select: { company_name: true } },
        receiver_branch: { select: { company_name: true } }
      }
    });

    res.status(200).json(transfers);
  } catch (error) {
    console.error(`Error fetching transfers: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
