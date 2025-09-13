import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
    checkPharmacyConfigStatus,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();

// Admin level: Toggle sale short code feature
router.post(
    '/toggle-sale-shortcode',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    toggleSaleShortCodeFeature,
);

// Expose pharmacy configuration status (public)
router.get('/status', checkPharmacyConfigStatus);

// Admin level: Get pharmacy info
router.get(
    '/pharmacy-info',
    authenticate,
    authorizeAdminLevel(),
    fetchPharmacyInfo,
);

// Admin level: Update pharmacy info
router.put(
    '/pharmacy-info',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    modifyPharmacyInfo,
);

router.get(
    '/admin-first-setup',
    authenticate,
    authorizeAdminLevel(),
    checkAdminFirstSetup,
);

export default router;
