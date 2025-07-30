import { Router } from 'express';
import {
    fetchPharmacyInfo,
    modifyPharmacyInfo,
} from '../controllers/pharmacy.controller';
import { checkAdminFirstSetup } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pharmacy-info', fetchPharmacyInfo);
router.put('/pharmacy-info', modifyPharmacyInfo);
router.get('/admin-first-setup', authenticate, checkAdminFirstSetup);

export default router;
