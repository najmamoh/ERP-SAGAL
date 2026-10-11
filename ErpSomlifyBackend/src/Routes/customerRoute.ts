import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { createCustomers, deleteCustomer, getAllCustomers, getCustomer, updateCustomer } from '../controllers';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('customers', 'read'), getAllCustomers);
router.get('/:id', requirePermission('customers', 'read'), getCustomer);
router.post('/', requirePermission('customers', 'create'), createCustomers);
router.put('/:id', requirePermission('customers', 'update'), updateCustomer);
router.delete('/:id', requirePermission('customers', 'delete'), deleteCustomer);

export default router;
