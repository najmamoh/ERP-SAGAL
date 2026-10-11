import express from 'express';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';
import { createEmployees, deleteEmployee, getAllEmployees, getEmployee, updateEmployee } from '../controllers';

const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', requirePermission('employees', 'read'), getAllEmployees);
router.get('/:id', requirePermission('employees', 'read'), getEmployee);
router.post('/', requirePermission('employees', 'create'), createEmployees);
router.put('/:id', requirePermission('employees', 'update'), updateEmployee);
router.delete('/:id', requirePermission('employees', 'delete'), deleteEmployee);

export default router;