import api from './api';
import type {
    UserActivityFilters,
    UserActivityResponse,
    UserActivityStatsResponse,
    UserSessionResponse,
} from '../types/user-activity.types';

/**
 * User Activity API endpoints
 */
export const userActivityApi = {
    /**
     * Get user activities with filtering and pagination (Admin only)
     */
    getUserActivities: async (
        filters: UserActivityFilters = {},
    ): Promise<UserActivityResponse> => {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.sessionId) params.append('sessionId', filters.sessionId);
        if (filters.activityType)
            params.append('activityType', filters.activityType);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.isActive !== undefined)
            params.append('isActive', filters.isActive.toString());
        if (filters.userRole) params.append('userRole', filters.userRole);
        if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);

        const response = await api.get(`/user-activities?${params}`);
        return response.data;
    },

    /**
     * Get user activity statistics (Admin only)
     */
    getUserActivityStats: async (
        filters: Partial<UserActivityFilters> = {},
    ): Promise<UserActivityStatsResponse> => {
        const params = new URLSearchParams();

        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.userId) params.append('userId', filters.userId);

        const response = await api.get(`/user-activities/stats?${params}`);
        return response.data;
    },

    /**
     * Get current user's activities
     */
    getMyActivities: async (
        filters: Partial<UserActivityFilters> = {},
    ): Promise<UserActivityResponse> => {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.activityType)
            params.append('activityType', filters.activityType);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const response = await api.get(
            `/user-activities/my-activities?${params}`,
        );
        return response.data;
    },

    /**
     * Get detailed session information (Admin only)
     */
    getUserSession: async (sessionId: string): Promise<UserSessionResponse> => {
        const response = await api.get(
            `/user-activities/sessions/${sessionId}`,
        );
        return response.data;
    },

    /**
     * Clean up old activity records (Admin only)
     */
    cleanupOldActivities: async (
        daysToKeep: number = 90,
    ): Promise<{
        success: boolean;
        message: string;
        data: { deletedCount: number };
    }> => {
        const response = await api.delete(
            `/user-activities/cleanup?daysToKeep=${daysToKeep}`,
        );
        return response.data;
    },
};
