import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
    checkPharmacyConfigStatus,
    updateShortCodeSettings,
    createPharmacy,
    getAllPharmacies,
    deletePharmacy,
    assignAdminToPharmacy,
    getAllAdmins,
    createAdminUser,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
    authorizeAdminLevel,
    authorizeAuthenticated,
    authorizeSuperAdmin,
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
router.patch(
    '/short-code-settings',
    authenticate,
    csrfProtection,
    authorizeAdminLevel(),
    updateShortCodeSettings,
);

// Super Admin routes for pharmacy management
router.post(
    '/create',
    authenticate,
    csrfProtection,
    authorizeSuperAdmin(),
    createPharmacy,
);

router.get('/all', authenticate, authorizeSuperAdmin(), getAllPharmacies);

router.delete(
    '/:pharmacyId',
    authenticate,
    csrfProtection,
    authorizeSuperAdmin(),
    deletePharmacy,
);

router.post(
    '/:pharmacyId/assign-admin',
    authenticate,
    csrfProtection,
    authorizeSuperAdmin(),
    assignAdminToPharmacy,
);

// Super Admin routes for admin management
router.get('/admins/all', authenticate, authorizeSuperAdmin(), getAllAdmins);

router.post(
    '/admins/create',
    authenticate,
    csrfProtection,
    authorizeSuperAdmin(),
    createAdminUser,
);

export default router;
