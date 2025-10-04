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
import { authorizeAuthenticated } from '../middlewares/authorize.middleware';
import { requirePermission } from '../services/permission.service';
import {
    PHARMACY_PERMISSIONS,
    USER_PERMISSIONS,
} from '../constants/permissions';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();

// Admin level: Toggle sale short code feature
router.post(
    '/toggle-sale-shortcode',
    authenticate,
    csrfProtection,
    requirePermission(PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS),
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
    requirePermission(PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS),
    modifyPharmacyInfo,
);

router.get(
    '/admin-first-setup',
    authenticate,
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    checkAdminFirstSetup,
);

// Admin level: Update short code settings
router.patch(
    '/short-code-settings',
    authenticate,
    csrfProtection,
    requirePermission(PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS),
    updateShortCodeSettings,
);

// Super Admin routes for pharmacy management (system-level)
router.post(
    '/create',
    authenticate,
    csrfProtection,
    requirePermission(PHARMACY_PERMISSIONS.MANAGE_PHARMACY),
    createPharmacy,
);

router.get(
    '/all',
    authenticate,
    requirePermission(PHARMACY_PERMISSIONS.MANAGE_PHARMACY),
    getAllPharmacies,
);

router.delete(
    '/:pharmacyId',
    authenticate,
    csrfProtection,
    requirePermission(PHARMACY_PERMISSIONS.MANAGE_PHARMACY),
    deletePharmacy,
);

router.post(
    '/:pharmacyId/assign-admin',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.CREATE_USER), // For creating/assigning admins
    assignAdminToPharmacy,
);

// Super Admin routes for admin management (system-level)
router.get(
    '/admins/all',
    authenticate,
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    getAllAdmins,
);

router.post(
    '/admins/create',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.CREATE_USER),
    createAdminUser,
);

export default router;
