import { Router } from "express";
import {
  getTreasuryBalance,
  getAllTreasuryBalances,
  getTreasuryTransactions,
  createTransfer,
  confirmTransfer,
  cancelTransfer,
  getTransfers,
  requestWithdrawal,
} from "../controllers/TreasuryController";
import { decodeTokenOrMainToken, requirePermission } from "../middlewares";

const router = Router();

router.use(decodeTokenOrMainToken);

router.get("/balance", requirePermission('banking', 'read'), getTreasuryBalance);
router.get("/balances", requirePermission('banking', 'read'), getAllTreasuryBalances);
router.get("/transactions", requirePermission('banking', 'read'), getTreasuryTransactions);
router.get("/transfers", requirePermission('banking', 'read'), getTransfers);
router.post("/transfers", requirePermission('banking', 'create'), createTransfer);
router.post("/transfers/:id/confirm", requirePermission('banking', 'update'), confirmTransfer);
router.post("/transfers/:id/cancel", requirePermission('banking', 'update'), cancelTransfer);
router.post("/withdraw-request", requirePermission('banking', 'create'), requestWithdrawal);

export default router;
