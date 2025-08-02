import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditLogApi } from '../api/audit-log.api';
import type {
    AuditLogFilters,
    AuditLogsListResponse,
    AuditLogStatsResponse,
    AuditLogResponse,
} from '../types/audit-log.types';
import { useSafeNotify } from '../utils/useSafeNotify';

/**
 * Query keys for audit logs
 */
export const AUDIT_LOG_QUERY_KEYS = {
    all: ['auditLogs'] as const,
    lists: () => [...AUDIT_LOG_QUERY_KEYS.all, 'list'] as const,
    list: (filters: AuditLogFilters) =>
        [...AUDIT_LOG_QUERY_KEYS.lists(), filters] as const,
    details: () => [...AUDIT_LOG_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...AUDIT_LOG_QUERY_KEYS.details(), id] as const,
    stats: () => [...AUDIT_LOG_QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook to get paginated audit logs with filtering
 */
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
    return useQuery<AuditLogsListResponse, Error>({
        queryKey: AUDIT_LOG_QUERY_KEYS.list(filters),
        queryFn: () => auditLogApi.getAuditLogs(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to get audit log statistics
 */
export const useAuditLogStats = () => {
    return useQuery<AuditLogStatsResponse, Error>({
        queryKey: AUDIT_LOG_QUERY_KEYS.stats(),
        queryFn: auditLogApi.getAuditLogStats,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to get specific audit log by ID
 */
export const useAuditLog = (id: string) => {
    return useQuery<AuditLogResponse, Error>({
        queryKey: AUDIT_LOG_QUERY_KEYS.detail(id),
        queryFn: () => auditLogApi.getAuditLogById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to cleanup old audit logs
 */
export const useCleanupAuditLogs = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation<{ deletedCount: number }, Error, number>({
        mutationFn: (daysToKeep) => auditLogApi.cleanupOldLogs(daysToKeep),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: AUDIT_LOG_QUERY_KEYS.all,
            });
            notify.success(
                `Cleanup completed. ${data.deletedCount} old audit logs deleted.`,
            );
        },
        onError: (error) => {
            notify.error(error.message || 'Failed to cleanup audit logs');
        },
    });
};

/**
 * Hook to refresh audit logs data
 */
export const useRefreshAuditLogs = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: AUDIT_LOG_QUERY_KEYS.all });
    };
};
