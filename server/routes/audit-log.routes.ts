import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { AUDIT_PERMISSIONS } from '../constants/permissions';

const router = Router();
const auditLogController = new AuditLogController();

/**
 * @route   GET /api/audit-logs
 * @desc    Get paginated audit logs with filtering
 * @access  Private (Admin level for audit oversight)
 */
router.get(
    '/',
    authenticate,
    requirePermission(AUDIT_PERMISSIONS.VIEW_AUDIT_LOGS),
    auditLogController.getAuditLogs.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Private (Admin level for audit oversight)
 */
router.get(
    '/stats',
    authenticate,
    requirePermission(AUDIT_PERMISSIONS.VIEW_AUDIT_LOGS),
    auditLogController.getAuditLogStats.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get specific audit log by ID
 * @access  Private (Admin level for audit oversight)
 */
router.get(
    '/:id',
    authenticate,
    requirePermission(AUDIT_PERMISSIONS.VIEW_AUDIT_LOGS),
    auditLogController.getAuditLogById.bind(auditLogController),
);

/**
 * @route   DELETE /api/audit-logs/cleanup
 * @desc    Delete old audit logs (cleanup utility)
 * @access  Private (Admin level for system maintenance)
 * @query   ?days=90 (number of days to keep, default 90)
 */
router.delete(
    '/cleanup',
    authenticate,
    requirePermission(AUDIT_PERMISSIONS.MANAGE_AUDIT_LOGS),
    auditLogController.cleanupOldLogs.bind(auditLogController),
);

export default router;
