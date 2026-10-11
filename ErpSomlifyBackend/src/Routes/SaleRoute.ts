// src/routes/sales.ts
import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { createSales, deleteSale, getAllSales, getSale, updateSale } from '../controllers';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('sales', 'read'), getAllSales);
router.get('/:id', requirePermission('sales', 'read'), getSale);
router.post('/', requirePermission('sales', 'create'), createSales);
router.put('/:id', requirePermission('sales', 'update'), updateSale);
router.delete('/:id', requirePermission('sales', 'delete'), deleteSale);

export default router;