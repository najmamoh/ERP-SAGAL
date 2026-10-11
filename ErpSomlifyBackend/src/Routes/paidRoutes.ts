import express from 'express';

import { decodeTokenOrMainToken, isAdmin } from '../middlewares';
import { createPayment, deletePayment, getAllPayments, getPayment, updatePayment } from '../controllers/paid_company';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', getAllPayments);
router.get('/:id', getPayment);
router.post('/', isAdmin, createPayment);
router.put('/:id', isAdmin, updatePayment);
router.delete('/:id', isAdmin, deletePayment);

export default router;