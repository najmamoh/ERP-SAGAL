import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { createPayable, findPayable } from '../controllers';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/products', requirePermission('vendors', 'read'), findPayable);
router.post('/products', requirePermission('vendors', 'create'), createPayable);

export default router;