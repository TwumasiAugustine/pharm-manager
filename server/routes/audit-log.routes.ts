import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { AUDIT_PERMISSIONS } from '../constants/permissions';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/user.types';

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
 * @route   GET /api/audit-logs/platform-stats
 * @desc    Get platform-wide audit log statistics
 * @access  Private (Super Admin only)
 */
router.get(
    '/platform-stats',
    authenticate,
    authorize([UserRole.SUPER_ADMIN]),
    auditLogController.getPlatformStats.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/security-alerts
 * @desc    Get recent security alerts
 * @access  Private (Super Admin only)
 * @query   ?hours=24 (number of hours to look back, default 24)
 */
router.get(
    '/security-alerts',
    authenticate,
    authorize([UserRole.SUPER_ADMIN]),
    auditLogController.getSecurityAlerts.bind(auditLogController),
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
