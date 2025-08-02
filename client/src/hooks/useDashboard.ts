import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import type { DashboardFilters } from '../types/dashboard.types';

/**
 * Hook to fetch dashboard analytics data
 */
export const useDashboardAnalytics = (filters: DashboardFilters = {}) => {
    return useQuery({
        queryKey: ['dashboard', 'analytics', filters],
        queryFn: () => dashboardApi.getAnalytics(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => data.data,
    });
};

/**
 * Hook to fetch sales trends data
 */
export const useSalesTrends = (
    filters: Omit<DashboardFilters, 'period'> & {
        period?: 'day' | 'week' | 'month';
    } = {},
) => {
    return useQuery({
        queryKey: ['dashboard', 'trends', filters],
        queryFn: () => dashboardApi.getTrends(filters),
        staleTime: 1000 * 60 * 2, // 2 minutes
        select: (data) => data.data,
    });
};
