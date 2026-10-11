import express from 'express';
import { getAllInvoices, getInvoice } from '../controllers/InvoiceCantrol';
import { decodeTokenOrMainToken } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);
router.get('/', getAllInvoices);
router.get('/:id', getInvoice);

export default router;
