import api from './api';
import type {
    DashboardResponse,
    TrendsResponse,
    DashboardFilters,
} from '../types/dashboard.types';

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
    /**
     * Get dashboard analytics data
     */
    getAnalytics: async (
        filters: DashboardFilters = {},
    ): Promise<DashboardResponse> => {
        const params = new URLSearchParams();

        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.period) params.append('period', filters.period);
        if (filters.branchId) params.append('branchId', filters.branchId);

        const response = await api.get(`/dashboard/analytics?${params}`);
        return response.data;
    },

    /**
     * Get sales trends data for charts
     */
    getTrends: async (
        filters: Omit<DashboardFilters, 'period'> & {
            period?: 'day' | 'week' | 'month';
        } = {},
    ): Promise<TrendsResponse> => {
        const params = new URLSearchParams();

        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.period) params.append('period', filters.period);
        if (filters.branchId) params.append('branchId', filters.branchId);

        const response = await api.get(`/dashboard/trends?${params}`);
        return response.data;
    },
};
