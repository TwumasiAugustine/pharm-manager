import { Router } from 'express';
import { UserActivityController } from '../controllers/user-activity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();
const userActivityController = new UserActivityController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/user-activities
 * @desc    Get user activities with filtering and pagination (Admin level access)
 * @access  Private (Admin level: admin or super_admin)
 * @query   page, limit, userId, sessionId, activityType, resource, startDate, endDate, isActive, userRole, ipAddress
 */
router.get(
    '/',
    authorizeAdminLevel(),
    userActivityController.getUserActivities,
);

/**
 * @route   GET /api/user-activities/stats
 * @desc    Get user activity statistics (Admin level access)
 * @access  Private (Admin level: admin or super_admin)
 * @query   startDate, endDate, userId
 */
router.get(
    '/stats',
    authorizeAdminLevel(),
    userActivityController.getUserActivityStats,
);

/**
 * @route   GET /api/user-activities/my-activities
 * @desc    Get current user's activities
 * @access  Private
 * @query   page, limit, activityType, resource, startDate, endDate
 */
router.get('/my-activities', userActivityController.getMyActivities);

/**
 * @route   GET /api/user-activities/sessions/:sessionId
 * @desc    Get detailed session information (Admin level access)
 * @access  Private (Admin level: admin or super_admin)
 * @param   sessionId - Session ID
 */
router.get(
    '/sessions/:sessionId',
    authorizeAdminLevel(),
    userActivityController.getUserSession,
);

/**
 * @route   DELETE /api/user-activities/cleanup
 * @desc    Clean up old activity records (Admin level access)
 * @access  Private (Admin level: admin or super_admin)
 * @query   daysToKeep (default: 90)
 */
router.delete(
    '/cleanup',
    authorizeAdminLevel(),
    userActivityController.cleanupOldActivities,
);

export default router;
