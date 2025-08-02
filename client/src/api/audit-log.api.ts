import api from './api';
import type {
    AuditLogFilters,
    AuditLogsListResponse,
    AuditLogStatsResponse,
    AuditLogResponse,
} from '../types/audit-log.types';

/**
 * Audit Logs API endpoints
 */
export const auditLogApi = {
    /**
     * Get paginated audit logs with filtering
     */
    getAuditLogs: async (
        filters: AuditLogFilters = {},
    ): Promise<AuditLogsListResponse> => {
        const params = new URLSearchParams();

        if (filters.userId) params.append('userId', filters.userId);
        if (filters.action) params.append('action', filters.action);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.userRole) params.append('userRole', filters.userRole);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/audit-logs?${params}`);
        return response.data.data;
    },

    /**
     * Get audit log statistics
     */
    getAuditLogStats: async (): Promise<AuditLogStatsResponse> => {
        const response = await api.get('/audit-logs/stats');
        return response.data.data;
    },

    /**
     * Get specific audit log by ID
     */
    getAuditLogById: async (id: string): Promise<AuditLogResponse> => {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data.data;
    },

    /**
     * Cleanup old audit logs
     */
    cleanupOldLogs: async (
        daysToKeep: number = 90,
    ): Promise<{ deletedCount: number }> => {
        const response = await api.delete(
            `/audit-logs/cleanup?days=${daysToKeep}`,
        );
        return response.data.data;
    },
};
