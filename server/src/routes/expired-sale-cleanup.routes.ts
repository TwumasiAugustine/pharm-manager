/**
 * Expired Sale Cleanup Routes
 * Routes for managing expired sale cleanup operations
 */

import { Router } from 'express';
import { expiredSaleCleanupController } from '../controllers/expired-sale-cleanup.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';

const router = Router();

// Admin only: Manually trigger cleanup of expired sales
router.post(
    '/cleanup-expired',
    authenticate,
    authorizeAdminLevel(),
    expiredSaleCleanupController.cleanupExpiredSales,
);

// Admin only: Get stats about expired sales
router.get(
    '/expired-stats',
    authenticate,
    authorizeAdminLevel(),
    expiredSaleCleanupController.getExpiredSaleStats,
);

export default router;
