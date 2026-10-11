import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { validateReportParams } from '../middlewares/reportValidation';
import {
  getSalesReport,
  getExpensesReport,
  getPurchasesReport,
  getIncomeStatement,
  getUnpaidExpensesReport
} from '../controllers/reportController';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/sales', requirePermission('reports', 'read'), validateReportParams, getSalesReport);
router.get('/expenses', requirePermission('reports', 'read'), validateReportParams, getExpensesReport);
router.get('/expenses/unpaid', requirePermission('reports', 'read'), validateReportParams, getUnpaidExpensesReport);
router.get('/purchases', requirePermission('reports', 'read'), validateReportParams, getPurchasesReport);
router.get('/incomestatement', requirePermission('reports', 'read'), validateReportParams, getIncomeStatement);

export default router;