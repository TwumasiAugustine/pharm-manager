import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
    createUserSchema,
    updateUserSchema,
} from '../validations/user.validation';

import { assignPermissions } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Get all users (admin level access: admin or super_admin)
router.get('/', authenticate, authorizeAdminLevel(), (req, res, next) =>
    controller.getUsers(req, res, next),
);
// Admin: Assign permissions to user
router.post(
    '/assign-permissions',
    authenticate,
    csrfProtection,
    assignPermissions,
);

// Create a new user (admin level access)
router.post(
    '/',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    validate(createUserSchema),
    (req, res, next) => controller.createUser(req, res, next),
);

// Update a user (admin level access)
router.put(
    '/:id',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    validate(updateUserSchema),
    (req, res, next) => controller.updateUser(req, res, next),
);

// Delete a user (admin level access)
router.delete('/:id', authenticate, authorizeAdminLevel(), (req, res, next) =>
    controller.deleteUser(req, res, next),
);

// Get user statistics (admin level access)
router.get('/stats', authenticate, authorizeAdminLevel(), (req, res, next) =>
    controller.getUserStats(req, res, next),
);

export default router;
