import express from 'express';
import { deleteInvoice, getAllInvoices, getInvoice } from '../controllers/InvoiceCantrol';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);
router.get('/', requirePermission('invoices', 'read'), getAllInvoices);
router.get('/:id', requirePermission('invoices', 'read'), getInvoice);
router.delete('/:id', requirePermission('invoices', 'delete'), deleteInvoice);

export default router;