import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';
import { Prisma } from '@prisma/client';
import { TransferReceiverType } from '@prisma/client';

// Get all banking accounts
export const getBankingAccounts = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const accounts = await prisma.banking_accounts.findMany({
      include: {
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 10 // Get last 10 transactions
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calculate current balance from transactions for each account
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await prisma.banking_transactions.findMany({
          where: { account_id: account.account_id },
          orderBy: { created_at: 'desc' }
        });

        const balance = transactions.reduce((sum, t) => {
          return t.type === 'deposit' 
            ? sum.add(t.amount)
            : sum.sub(t.amount);
        }, new Prisma.Decimal(0));

        return {
          ...account,
          balance: balance,
          transactions: transactions.slice(0, 10)
        };
      })
    );

    let allTransactions = accountsWithBalance.flatMap(acc => acc.transactions)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    // Enrich treasury transfers with sender branch name
    allTransactions = await Promise.all(allTransactions.map(async (t: any) => {
      const desc = t.description || '';
      let fromBranch: string | null = null;
      if (desc.startsWith('Treasury transfer from branch: ')) {
        fromBranch = desc.replace('Treasury transfer from branch: ', '');
      } else if (desc.includes('Treasury transfer') && t.type === 'deposit') {
        const mt = await prisma.moneyTransfer.findFirst({
          where: {
            receiver_id: t.account_id,
            receiver_type: TransferReceiverType.BANK,
            status: 'COMPLETED',
            amount: new Prisma.Decimal(t.amount),
          },
          include: { sender: { select: { company_name: true } } },
          orderBy: { confirmed_at: 'desc' },
        });
        fromBranch = mt?.sender?.company_name || null;
      }
      return { ...t, from_branch: fromBranch };
    }));

    res.status(200).json({
      accounts: accountsWithBalance,
      selectedAccountId: accountsWithBalance[0]?.account_id || null,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error(`Error fetching banking accounts: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new banking account
export const createBankingAccount = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { account_name } = req.body;

    if (!account_name || !account_name.trim()) {
      res.status(400).json({ message: 'Account name is required' });
      return;
    }

    // Check for duplicate account names
    const existingAccount = await prisma.banking_accounts.findFirst({
      where: {
        account_name: {
          equals: account_name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingAccount) {
      res.status(409).json({ message: 'An account with this name already exists' });
      return;
    }

    const newAccount = await prisma.banking_accounts.create({
      data: {
        account_name: account_name.trim(),
        balance: 0
      }
    });

    // Get all accounts with calculated balances
    const allAccounts = await prisma.banking_accounts.findMany({
      orderBy: { created_at: 'desc' }
    });

    const accountsWithBalance = await Promise.all(
      allAccounts.map(async (acc) => {
        const transactions = await prisma.banking_transactions.findMany({
          where: { account_id: acc.account_id }
        });
        const balance = transactions.reduce((sum, t) => {
          return t.type === 'deposit' ? sum.add(t.amount) : sum.sub(t.amount);
        }, new Prisma.Decimal(0));
        return { ...acc, balance: balance };
      })
    );

    res.status(201).json({
      accounts: accountsWithBalance,
      selectedAccountId: newAccount.account_id,
      transactions: []
    });
  } catch (error) {
    console.error(`Error creating banking account: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a banking account
export const deleteBankingAccount = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { account_id } = req.params;

    if (!account_id) {
      res.status(400).json({ message: 'Account ID is required' });
      return;
    }

    // Check if account exists
    const account = await prisma.banking_accounts.findUnique({
      where: { account_id }
    });

    if (!account) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    // Check if this is the last account
    const accountCount = await prisma.banking_accounts.count();

    if (accountCount <= 1) {
      res.status(400).json({ message: 'Cannot delete the last account' });
      return;
    }

    // Delete account (transactions will be cascade deleted)
    await prisma.banking_accounts.delete({
      where: { account_id }
    });

    // Get remaining accounts with calculated balances
    const allAccounts = await prisma.banking_accounts.findMany({
      orderBy: { created_at: 'desc' }
    });

    const accountsWithBalance = await Promise.all(
      allAccounts.map(async (acc) => {
        const transactions = await prisma.banking_transactions.findMany({
          where: { account_id: acc.account_id }
        });
        const balance = transactions.reduce((sum, t) => {
          return t.type === 'deposit' ? sum.add(t.amount) : sum.sub(t.amount);
        }, new Prisma.Decimal(0));
        return { ...acc, balance: balance };
      })
    );

    res.status(200).json({
      accounts: accountsWithBalance,
      selectedAccountId: accountsWithBalance[0]?.account_id || null,
      transactions: []
    });
  } catch (error) {
    console.error(`Error deleting banking account: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add money (deposit)
export const addMoney = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { account_id, amount, description } = req.body;

    if (!account_id || !amount) {
      res.status(400).json({ message: 'Account ID and amount are required' });
      return;
    }

    const amountDecimal = new Prisma.Decimal(amount);
    if (amountDecimal.lte(0)) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    // Verify account exists
    const account = await prisma.banking_accounts.findUnique({
      where: { account_id }
    });

    if (!account) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    // Create transaction
    const transaction = await prisma.banking_transactions.create({
      data: {
        account_id,
        amount: amountDecimal,
        type: 'deposit',
        description: description || ''
      },
      include: {
        account: true
      }
    });

    // Get updated account with balance
    const transactions = await prisma.banking_transactions.findMany({
      where: { account_id },
      orderBy: { created_at: 'desc' }
    });

    const balance = transactions.reduce((sum, t) => {
      return t.type === 'deposit' 
        ? sum.add(t.amount)
        : sum.sub(t.amount);
    }, new Prisma.Decimal(0));

    // Get all accounts
    const accounts = await prisma.banking_accounts.findMany({
      orderBy: { created_at: 'desc' }
    });

    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const accTransactions = await prisma.banking_transactions.findMany({
          where: { account_id: acc.account_id }
        });
        const accBalance = accTransactions.reduce((sum, t) => {
          return t.type === 'deposit' ? sum.add(t.amount) : sum.sub(t.amount);
        }, new Prisma.Decimal(0));
        return { ...acc, balance: accBalance };
      })
    );

    res.status(200).json({
      accounts: accountsWithBalance,
      selectedAccountId: account_id,
      transactions: transactions.slice(0, 50)
    });
  } catch (error) {
    console.error(`Error adding money: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove money (withdrawal)
export const removeMoney = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { account_id, amount, description } = req.body;

    if (!account_id || !amount) {
      res.status(400).json({ message: 'Account ID and amount are required' });
      return;
    }

    const amountDecimal = new Prisma.Decimal(amount);
    if (amountDecimal.lte(0)) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    // Verify account exists
    const account = await prisma.banking_accounts.findUnique({
      where: { account_id }
    });

    if (!account) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    // Calculate current balance
    const transactions = await prisma.banking_transactions.findMany({
      where: { account_id }
    });

    const currentBalance = transactions.reduce((sum, t) => {
      return t.type === 'deposit' 
        ? sum.add(t.amount)
        : sum.sub(t.amount);
    }, new Prisma.Decimal(0));

    if (amountDecimal.gt(currentBalance)) {
      res.status(400).json({ message: 'Insufficient balance' });
      return;
    }

    // Create transaction
    const transaction = await prisma.banking_transactions.create({
      data: {
        account_id,
        amount: amountDecimal,
        type: 'withdrawal',
        description: description || ''
      },
      include: {
        account: true
      }
    });

    // Get updated transactions
    const updatedTransactions = await prisma.banking_transactions.findMany({
      where: { account_id },
      orderBy: { created_at: 'desc' }
    });

    // Get all accounts with updated balances
    const accounts = await prisma.banking_accounts.findMany({
      orderBy: { created_at: 'desc' }
    });

    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const accTransactions = await prisma.banking_transactions.findMany({
          where: { account_id: acc.account_id }
        });
        const accBalance = accTransactions.reduce((sum, t) => {
          return t.type === 'deposit' ? sum.add(t.amount) : sum.sub(t.amount);
        }, new Prisma.Decimal(0));
        return { ...acc, balance: accBalance };
      })
    );

    res.status(200).json({
      accounts: accountsWithBalance,
      selectedAccountId: account_id,
      transactions: updatedTransactions.slice(0, 50)
    });
  } catch (error) {
    console.error(`Error removing money: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
