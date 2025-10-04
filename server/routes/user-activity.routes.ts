import { Router } from 'express';
import { UserActivityController } from '../controllers/user-activity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { USER_PERMISSIONS } from '../constants/permissions';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();
const userActivityController = new UserActivityController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/user-activities
 * @desc    Get user activities with filtering and pagination (Admin level access)
 * @access  Private (Admin level for user oversight)
 * @query   page, limit, userId, sessionId, activityType, resource, startDate, endDate, isActive, userRole, ipAddress
 */
router.get(
    '/',
    requirePermission(USER_PERMISSIONS.VIEW_USER_ACTIVITY),
    userActivityController.getUserActivities,
);

/**
 * @route   GET /api/user-activities/stats
 * @desc    Get user activity statistics (Admin level access)
 * @access  Private (Admin level for user oversight)
 * @query   startDate, endDate, userId
 */
router.get(
    '/stats',
    requirePermission(USER_PERMISSIONS.VIEW_USER_ACTIVITY),
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
 * @access  Private (Admin level for user oversight)
 * @param   sessionId - Session ID
 */
router.get(
    '/sessions/:sessionId',
    requirePermission(USER_PERMISSIONS.VIEW_USER_ACTIVITY),
    userActivityController.getUserSession,
);

/**
 * @route   DELETE /api/user-activities/cleanup
 * @desc    Clean up old activity records (Admin level access)
 * @access  Private (Admin level for system maintenance)
 * @query   daysToKeep (default: 90)
 */
router.delete(
    '/cleanup',
    requirePermission(USER_PERMISSIONS.MANAGE_USERS),
    userActivityController.cleanupOldActivities,
);

export default router;
