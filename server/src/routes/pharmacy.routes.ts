import { Router } from 'express';
import { toggleSaleShortCodeFeature, fetchPharmacyInfo, modifyPharmacyInfo } from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Admin: Toggle sale short code feature
router.post('/toggle-sale-shortcode', authenticate, toggleSaleShortCodeFeature);

router.get('/pharmacy-info', fetchPharmacyInfo);
router.put('/pharmacy-info', modifyPharmacyInfo);
router.get('/admin-first-setup', authenticate, checkAdminFirstSetup);

export default router;
