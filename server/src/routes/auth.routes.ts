import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.signup.bind(authController));
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

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

export default router;
