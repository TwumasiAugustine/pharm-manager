import { AuditLog, IAuditLog } from '../models/audit-log.model';
import type {
    AuditLogFilters,
    CreateAuditLogRequest,
    AuditLogResponse,
    AuditLogsListResponse,
    AuditLogStatsResponse,
} from '../types/audit-log.types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { ITokenPayload } from '../types/auth.types';
import { getPharmacyScopingFilter } from '../utils/data-scoping';
import { UserRole } from '../types/user.types';

export class AuditLogService {
    /**
     * Create a new audit log entry
     */
    async createAuditLog(data: CreateAuditLogRequest): Promise<IAuditLog> {
        const auditLog = new AuditLog({
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details,
            timestamp: new Date(),
        });

        await auditLog.save();
        return auditLog;
    }

    /**
     * Get paginated audit logs with filtering
     */
    async getAuditLogs(
        filters: AuditLogFilters,
        user: ITokenPayload,
    ): Promise<AuditLogsListResponse> {
        const {
            userId,
            action,
            resource,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            userRole,
        } = filters;

        // Build query with data scoping
        const query: any = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (userRole) query['details.userRole'] = userRole;

        // Apply pharmacy-based data scoping
        const scopingFilter = getPharmacyScopingFilter(user);
        Object.assign(query, scopingFilter);

        // Date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('userId', 'name email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query),
        ]);

        // Map to response format
        const data: AuditLogResponse[] = logs.map((log: any) => ({
            id: log._id.toString(),
            userId: log.userId._id.toString(),
            userName: log.userId.name,
            action: log.action,
            resource: log.resource,
            resourceId: log.resourceId,
            details: log.details,
            timestamp: log.timestamp.toISOString(),
            createdAt: log.createdAt.toISOString(),
        }));

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get audit log statistics
     */
    async getAuditLogStats(
        user: ITokenPayload,
    ): Promise<AuditLogStatsResponse> {
        const now = new Date();
        const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Apply pharmacy-based data scoping
        const scopingFilter = getPharmacyScopingFilter(user);

        const [
            totalLogs,
            todayLogs,
            weekLogs,
            actionBreakdown,
            resourceBreakdown,
            topUsers,
        ] = await Promise.all([
            AuditLog.countDocuments(scopingFilter),
            AuditLog.countDocuments({
                ...scopingFilter,
                timestamp: { $gte: todayStart },
            }),
            AuditLog.countDocuments({
                ...scopingFilter,
                timestamp: { $gte: weekStart },
            }),
            this.getActionBreakdown(user),
            this.getResourceBreakdown(user),
            this.getTopUsers(user),
        ]);

        return {
            totalLogs,
            todayLogs,
            weekLogs,
            actionBreakdown,
            resourceBreakdown,
            topUsers,
        };
    }

    /**
     * Get audit log by ID (admin only)
     */
    async getAuditLogById(
        id: string,
        user: ITokenPayload,
    ): Promise<AuditLogResponse> {
        const scopingFilter = getPharmacyScopingFilter(user);
        const query = { _id: id, ...scopingFilter };

        const log = await AuditLog.findOne(query)
            .populate('userId', 'name email role')
            .lean();

        if (!log) {
            throw new NotFoundError('Audit log not found');
        }

        return {
            id: log._id.toString(),
            userId: (log.userId as any)._id.toString(),
            userName: (log.userId as any).name,
            action: log.action,
            resource: log.resource,
            resourceId: log.resourceId,
            details: log.details,
            timestamp: log.timestamp.toISOString(),
            createdAt: log.createdAt.toISOString(),
        };
    }

    /**
     * Delete old audit logs (cleanup utility)
     */
    async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await AuditLog.deleteMany({
            timestamp: { $lt: cutoffDate },
        });

        return result.deletedCount || 0;
    }

    /**
     * Helper: Get action breakdown
     */
    private async getActionBreakdown(
        user: ITokenPayload,
    ): Promise<Record<string, number>> {
        const scopingFilter = getPharmacyScopingFilter(user);

        const pipeline: any[] = [];

        // Add match stage if scoping filter is not empty
        if (Object.keys(scopingFilter).length > 0) {
            pipeline.push({ $match: scopingFilter });
        }

        // Add aggregation stages
        pipeline.push({
            $group: {
                _id: '$action',
                count: { $sum: 1 },
            },
        });

        const result = await AuditLog.aggregate(pipeline);

        const breakdown: Record<string, number> = {};
        result.forEach((item) => {
            breakdown[item._id] = item.count;
        });

        return breakdown;
    }

    /**
     * Helper: Get resource breakdown
     */
    private async getResourceBreakdown(
        user: ITokenPayload,
    ): Promise<Record<string, number>> {
        const scopingFilter = getPharmacyScopingFilter(user);

        const pipeline: any[] = [];

        // Add match stage if scoping filter is not empty
        if (Object.keys(scopingFilter).length > 0) {
            pipeline.push({ $match: scopingFilter });
        }

        // Add aggregation stages
        pipeline.push({
            $group: {
                _id: '$resource',
                count: { $sum: 1 },
            },
        });

        const result = await AuditLog.aggregate(pipeline);

        const breakdown: Record<string, number> = {};
        result.forEach((item) => {
            breakdown[item._id] = item.count;
        });

        return breakdown;
    }

    /**
     * Helper: Get top users by activity
     */
    private async getTopUsers(
        user: ITokenPayload,
    ): Promise<Array<{ userId: string; userName: string; count: number }>> {
        const scopingFilter = getPharmacyScopingFilter(user);

        const pipeline: any[] = [];

        // Add match stage if scoping filter is not empty
        if (Object.keys(scopingFilter).length > 0) {
            pipeline.push({ $match: scopingFilter });
        }

        // Add aggregation stages
        pipeline.push(
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    userName: '$user.name',
                    count: 1,
                },
            },
        );

        const result = await AuditLog.aggregate(pipeline);

        return result.map((item) => ({
            userId: item.userId.toString(),
            userName: item.userName,
            count: item.count,
        }));
    }

    /**
     * Cleanup old audit logs
     */
    async cleanupOldLogs(daysToKeep: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await AuditLog.deleteMany({
                timestamp: { $lt: cutoffDate },
            });

            return result.deletedCount || 0;
        } catch (error) {
            throw new BadRequestError('Failed to cleanup old audit logs');
        }
    }
}
