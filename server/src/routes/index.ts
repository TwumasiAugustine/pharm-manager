import { Router } from 'express';
import authRoutes from './auth.routes';
import drugRoutes from './drug.routes';
import saleRoutes from './sale.routes';
import pharmacyRoutes from './pharmacy.routes';
import customerRoutes from './customer.routes';

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

export default router;
