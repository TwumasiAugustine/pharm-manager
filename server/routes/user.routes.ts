import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
    authorizeUserCreation,
    authorizeUserManagement,
    authorizeScope,
} from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
    createUserSchema,
    updateUserSchema,
} from '../validations/user.validation';
import { UserRole } from '../types/user.types';
import { requirePermission } from '../services/permission.service';
import { USER_PERMISSIONS } from '../constants/permissions';

import { assignPermissions } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Get all users (admin level access for managing users)
router.get(
    '/',
    authenticate,
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    (req, res, next) => controller.getUsers(req, res, next),
);

// Assign permissions to user (hierarchy-based)
router.post(
    '/assign-permissions',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.MANAGE_PERMISSIONS),
    assignPermissions,
);

// Create a new user (role-specific creation)
router.post(
    '/',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.CREATE_USER),
    // Prevent creating users until at least one branch exists
    require('../middlewares/ensure-branches.middleware').ensureBranchesExist,
    validate(createUserSchema),
    (req, res, next) => controller.createUser(req, res, next),
);

// Update a user (admin level access)
router.put(
    '/:id',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.UPDATE_USER),
    validate(updateUserSchema),
    (req, res, next) => controller.updateUser(req, res, next),
);

// Delete a user (admin level access)
router.delete(
    '/:id',
    authenticate,
    requirePermission(USER_PERMISSIONS.DELETE_USER),
    (req, res, next) => controller.deleteUser(req, res, next),
);

// Get user statistics (admin level access)
router.get(
    '/stats',
    authenticate,
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    (req, res, next) => controller.getUserStats(req, res, next),
);

export default router;
