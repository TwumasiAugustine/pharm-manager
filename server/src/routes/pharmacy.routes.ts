import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
    checkPharmacyConfigStatus,
    updateShortCodeSettings,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
    authorizeAdminLevel,
    authorizeAuthenticated,
} from '../middlewares/authorize.middleware';
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

// Authenticated users: Get pharmacy info (read-only for cashiers/pharmacists)
router.get(
    '/pharmacy-info',
    authenticate,
    authorizeAuthenticated(),
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

// Admin level: Update short code settings
router.put(
    '/short-code-settings',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    updateShortCodeSettings,
);

export default router;
