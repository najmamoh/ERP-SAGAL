import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";

// Get all transfer-money records for the logged-in user's company
export const getAlltransferMoney = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const whereClause: {
      bank_id?: number;
      treasury_id?: number;
      company_id: string;
    } = { company_id: companyId };

    if (req.query.bank_id) {
      whereClause.bank_id = parseInt(req.query.bank_id as string);
    }
    if (req.query.treasury_id) {
      whereClause.treasury_id = parseInt(req.query.treasury_id as string);
    }

    const [total, transactions] = await prisma.$transaction([
      prisma.transfer_Money.count({ where: whereClause }),
      prisma.transfer_Money.findMany({
        where: whereClause,
        include: {
          banks: true,
          treasury: true,
        },
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
    console.error(`Error fetching bank transactions: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single transfer-money record for the logged-in user's company
export const gettransfer_Money = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    const transactionId = parseInt(req.params.id);
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const transaction = await prisma.transfer_Money.findFirst({
      where: { transaction_id: transactionId, company_id: companyId },
      include: { banks: true, treasury: true },
    });

    if (!transaction) {
      res.status(404).json({ message: "Bank transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error(`Error fetching bank transaction: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new bank transaction
export const createtransfer_Money = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.body.company_id || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (body or auth).' });
      return;
    }
    const { amount, bank_id, currency_type, payment_method, treasury_id } = req.body;
   
        
    // Validate required fields (treasury_id required; bank_id optional)
    if (!amount || !currency_type || !payment_method || treasury_id == null || treasury_id === "") {
      res.status(400).json({
        message: "Missing required fields: amount, currency_type, payment_method, and treasury_id are required",
      });
      return;
    }

    // Validate currency_type length
    if (currency_type.length > 64) {
      res.status(400).json({ message: "Currency type must be 64 characters or less" });
      return;
    }

    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const transactionAmount = parseFloat(amount);
    const bankIdNumber = bank_id != null ? parseInt(bank_id) : null;
    const treasuryIdNumber = parseInt(treasury_id);

    // treasury_id required: check Treasury exists and balance is sufficient
    const treasury = await prisma.treasuryLegacy.findUnique({
      where: { treasury_id: treasuryIdNumber },
    });
    if (!treasury) {
      res.status(404).json({ message: "Treasury not found" });
      return;
    }
    const treasuryBalance = Number(treasury.balance ?? 0);
    if (treasuryBalance <= 0 || treasuryBalance < transactionAmount) {
      res.status(400).json({
        message: "Cannot transfer: Treasury balance is 0 or less than transfer amount",
      });
      return;
    }

    // If bank_id provided: check bank exists and is not closed
    if (bankIdNumber != null) {
      const bank = await prisma.banks.findUnique({
        where: { bank_id: bankIdNumber }
      });

      if (!bank) {
        res.status(404).json({ message: "Bank not found" });
        return;
      }

      if ((bank as { is_closed?: boolean }).is_closed) {
        res.status(400).json({ message: "Cannot add transaction to a closed bank" });
        return;
      }
    }

    // Create transaction (and update bank balance only if bank_id provided)
    if (bankIdNumber != null) {
      const bank = await prisma.banks.findUnique({
        where: { bank_id: bankIdNumber }
      });
      const currentBankBalance = Number(bank!.amount || 0);
      const newBankBalance = currentBankBalance + transactionAmount;

      const newTreasuryBalance = treasuryBalance - transactionAmount;
      const [newTransaction] = await prisma.$transaction([
        prisma.transfer_Money.create({
          data: {
            amount: transactionAmount,
            bank_id: bankIdNumber,
            currency_type,
            payment_method,
            treasury_id: treasuryIdNumber,
            company_id: companyId,
          },
          include: { banks: true, treasury: true },
        }),
        prisma.banks.update({
          where: { bank_id: bankIdNumber },
          data: {
            amount: newBankBalance,
            updated_at: new Date()
          }
        }),
        prisma.treasuryLegacy.update({
          where: { treasury_id: treasuryIdNumber },
          data: { balance: newTreasuryBalance, updated_at: new Date() }
        })
      ]);
      res.status(201).json({
        message: "Bank transaction created successfully",
        transaction: newTransaction
      });
      return;
    }

    const newTreasuryBalance = treasuryBalance - transactionAmount;
    const [newTransaction] = await prisma.$transaction([
      prisma.transfer_Money.create({
        data: {
          amount: transactionAmount,
          bank_id: null,
          currency_type,
          payment_method,
          treasury_id: treasuryIdNumber,
          company_id: companyId,
        },
        include: { banks: true, treasury: true },
      }),
      prisma.treasuryLegacy.update({
        where: { treasury_id: treasuryIdNumber },
        data: { balance: newTreasuryBalance, updated_at: new Date() }
      })
    ]);

    res.status(201).json({
      message: "Bank transaction created successfully",
      transaction: newTransaction
    });
  } catch (error) {
    console.error(`Error creating bank transaction: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a bank transaction
export const updatetransfer_Money = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    const transactionId = parseInt(req.params.id);
    const { amount, bank_id, currency_type, company_id, payment_method, treasury_id } = req.body;
    const companyId = company_id || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (body or auth).' });
      return;
    }

    const existingTransaction = await prisma.transfer_Money.findFirst({
      where: { transaction_id: transactionId, company_id: companyId },
      include: { banks: true, treasury: true },
    });

    if (!existingTransaction) {
      res.status(404).json({ message: "Bank transaction not found" });
      return;
    }

    // Validate currency_type length if provided
    if (currency_type && currency_type.length > 64) {
      res.status(400).json({ message: "Currency type must be 64 characters or less" });
      return;
    }

    // Validate amount if provided
    if (amount !== undefined && parseFloat(amount) <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const oldAmount = Number(existingTransaction.amount);
    const oldBankId = existingTransaction.bank_id ?? null;
    const oldTreasuryId = existingTransaction.treasury_id;
    const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
    const newBankId = bank_id === undefined ? oldBankId : (bank_id === null || bank_id === "" ? null : parseInt(bank_id));
    const newTreasuryId =
      treasury_id === undefined
        ? existingTransaction.treasury_id
        : treasury_id === null || treasury_id === ""
          ? null
          : parseInt(treasury_id);

    // treasury_id is required: cannot be null; validate treasury exists and balance is sufficient
    if (newTreasuryId == null) {
      res.status(400).json({ message: "treasury_id is required" });
      return;
    }
    {
      const treasury = await prisma.treasuryLegacy.findUnique({
        where: { treasury_id: newTreasuryId },
      });
      if (!treasury) {
        res.status(404).json({ message: "Treasury not found" });
        return;
      }
      const treasuryBalance = Number(treasury.balance ?? 0);
      const effectiveBalance = oldTreasuryId === newTreasuryId ? treasuryBalance + oldAmount : treasuryBalance;
      if (effectiveBalance <= 0 || effectiveBalance < newAmount) {
        res.status(400).json({
          message: "Cannot transfer: Treasury balance is 0 or less than transfer amount",
        });
        return;
      }
    }

    // If bank_id is being changed to a new bank, verify it exists and is not closed
    if (newBankId != null && newBankId !== oldBankId) {
      const bank = await prisma.banks.findUnique({
        where: { bank_id: newBankId }
      });

      if (!bank) {
        res.status(404).json({ message: "Bank not found" });
        return;
      }
      if ((bank as { is_closed?: boolean }).is_closed) {
        res.status(400).json({ message: "Cannot assign transaction to a closed bank" });
        return;
      }
    }

    // Prepare update operations
    const updateOperations: any[] = [];

    // Update transaction
    const updateData: any = {
      updated_at: new Date(),
    };

    if (amount !== undefined) updateData.amount = newAmount;
    if (bank_id !== undefined) updateData.bank_id = newBankId;
    if (currency_type !== undefined) updateData.currency_type = currency_type;
    updateData.company_id = companyId;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (treasury_id !== undefined) {
      if (treasury_id === null || treasury_id === "") {
        res.status(400).json({ message: "treasury_id is required" });
        return;
      }
      updateData.treasury_id = parseInt(treasury_id);
    }

    updateOperations.push(
      prisma.transfer_Money.update({
        where: { transaction_id: transactionId },
        data: updateData,
        include: { banks: true, treasury: true },
      })
    );

    // Update bank balances (only when at least one of old/new bank is set)
    if (oldBankId != null && newBankId != null && oldBankId === newBankId) {
      // Same bank: adjust balance by the difference
      const oldBank = await prisma.banks.findUnique({
        where: { bank_id: oldBankId }
      });
      if (!oldBank) {
        res.status(404).json({ message: "Old bank not found" });
        return;
      }
      const oldBankBalance = Number(oldBank.amount || 0);
      const balanceDifference = newAmount - oldAmount;
      const newBankBalance = oldBankBalance + balanceDifference;

      updateOperations.push(
        prisma.banks.update({
          where: { bank_id: oldBankId },
          data: {
            amount: newBankBalance,
            updated_at: new Date()
          }
        })
      );
    } else if (oldBankId != null && newBankId != null && oldBankId !== newBankId) {
      // Different banks: subtract from old bank, add to new bank
      const oldBank = await prisma.banks.findUnique({
        where: { bank_id: oldBankId }
      });
      const newBank = await prisma.banks.findUnique({
        where: { bank_id: newBankId }
      });

      if (!oldBank) {
        res.status(404).json({ message: "Old bank not found" });
        return;
      }
      if (!newBank) {
        res.status(404).json({ message: "New bank not found" });
        return;
      }

      const oldBankBalance = Number(oldBank.amount || 0);
      const newOldBankBalance = oldBankBalance - oldAmount;
      const newBankBalance = Number(newBank.amount || 0) + newAmount;

      updateOperations.push(
        prisma.banks.update({
          where: { bank_id: oldBankId },
          data: {
            amount: newOldBankBalance,
            updated_at: new Date()
          }
        }),
        prisma.banks.update({
          where: { bank_id: newBankId },
          data: {
            amount: newBankBalance,
            updated_at: new Date()
          }
        })
      );
    } else if (oldBankId != null && newBankId == null) {
      // Removing bank from transaction: subtract from old bank only
      const oldBank = await prisma.banks.findUnique({
        where: { bank_id: oldBankId }
      });
      if (!oldBank) {
        res.status(404).json({ message: "Old bank not found" });
        return;
      }
      const oldBankBalance = Number(oldBank.amount || 0);
      const newBankBalance = oldBankBalance - oldAmount;

      updateOperations.push(
        prisma.banks.update({
          where: { bank_id: oldBankId },
          data: {
            amount: newBankBalance,
            updated_at: new Date()
          }
        })
      );
    } else if (oldBankId == null && newBankId != null) {
      // Assigning bank to transaction that had none: add to new bank only
      const newBank = await prisma.banks.findUnique({
        where: { bank_id: newBankId }
      });
      if (!newBank) {
        res.status(404).json({ message: "New bank not found" });
        return;
      }
      const newBankBalance = Number(newBank.amount || 0) + newAmount;

      updateOperations.push(
        prisma.banks.update({
          where: { bank_id: newBankId },
          data: {
            amount: newBankBalance,
            updated_at: new Date()
          }
        })
      );
    }
    // else: both null, no bank balance updates

    // Treasury balance: we had deducted on create; on update add back old and deduct new
    if (oldTreasuryId === newTreasuryId) {
      const diff = oldAmount - newAmount;
      if (diff !== 0) {
        const t = await prisma.treasuryLegacy.findUnique({ where: { treasury_id: oldTreasuryId } });
        if (t) {
          const newBal = Number(t.balance ?? 0) + diff;
          updateOperations.push(
            prisma.treasuryLegacy.update({
              where: { treasury_id: oldTreasuryId },
              data: { balance: newBal, updated_at: new Date() }
            })
          );
        }
      }
    } else {
      const [oldT, newT] = await prisma.$transaction([
        prisma.treasuryLegacy.findUnique({ where: { treasury_id: oldTreasuryId } }),
        prisma.treasuryLegacy.findUnique({ where: { treasury_id: newTreasuryId } })
      ]);
      if (oldT) {
        updateOperations.push(
          prisma.treasuryLegacy.update({
            where: { treasury_id: oldTreasuryId },
            data: {
              balance: Number(oldT.balance ?? 0) + oldAmount,
              updated_at: new Date()
            }
          })
        );
      }
      if (newT) {
        updateOperations.push(
          prisma.treasuryLegacy.update({
            where: { treasury_id: newTreasuryId },
            data: {
              balance: Number(newT.balance ?? 0) - newAmount,
              updated_at: new Date()
            }
          })
        );
      }
    }

    // Execute all updates atomically
    const results = await prisma.$transaction(updateOperations);
    const updatedTransaction = results[0];

    res.status(200).json({
      message: "Bank transaction updated successfully",
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error(`Error updating bank transaction: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a bank transaction
export const deletetransfer_Money = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    const transactionId = parseInt(req.params.id);
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const existingTransaction = await prisma.transfer_Money.findFirst({
      where: { transaction_id: transactionId, company_id: companyId },
      include: { banks: true, treasury: true },
    });

    if (!existingTransaction) {
      res.status(404).json({ message: "Bank transaction not found" });
      return;
    }

    const transactionAmount = Number(existingTransaction.amount);
    const bankId = existingTransaction.bank_id;
    const treasuryId = existingTransaction.treasury_id;

    const deleteOps: any[] = [
      prisma.transfer_Money.delete({
        where: { transaction_id: transactionId }
      })
    ];

    if (bankId != null) {
      const bank = await prisma.banks.findUnique({
        where: { bank_id: bankId }
      });
      if (!bank) {
        res.status(404).json({ message: "Bank not found" });
        return;
      }
      const newBankBalance = Number(bank.amount || 0) - transactionAmount;
      deleteOps.push(
        prisma.banks.update({
          where: { bank_id: bankId },
          data: { amount: newBankBalance, updated_at: new Date() }
        })
      );
    }

    if (treasuryId != null) {
      const treasury = await prisma.treasuryLegacy.findUnique({
        where: { treasury_id: treasuryId }
      });
      if (treasury) {
        const newTreasuryBalance = Number(treasury.balance ?? 0) + transactionAmount;
        deleteOps.push(
          prisma.treasuryLegacy.update({
            where: { treasury_id: treasuryId },
            data: { balance: newTreasuryBalance, updated_at: new Date() }
          })
        );
      }
    }

    await prisma.$transaction(deleteOps);

    res.status(200).json({ message: "Bank transaction deleted successfully" });
  } catch (error) {
    console.error(`Error deleting bank transaction: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
