import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
    createUserSchema,
    updateUserSchema,
} from '../validations/user.validation';

const router = Router();
const authController = new AuthController();
import createAuthRateLimiter from '../middlewares/rateLimit.middleware';
const authRateLimiter = createAuthRateLimiter();

// Public routes
router.post(
    '/register',
    authRateLimiter,
    authController.signup.bind(authController),
);
router.post(
    '/signup',
    authRateLimiter,
    authController.signup.bind(authController),
);
router.post(
    '/login',
    authRateLimiter,
    authController.login.bind(authController),
);
router.post(
    '/refresh',
    authRateLimiter,
    authController.refresh.bind(authController),
);

// Protected routes
router.post(
    '/logout',
    authenticate,
    authController.logout.bind(authController),
);
router.get(
    '/profile',
    authenticate,
    authController.getProfile.bind(authController),
);
router.get('/me', authenticate, authController.getProfile.bind(authController));

// Admin User Management Routes (consolidated into auth)
router.get(
    '/users',
    authenticate,
    authorizeAdminLevel(),
    authController.getUsers.bind(authController),
);

router.post(
    '/users',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    validate(createUserSchema),
    authController.createUser.bind(authController),
);

router.put(
    '/users/:id',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    validate(updateUserSchema),
    authController.updateUser.bind(authController),
);

router.delete(
    '/users/:id',
    authenticate,
    authorizeAdminLevel(),
    authController.deleteUser.bind(authController),
);

router.post(
    '/users/assign-permissions',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    authController.assignPermissions.bind(authController),
);

router.get(
    '/admin/first-setup',
    authenticate,
    authController.checkAdminFirstSetup.bind(authController),
);

export default router;
