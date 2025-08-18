import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/user.types';
import { validate } from '../middlewares/validation.middleware';
import {
    createUserSchema,
    updateUserSchema,
} from '../validations/user.validation';

import { assignPermissions } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Get all users (admin only)
router.get('/', authenticate, authorize([UserRole.ADMIN]), (req, res, next) =>
    controller.getUsers(req, res, next),
);
// Admin: Assign permissions to user
router.post(
    '/assign-permissions',
    authenticate,
    csrfProtection,
    assignPermissions,
);

// Create a new user (admin only)
router.post(
    '/',
    authenticate,
    csrfProtection,
    authorize([UserRole.ADMIN]),
    validate(createUserSchema),
    (req, res, next) => controller.createUser(req, res, next),
);

// Update a user (admin only)
router.put(
    '/:id',
    authenticate,
    csrfProtection,
    authorize([UserRole.ADMIN]),
    validate(updateUserSchema),
    (req, res, next) => controller.updateUser(req, res, next),
);

// Delete a user (admin only)
router.delete(
    '/:id',
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res, next) => controller.deleteUser(req, res, next),
);

export default router;
