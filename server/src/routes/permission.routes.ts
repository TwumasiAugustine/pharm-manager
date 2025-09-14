import express from 'express';
import PermissionController from '../controllers/permission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { USER_PERMISSIONS } from '../constants/permissions';

const router = express.Router();

// All permission routes require authentication
router.use(authenticate);

/**
 * @route GET /api/permissions
 * @desc Get all available permissions grouped by category
 * @access Private (requires VIEW_USERS permission)
 */
router.get(
    '/',
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    PermissionController.getAllPermissions,
);

/**
 * @route GET /api/permissions/role/:role
 * @desc Get permissions for a specific role
 * @access Private (requires VIEW_USERS permission)
 */
router.get(
    '/role/:role',
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    PermissionController.getRolePermissions,
);

/**
 * @route GET /api/permissions/current
 * @desc Get current user's permissions
 * @access Private
 */
router.get('/current', PermissionController.getCurrentUserPermissions);

/**
 * @route GET /api/permissions/check/:permission
 * @desc Check if current user has specific permission
 * @access Private
 */
router.get('/check/:permission', PermissionController.checkPermission);

/**
 * @route GET /api/permissions/user/:userId
 * @desc Get permissions for a specific user
 * @access Private (requires MANAGE_PERMISSIONS permission)
 */
router.get(
    '/user/:userId',
    requirePermission(USER_PERMISSIONS.MANAGE_PERMISSIONS),
    PermissionController.getUserPermissions,
);

/**
 * @route PUT /api/permissions/user/:userId
 * @desc Update user permissions
 * @access Private (requires MANAGE_PERMISSIONS permission)
 */
router.put(
    '/user/:userId',
    requirePermission(USER_PERMISSIONS.MANAGE_PERMISSIONS),
    PermissionController.updateUserPermissions,
);

/**
 * @route POST /api/permissions/user/:userId/add
 * @desc Add permissions to a user
 * @access Private (requires MANAGE_PERMISSIONS permission)
 */
router.post(
    '/user/:userId/add',
    requirePermission(USER_PERMISSIONS.MANAGE_PERMISSIONS),
    PermissionController.addUserPermissions,
);

/**
 * @route POST /api/permissions/user/:userId/remove
 * @desc Remove permissions from a user
 * @access Private (requires MANAGE_PERMISSIONS permission)
 */
router.post(
    '/user/:userId/remove',
    requirePermission(USER_PERMISSIONS.MANAGE_PERMISSIONS),
    PermissionController.removeUserPermissions,
);

export default router;
