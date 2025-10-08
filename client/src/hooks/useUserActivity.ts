import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userActivityApi } from '../api/user-activity.api';
import type { UserActivityFilters } from '../types/user-activity.types';

const USER_ACTIVITY_QUERY_KEY = 'user-activities';

/**
 * Hook to fetch user activities with filtering and pagination (Admin only)
 */
export const useUserActivities = (filters: UserActivityFilters = {}) => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'list', filters],
        queryFn: () => userActivityApi.getUserActivities(filters),
        staleTime: 1000 * 60 * 2, // 2 minutes
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch user activity statistics (Admin only)
 */
export const useUserActivityStats = (
    filters: Partial<UserActivityFilters> = {},
) => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'stats', filters],
        queryFn: () => userActivityApi.getUserActivityStats(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch current user's activities
 */
export const useMyActivities = (filters: Partial<UserActivityFilters> = {}) => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'my-activities', filters],
        queryFn: () => userActivityApi.getMyActivities(filters),
        staleTime: 1000 * 60, // 1 minute
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch detailed session information (Admin only)
 */
export const useUserSession = (
    sessionId: string,
    options: { enabled?: boolean } = {},
) => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'session', sessionId],
        queryFn: () => userActivityApi.getUserSession(sessionId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: options.enabled !== undefined ? options.enabled : !!sessionId,
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch all active user sessions (Admin only)
 */
export const useActiveSessions = () => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'active-sessions'],
        queryFn: () => userActivityApi.getActiveSessions(),
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute for real-time updates
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch user activity summary for dashboard
 */
export const useUserActivitySummary = () => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'summary'],
        queryFn: () => userActivityApi.getUserActivitySummary(),
        staleTime: 1000 * 60 * 2, // 2 minutes
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch detailed activity analytics for admins
 */
export const useActivityAnalytics = (
    params: {
        timeframe?: 'today' | 'week' | 'month' | 'quarter';
        resource?: string;
        action?: string;
    } = {},
) => {
    return useQuery({
        queryKey: [USER_ACTIVITY_QUERY_KEY, 'analytics', params],
        queryFn: () => userActivityApi.getActivityAnalytics(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => data.data,
    });
};

/**
 * Hook to clean up old activity records (Admin only)
 */
export const useCleanupOldActivities = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (daysToKeep: number) =>
            userActivityApi.cleanupOldActivities(daysToKeep),
        onSuccess: () => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({
                queryKey: [USER_ACTIVITY_QUERY_KEY],
            });
        },
    });
};
