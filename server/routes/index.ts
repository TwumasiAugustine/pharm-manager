import { Router } from 'express';
import branchRoutes from './branch.routes';
import stockRoutes from './stock.routes';
import { generateCsrfToken } from '../middlewares/csrf.middleware';
import authRoutes from './auth.routes';
import drugRoutes from './drug.routes';
import saleRoutes from './sale.routes';
import pharmacyRoutes from './pharmacy.routes';
import customerRoutes from './customer.routes';
import userRoutes from './user.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import expiryRoutes from './expiry.routes';
import auditLogRoutes from './audit-log.routes';
import userActivityRoutes from './user-activity.routes';
import cronRoutes from './cron.routes';
import expiredSaleCleanupRoutes from './expired-sale-cleanup.routes';
import permissionRoutes from './permission.routes';
import healthRoutes from './health.routes';

const router = Router();

// Health routes
router.use('/health', healthRoutes);

// CSRF token endpoint for frontend to fetch and set CSRF cookie

router.get('/csrf-token', (req, res) => {
    if (!req.cookies['csrfToken']) {
        const token = generateCsrfToken();
        res.cookie('csrfToken', token, {
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        return res.json({ csrfToken: token });
    }
    return res.json({ csrfToken: req.cookies['csrfToken'] });
});

// API routes
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/stock', stockRoutes);
router.use('/drugs', drugRoutes);
router.use('/sales', saleRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/customers', customerRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/expiry', expiryRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/user-activities', userActivityRoutes);
router.use('/cron', cronRoutes);
router.use('/expired-sales', expiredSaleCleanupRoutes);
router.use('/permissions', permissionRoutes);

export default router;
