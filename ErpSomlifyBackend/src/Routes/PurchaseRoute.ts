// routes/purchases.ts
import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { addPurchaseCost, createPurchases, deletePurchase, getAllPurchasAll, getAllPurchases, getPurchase, getSearchAllPurchases, lowItems, setPurchaseSellingPrice, updatePurchase } from '../controllers';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('purchases', 'read'), getAllPurchases);
router.get('/AllItem', requirePermission('products', 'read'), lowItems);
router.get('/search', requirePermission('purchases', 'read'), getSearchAllPurchases);
router.get('/All', requirePermission('purchases', 'read'), getAllPurchasAll);
router.get('/:id', requirePermission('purchases', 'read'), getPurchase);
router.post('/:id/costs', requirePermission('purchases', 'update'), addPurchaseCost);
router.post('/:id/selling-price', requirePermission('purchases', 'update'), setPurchaseSellingPrice);
router.post('/', requirePermission('purchases', 'create'), createPurchases);
router.put('/:id', requirePermission('purchases', 'update'), updatePurchase);
router.delete('/:id', requirePermission('purchases', 'delete'), deletePurchase);
// router.put('/pay/:id', payPurchaseDebt);

export default router;