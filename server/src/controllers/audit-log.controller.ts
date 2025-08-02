import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { successResponse } from '../utils/response';
import type { AuditLogFilters } from '../types/audit-log.types';

export class AuditLogController {
    private auditLogService: AuditLogService;

    constructor() {
        this.auditLogService = new AuditLogService();
    }

    /**
     * Get paginated audit logs with filtering
     * @route GET /api/audit-logs
     * @access Private (Admin only)
     */
    async getAuditLogs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const filters: AuditLogFilters = {
                userId: req.query.userId as string,
                action: req.query.action as any,
                resource: req.query.resource as any,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                userRole: req.query.userRole as string,
            };

            const result = await this.auditLogService.getAuditLogs(filters);

            res.status(200).json(
                successResponse(result, 'Audit logs retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get audit log statistics
     * @route GET /api/audit-logs/stats
     * @access Private (Admin only)
     */
    async getAuditLogStats(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const stats = await this.auditLogService.getAuditLogStats();

            res.status(200).json(
                successResponse(stats, 'Audit log statistics retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific audit log by ID
     * @route GET /api/audit-logs/:id
     * @access Private (Admin only)
     */
    async getAuditLogById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            const auditLog = await this.auditLogService.getAuditLogById(id);

            res.status(200).json(
                successResponse(auditLog, 'Audit log retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete old audit logs (cleanup utility)
     * @route DELETE /api/audit-logs/cleanup
     * @access Private (Admin only)
     */
    async cleanupOldLogs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const daysToKeep = req.query.days
                ? Number(req.query.days)
                : 90;

            const deletedCount = await this.auditLogService.deleteOldLogs(
                daysToKeep,
            );

            res.status(200).json(
                successResponse(
                    { deletedCount },
                    `Cleanup completed. ${deletedCount} old audit logs deleted.`,
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
