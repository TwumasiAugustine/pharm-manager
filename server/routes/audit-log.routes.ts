import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';

const router = Router();
const auditLogController = new AuditLogController();

/**
 * @route   GET /api/audit-logs
 * @desc    Get paginated audit logs with filtering
 * @access  Private (Admin level: admin or super_admin)
 */
router.get(
    '/',
    authenticate,
    authorizeAdminLevel(),
    auditLogController.getAuditLogs.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Private (Admin level: admin or super_admin)
 */
router.get(
    '/stats',
    authenticate,
    authorizeAdminLevel(),
    auditLogController.getAuditLogStats.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get specific audit log by ID
 * @access  Private (Admin level: admin or super_admin)
 */
router.get(
    '/:id',
    authenticate,
    authorizeAdminLevel(),
    auditLogController.getAuditLogById.bind(auditLogController),
);

/**
 * @route   DELETE /api/audit-logs/cleanup
 * @desc    Delete old audit logs (cleanup utility)
 * @access  Private (Admin level: admin or super_admin)
 * @query   ?days=90 (number of days to keep, default 90)
 */
router.delete(
    '/cleanup',
    authenticate,
    authorizeAdminLevel(),
    auditLogController.cleanupOldLogs.bind(auditLogController),
);

export default router;
