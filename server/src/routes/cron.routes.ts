import { Router } from 'express';
import { cronController } from '../controllers/cron.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

// Apply authentication and admin authorization to all cron routes
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

/**
 * @route GET /api/cron/status
 * @desc Get cron job status and information
 * @access Admin only
 */
router.get('/status', cronController.getCronJobStatus.bind(cronController));

/**
 * @route POST /api/cron/trigger-expiry-notifications
 * @desc Manually trigger expiry notifications creation
 * @access Admin only
 */
router.post(
    '/trigger-expiry-notifications',
    cronController.triggerExpiryNotifications.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-cleanup-notifications
 * @desc Manually trigger cleanup of old notifications
 * @access Admin only
 */
router.post(
    '/trigger-cleanup-notifications',
    cronController.triggerCleanupNotifications.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-daily-audit-cleanup
 * @desc Manually trigger daily audit log cleanup (user requested manual control)
 * @access Admin only
 */
router.post(
    '/trigger-daily-audit-cleanup',
    cronController.triggerDailyAuditLogCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-weekly-audit-cleanup
 * @desc Manually trigger weekly audit log cleanup
 * @access Admin only
 */
router.post(
    '/trigger-weekly-audit-cleanup',
    cronController.triggerWeeklyAuditLogCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-monthly-user-activity-cleanup
 * @desc Manually trigger monthly user activity cleanup
 * @access Admin only
 */
router.post(
    '/trigger-monthly-user-activity-cleanup',
    cronController.triggerMonthlyUserActivityCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-inventory-check
 * @desc Manually trigger inventory check
 * @access Admin only
 */
router.post(
    '/trigger-inventory-check',
    cronController.triggerInventoryCheck.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-expired-sessions-cleanup
 * @desc Manually trigger expired sessions cleanup
 * @access Admin only
 */
router.post(
    '/trigger-expired-sessions-cleanup',
    cronController.triggerExpiredSessionsCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-weekly-summary-reports
 * @desc Manually trigger weekly summary reports generation
 * @access Admin only
 */
router.post(
    '/trigger-weekly-summary-reports',
    cronController.triggerWeeklySummaryReports.bind(cronController),
);

export default router;
