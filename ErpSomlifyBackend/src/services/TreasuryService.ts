import { prisma } from "../prisma";
import { Prisma, TransactionAuditType, TransactionCategory, TransferStatus, TransferReceiverType } from "@prisma/client";

export class TreasuryService {
  /**
   * Ensures a treasury exists for a company.
   */
  static async ensureTreasury(companyId: string, tx: Prisma.TransactionClient = prisma) {
    let treasury = await tx.treasury.findUnique({
      where: { company_id: companyId },
    });

    if (!treasury) {
      treasury = await tx.treasury.create({
        data: {
          company_id: companyId,
          balance: 0,
        },
      });
    }

    return treasury;
  }

  /**
   * Adds or subtracts funds from the treasury with audit logging.
   */
  static async recordMovement(
    companyId: string,
    amount: number | Prisma.Decimal,
    type: TransactionAuditType,
    category: TransactionCategory,
    userId: number,
    referenceId?: string,
    description?: string,
    tx: Prisma.TransactionClient = prisma
  ) {
    const treasury = await this.ensureTreasury(companyId, tx);
    const decimalAmount = new Prisma.Decimal(amount);

    let newBalance: Prisma.Decimal;
    if (type === TransactionAuditType.DEBIT) {
      newBalance = new Prisma.Decimal(treasury.balance).plus(decimalAmount);
    } else {
      newBalance = new Prisma.Decimal(treasury.balance).minus(decimalAmount);
      if (newBalance.lt(0)) {
        throw new Error("Insufficient treasury balance");
      }
    }

    // Update treasury balance
    await tx.treasury.update({
      where: { id: treasury.id },
      data: {
        balance: newBalance,
        updated_at: new Date(),
      },
    });

    // Create audit log
    return await tx.treasuryTransaction.create({
      data: {
        treasury_id: treasury.id,
        amount: decimalAmount,
        type,
        category,
        reference_id: referenceId,
        description,
        snapshot_balance: newBalance,
        created_by: userId,
      },
    });
  }

  /**
   * Initiates a money transfer from a branch to another branch or bank.
   */
  static async initiateTransfer(
    senderCompanyId: string,
    receiverId: string,
    receiverType: TransferReceiverType,
    amount: number | Prisma.Decimal,
    userId: number,
    referenceId: string,
    tx: Prisma.TransactionClient = prisma
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    if (decimalAmount.lte(0)) {
      throw new Error("Transfer amount must be greater than zero");
    }

    // 1. Reserve funds (subtract from sender treasury)
    await this.recordMovement(
      senderCompanyId,
      decimalAmount,
      TransactionAuditType.CREDIT,
      TransactionCategory.TRANSFER_OUT,
      userId,
      referenceId,
      `Transfer to ${receiverType}: ${receiverId}`,
      tx
    );

    // 2. Create the transfer record
    const isBranch = receiverType === TransferReceiverType.BRANCH;
    return await tx.moneyTransfer.create({
      data: {
        sender_company_id: senderCompanyId,
        receiver_id: receiverId,
        receiver_type: receiverType,
        amount: decimalAmount,
        status: TransferStatus.PENDING,
        reference_id: referenceId,
        created_by: userId,
      },
    });
  }

  /**
   * Confirms a pending transfer (admin only).
   * Handles both normal transfers (company → bank) and withdrawal requests (WDR- prefix: bank → company).
   */
  static async confirmTransfer(transferId: string, userId: number, tx: Prisma.TransactionClient = prisma) {
    const transfer = await tx.moneyTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer || transfer.status !== TransferStatus.PENDING) {
      throw new Error("Transfer not found or not in pending status");
    }

    const isWithdrawal = transfer.reference_id.startsWith("WDR-");

