import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
    checkPharmacyConfigStatus,
    updateShortCodeSettings,
    createPharmacy,
    getAllPharmacies,
    getPharmaciesByRole,
    deletePharmacy,
    assignAdminToPharmacy,
    removeAdminFromPharmacy,
    removeAdminFromAllPharmacies,
    getAllAdmins,
    getAdminsByRole,
    updateAdminUser,
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

// Super Admin routes for admin management (system-level) - PUT BEFORE GENERIC ROUTES
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

router.put(
    '/admins/:adminId',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.UPDATE_USER),
    updateAdminUser,
);

router.delete(
    '/admins/:adminId/remove-from-all',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.MANAGE_USERS), // For removing admins from all pharmacies
    removeAdminFromAllPharmacies,
);

// Role-aware routes (accessible by both Super Admin and Admin)
router.get(
    '/by-role',
    authenticate,
    requirePermission(PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO),
    getPharmaciesByRole,
);

router.get(
    '/admins/by-role',
    authenticate,
    requirePermission(USER_PERMISSIONS.VIEW_USERS),
    getAdminsByRole,
);

// Generic pharmacy routes - PUT AFTER SPECIFIC ROUTES
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

router.delete(
    '/:pharmacyId/remove-admin/:adminId',
    authenticate,
    csrfProtection,
    requirePermission(USER_PERMISSIONS.MANAGE_USERS), // For removing admins
    removeAdminFromPharmacy,
);

export default router;
