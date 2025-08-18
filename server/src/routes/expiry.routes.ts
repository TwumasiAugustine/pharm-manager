import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';
import { ExpiryController } from '../controllers/expiry.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const expiryController = new ExpiryController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/expiry/drugs
 * @desc    Get drugs expiring within specified days
 * @access  Private
 * @query   daysRange, alertLevel, category, page, limit
 */
router.get('/drugs', expiryController.getExpiringDrugs.bind(expiryController));

/**
 * @route   GET /api/expiry/stats
 * @desc    Get expiry statistics
 * @access  Private
 */
router.get('/stats', expiryController.getExpiryStats.bind(expiryController));

/**
 * @route   GET /api/expiry/notifications
 * @desc    Get expiry notifications
 * @access  Private
 * @query   isRead, alertLevel, page, limit
 */
router.get(
    '/notifications',
    expiryController.getNotifications.bind(expiryController),
);

/**
 * @route   PUT /api/expiry/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
    '/notifications/:id/read',
    csrfProtection,
    expiryController.markNotificationAsRead.bind(expiryController),
);

/**
 * @route   PUT /api/expiry/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
    '/notifications/read-all',
    csrfProtection,
    expiryController.markAllNotificationsAsRead.bind(expiryController),
);

/**
 * @route   POST /api/expiry/notifications/create
 * @desc    Create/refresh expiry notifications
 * @access  Private
 */
router.post(
    '/notifications/create',
    csrfProtection,
    expiryController.createExpiryNotifications.bind(expiryController),
);

/**
 * @route   GET /api/expiry/drugs/:drugId/check
 * @desc    Check if drug is expired or expiring soon
 * @access  Private
 */
router.get(
    '/drugs/:drugId/check',
    expiryController.checkDrugExpiry.bind(expiryController),
);

export default router;
