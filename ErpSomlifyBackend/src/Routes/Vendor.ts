import express from 'express';
import { queryValidator } from '../decorators/queryValidator';
import { createVendors, deleteVendor, getAllVendors, getVendor, updateVendor } from '../controllers';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('vendors', 'read'), getAllVendors);
router.get('/:id', requirePermission('vendors', 'read'), getVendor);
router.post('/', requirePermission('vendors', 'create'), createVendors);
router.put('/:id', requirePermission('vendors', 'update'), updateVendor);
router.delete('/:id', requirePermission('vendors', 'delete'), deleteVendor);

export default router;