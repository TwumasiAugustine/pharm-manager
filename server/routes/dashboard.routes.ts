import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { REPORT_PERMISSIONS } from '../constants/permissions';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get dashboard analytics with overview and charts data
 * @access  Private (operational staff only)
 * @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&period=day|week|month|year
 */
router.get(
    '/analytics',
    requirePermission(REPORT_PERMISSIONS.VIEW_ANALYTICS),
    dashboardController.getDashboardAnalytics.bind(dashboardController),
);

/**
 * @route   GET /api/dashboard/trends
 * @desc    Get sales trends for charts
 * @access  Private (operational staff only)
 * @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&period=day|week|month
 */
router.get(
    '/trends',
    requirePermission(REPORT_PERMISSIONS.VIEW_ANALYTICS),
    dashboardController.getSalesTrends.bind(dashboardController),
);

export default router;
