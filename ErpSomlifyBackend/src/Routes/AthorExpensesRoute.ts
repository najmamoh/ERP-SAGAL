import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import {
  createOtherExpense,
  deleteOtherExpense,
  getAllOtherExpenses,
  getOtherExpense,
  updateOtherExpense
} from '../controllers/otherExpenseController';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('expenses', 'read'), getAllOtherExpenses);
router.get('/:id', requirePermission('expenses', 'read'), getOtherExpense);
router.post('/', requirePermission('expenses', 'create'), createOtherExpense);
router.put('/:id', requirePermission('expenses', 'update'), updateOtherExpense);
router.delete('/:id', requirePermission('expenses', 'delete'), deleteOtherExpense);

export default router;