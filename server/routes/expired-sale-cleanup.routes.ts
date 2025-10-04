/**
 * Expired Sale Cleanup Routes
 * Routes for managing expired sale cleanup operations
 */

import { Router } from 'express';
import { expiredSaleCleanupController } from '../controllers/expired-sale-cleanup.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { SALES_PERMISSIONS } from '../constants/permissions';

const router = Router();

// Admin level: Manually trigger cleanup of expired sales
router.post(
    '/cleanup-expired',
    authenticate,
    requirePermission(SALES_PERMISSIONS.MANAGE_SALES),
    expiredSaleCleanupController.cleanupExpiredSales,
);

// Admin level: Get stats about expired sales
router.get(
    '/expired-stats',
    authenticate,
    requirePermission(SALES_PERMISSIONS.VIEW_SALES),
    expiredSaleCleanupController.getExpiredSaleStats,
);

export default router;