    // 1. Update transfer status
    const updatedTransfer = await tx.moneyTransfer.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.COMPLETED,
        confirmed_by: userId,
        confirmed_at: new Date(),
      },
    });

    if (isWithdrawal) {
      // Withdrawal: debit bank → credit requesting company's treasury
      const bankId = transfer.receiver_id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bankId);
      if (isUuid) {
        const account = await tx.banking_accounts.findUnique({ where: { account_id: bankId } });
        if (!account) throw new Error("Bank account not found");
        await tx.banking_transactions.create({
          data: {
            account_id: bankId,
            amount: transfer.amount,
            type: "withdrawal",
            description: `Withdrawal to company treasury: ${transfer.sender_company_id}`,
          },
        });
      } else {
        const numBankId = parseInt(bankId);
        const bank = await tx.banks.findUnique({ where: { bank_id: numBankId } });
        if (!bank) throw new Error("Bank not found");
        const currentAmt = new Prisma.Decimal(bank.amount || 0);
        if (currentAmt.lt(transfer.amount)) throw new Error("Insufficient bank balance for withdrawal");
        await tx.banks.update({
          where: { bank_id: numBankId },
          data: { amount: currentAmt.minus(transfer.amount), updated_at: new Date() },
        });
      }
      // Credit requesting company treasury
      await this.recordMovement(
        transfer.sender_company_id,
        transfer.amount,
        TransactionAuditType.DEBIT,
        TransactionCategory.TRANSFER_IN,
        userId,
        transfer.reference_id,
        `Bank withdrawal approved`,
        tx
      );
    } else {
      // Normal transfer: credit the bank receiver
      if (transfer.receiver_type === TransferReceiverType.BRANCH) {
        await this.recordMovement(
          transfer.receiver_id,
          transfer.amount,
          TransactionAuditType.DEBIT,
          TransactionCategory.TRANSFER_IN,
          userId,
          transfer.reference_id,
          `Received transfer from branch: ${transfer.sender_company_id}`,
          tx
        );
      } else if (transfer.receiver_type === TransferReceiverType.BANK) {
        const receiverId = transfer.receiver_id;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receiverId);

        if (isUuid) {
          const account = await tx.banking_accounts.findUnique({ where: { account_id: receiverId } });
          if (!account) throw new Error("Target banking account not found");
          const senderCompany = await tx.companies.findUnique({
            where: { company_id: transfer.sender_company_id },
            select: { company_name: true },
          });
          const branchName = senderCompany?.company_name || transfer.sender_company_id;
          await tx.banking_transactions.create({
            data: {
              account_id: receiverId,
              amount: transfer.amount,
              type: "deposit",
              description: `Treasury transfer from branch: ${branchName}`,
            },
          });
        } else {
          const bankId = parseInt(receiverId);
          const bank = await tx.banks.findUnique({ where: { bank_id: bankId } });
          if (!bank) throw new Error("Target bank not found");
          await tx.banks.update({
            where: { bank_id: bankId },
            data: {
              amount: new Prisma.Decimal(bank.amount || 0).plus(transfer.amount),
              updated_at: new Date(),
            },
          });
        }
      }
    }

    return updatedTransfer;
  }

  /**
   * Cancels a pending transfer.
   * For withdrawal requests (WDR-), no treasury restoration needed since nothing was deducted.
   * For normal transfers, restores funds to sender.
   */
  static async cancelTransfer(transferId: string, userId: number, tx: Prisma.TransactionClient = prisma) {
    const transfer = await tx.moneyTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer || transfer.status !== TransferStatus.PENDING) {
      throw new Error("Transfer not found or not in pending status");
    }

    const isWithdrawal = transfer.reference_id.startsWith("WDR-");

    const updatedTransfer = await tx.moneyTransfer.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.CANCELLED,
        updated_at: new Date(),
      },
    });

    if (!isWithdrawal) {
      // Restore funds to sender (withdrawal requests never deducted, so skip)
      await this.recordMovement(
        transfer.sender_company_id,
        transfer.amount,
        TransactionAuditType.DEBIT,
        TransactionCategory.TRANSFER_CANCELLED,
        userId,
        transfer.reference_id,
        `Cancelled transfer to ${transfer.receiver_type}: ${transfer.receiver_id}`,
        tx
      );
    }

    return updatedTransfer;
  }

  /**
   * Creates a bank withdrawal request (company requests money from bank → admin approves).
   * Does NOT deduct from company treasury — funds flow on admin confirmation.
   */
  static async requestWithdrawal(
    companyId: string,
    bankId: string,
    amount: number | Prisma.Decimal,
    userId: number,
    referenceId: string,
    tx: Prisma.TransactionClient = prisma
  ) {
    const decimalAmount = new Prisma.Decimal(amount);
    if (decimalAmount.lte(0)) {
      throw new Error("Withdrawal amount must be greater than zero");
    }

    return await tx.moneyTransfer.create({
      data: {
        sender_company_id: companyId,
        receiver_id: bankId,
        receiver_type: TransferReceiverType.BANK,
        amount: decimalAmount,
        status: TransferStatus.PENDING,
        reference_id: referenceId,
        created_by: userId,
      },
    });
  }
}
