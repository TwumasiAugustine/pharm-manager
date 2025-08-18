import { Router } from 'express';
import {
    toggleSaleShortCodeFeature,
    fetchPharmacyInfo,
    modifyPharmacyInfo,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();

// Admin: Toggle sale short code feature
router.post(
    '/toggle-sale-shortcode',
    authenticate,
    csrfProtection,
    toggleSaleShortCodeFeature,
);

router.get('/pharmacy-info', fetchPharmacyInfo);
router.put('/pharmacy-info', csrfProtection, modifyPharmacyInfo);
router.get('/admin-first-setup', authenticate, checkAdminFirstSetup);

export default router;
