import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
    checkPharmacyConfigStatus,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

// Admin: Toggle sale short code feature
router.post(
    '/toggle-sale-shortcode',
    authenticate,
    csrfProtection,
    toggleSaleShortCodeFeature,
);

// Expose pharmacy configuration status
router.get('/status', checkPharmacyConfigStatus);

router.get('/pharmacy-info', fetchPharmacyInfo);
router.put('/pharmacy-info', csrfProtection, modifyPharmacyInfo);
router.get(
    '/admin-first-setup',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER]),
    checkAdminFirstSetup,
);

export default router;
