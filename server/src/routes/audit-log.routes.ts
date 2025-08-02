import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();
const auditLogController = new AuditLogController();

/**
 * @route   GET /api/audit-logs
 * @desc    Get paginated audit logs with filtering
 * @access  Private (Admin only)
 */
router.get(
    '/',
    authenticate,
    authorize([UserRole.ADMIN]),
    auditLogController.getAuditLogs.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Private (Admin only)
 */
router.get(
    '/stats',
    authenticate,
    authorize([UserRole.ADMIN]),
    auditLogController.getAuditLogStats.bind(auditLogController),
);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get specific audit log by ID
 * @access  Private (Admin only)
 */
router.get(
    '/:id',
    authenticate,
    authorize([UserRole.ADMIN]),
    auditLogController.getAuditLogById.bind(auditLogController),
);

/**
 * @route   DELETE /api/audit-logs/cleanup
 * @desc    Delete old audit logs (cleanup utility)
 * @access  Private (Admin only)
 * @query   ?days=90 (number of days to keep, default 90)
 */
router.delete(
    '/cleanup',
    authenticate,
    authorize([UserRole.ADMIN]),
    auditLogController.cleanupOldLogs.bind(auditLogController),
);

export default router;
