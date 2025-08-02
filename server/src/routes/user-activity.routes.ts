import { Router } from 'express';
import { UserActivityController } from '../controllers/user-activity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();
const userActivityController = new UserActivityController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/user-activities
 * @desc    Get user activities with filtering and pagination (Admin only)
 * @access  Private (Admin only)
 * @query   page, limit, userId, sessionId, activityType, resource, startDate, endDate, isActive, userRole, ipAddress
 */
router.get(
    '/',
    authorize([UserRole.ADMIN]),
    userActivityController.getUserActivities,
);

/**
 * @route   GET /api/user-activities/stats
 * @desc    Get user activity statistics (Admin only)
 * @access  Private (Admin only)
 * @query   startDate, endDate, userId
 */
router.get(
    '/stats',
    authorize([UserRole.ADMIN]),
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
 * @desc    Get detailed session information (Admin only)
 * @access  Private (Admin only)
 * @param   sessionId - Session ID
 */
router.get(
    '/sessions/:sessionId',
    authorize([UserRole.ADMIN]),
    userActivityController.getUserSession,
);

/**
 * @route   DELETE /api/user-activities/cleanup
 * @desc    Clean up old activity records (Admin only)
 * @access  Private (Admin only)
 * @query   daysToKeep (default: 90)
 */
router.delete(
    '/cleanup',
    authorize([UserRole.ADMIN]),
    userActivityController.cleanupOldActivities,
);

export default router;
