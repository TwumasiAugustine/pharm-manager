import { Router } from 'express';
import authRoutes from './auth.routes';
import drugRoutes from './drug.routes';
import saleRoutes from './sale.routes';
import pharmacyRoutes from './pharmacy.routes';
import customerRoutes from './customer.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import expiryRoutes from './expiry.routes';
import auditLogRoutes from './audit-log.routes';
import userActivityRoutes from './user-activity.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/drugs', drugRoutes);
router.use('/sales', saleRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/expiry', expiryRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/user-activities', userActivityRoutes);

export default router;
