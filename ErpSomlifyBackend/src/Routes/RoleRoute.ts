import express from 'express';
import {
    getAllRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    addPermissionToRole,
    removePermissionFromRole,
    getMainUserRoles,
    assignRoleToMainUser,
    removeRoleFromMainUser,
} from '../controllers/RoleController';
import { decodeTokenOrMainToken, requirePermission, isSuperAdmin } from '../middlewares';

const router = express.Router();

// All routes require authentication
router.use(decodeTokenOrMainToken);

// Role CRUD
router.get('/', requirePermission('roles', 'read'), getAllRoles);
router.get('/:id', requirePermission('roles', 'read'), getRole);
router.post('/', isSuperAdmin, createRole);
router.put('/:id', isSuperAdmin, updateRole);
router.delete('/:id', isSuperAdmin, deleteRole);

// Company User-Role assignments
router.get('/users/:userId', requirePermission('roles', 'read'), getUserRoles);
router.post('/:roleId/users/:userId', isSuperAdmin, assignRoleToUser);
router.delete('/:roleId/users/:userId', isSuperAdmin, removeRoleFromUser);

// Main User-Role assignments
router.get('/main-users/:userId', requirePermission('roles', 'read'), getMainUserRoles);
router.post('/:roleId/main-users/:userId', isSuperAdmin, assignRoleToMainUser);
router.delete('/:roleId/main-users/:userId', isSuperAdmin, removeRoleFromMainUser);

// Role-Permission assignments
router.post('/:roleId/permissions/:permissionId', isSuperAdmin, addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', isSuperAdmin, removePermissionFromRole);

export default router;
