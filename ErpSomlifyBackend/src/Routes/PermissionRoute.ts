import express from 'express';
import {
    getAllPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
    bulkCreatePermissions,
    getPermissionsByResource,
} from '../controllers/PermissionController';
import { decodeTokenOrMainToken, requirePermission, isSuperAdmin } from '../middlewares';

const router = express.Router();

// All routes require authentication
router.use(decodeTokenOrMainToken);

// Permission CRUD
router.get('/', requirePermission('permissions', 'read'), getAllPermissions);
router.get('/grouped', requirePermission('permissions', 'read'), getPermissionsByResource);
router.get('/:id', requirePermission('permissions', 'read'), getPermission);
router.post('/', isSuperAdmin, createPermission);
router.post('/bulk', isSuperAdmin, bulkCreatePermissions);
router.put('/:id', isSuperAdmin, updatePermission);
router.delete('/:id', isSuperAdmin, deletePermission);

export default router;
