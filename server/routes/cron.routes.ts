import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';
import { cronController } from '../controllers/cron.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';

const router = Router();

// Apply authentication and admin level authorization to all cron routes
router.use(authenticate);
router.use(authorizeAdminLevel());

/**
 * @route GET /api/cron/status
 * @desc Get cron job status and information
 * @access Admin level (admin or super_admin)
 */
router.get('/status', cronController.getCronJobStatus.bind(cronController));

/**
 * @route POST /api/cron/trigger-expiry-notifications
 * @desc Manually trigger expiry notifications creation
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-expiry-notifications',
    csrfProtection,
    cronController.triggerExpiryNotifications.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-cleanup-notifications
 * @desc Manually trigger cleanup of old notifications
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-cleanup-notifications',
    csrfProtection,
    cronController.triggerCleanupNotifications.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-daily-audit-cleanup
 * @desc Manually trigger daily audit log cleanup (user requested manual control)
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-daily-audit-cleanup',
    cronController.triggerDailyAuditLogCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-weekly-audit-cleanup
 * @desc Manually trigger weekly audit log cleanup
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-weekly-audit-cleanup',
    cronController.triggerWeeklyAuditLogCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-monthly-user-activity-cleanup
 * @desc Manually trigger monthly user activity cleanup
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-monthly-user-activity-cleanup',
    cronController.triggerMonthlyUserActivityCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-inventory-check
 * @desc Manually trigger inventory check
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-inventory-check',
    cronController.triggerInventoryCheck.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-expired-sessions-cleanup
 * @desc Manually trigger expired sessions cleanup
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-expired-sessions-cleanup',
    cronController.triggerExpiredSessionsCleanup.bind(cronController),
);

/**
 * @route POST /api/cron/trigger-weekly-summary-reports
 * @desc Manually trigger weekly summary reports generation
 * @access Admin level (admin or super_admin)
 */
router.post(
    '/trigger-weekly-summary-reports',
    cronController.triggerWeeklySummaryReports.bind(cronController),
);

export default router;
