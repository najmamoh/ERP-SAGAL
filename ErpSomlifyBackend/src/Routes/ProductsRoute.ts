import express from 'express';
import { createProducts, deleteProduct, getAllProducts, getProduct, updateProduct } from '../controllers';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('products', 'read'), getAllProducts);
router.get('/:id', requirePermission('products', 'read'), getProduct);
router.post('/', requirePermission('products', 'create'), createProducts);
router.put('/:id', requirePermission('products', 'update'), updateProduct);
router.delete('/:id', requirePermission('products', 'delete'), deleteProduct);

export default router;