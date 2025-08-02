import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expiryApi } from '../api/expiry.api';
import type { ExpiryFilters, ExpiryNotification } from '../types/expiry.types';

// Query Keys
export const EXPIRY_QUERY_KEYS = {
    all: ['expiry'] as const,
    drugs: () => [...EXPIRY_QUERY_KEYS.all, 'drugs'] as const,
    drugsWithFilters: (
        filters: ExpiryFilters & { page?: number; limit?: number },
    ) => [...EXPIRY_QUERY_KEYS.drugs(), filters] as const,
    stats: () => [...EXPIRY_QUERY_KEYS.all, 'stats'] as const,
    notifications: () => [...EXPIRY_QUERY_KEYS.all, 'notifications'] as const,
    notificationsWithFilters: (filters: {
        isRead?: boolean;
        alertLevel?: string;
        page?: number;
        limit?: number;
    }) => [...EXPIRY_QUERY_KEYS.notifications(), filters] as const,
    drugCheck: (drugId: string) =>
        [...EXPIRY_QUERY_KEYS.all, 'drugCheck', drugId] as const,
};

// Hook to get expiring drugs
export const useExpiringDrugs = (
    filters: ExpiryFilters & { page?: number; limit?: number },
) => {
    return useQuery({
        queryKey: EXPIRY_QUERY_KEYS.drugsWithFilters(filters),
        queryFn: () => expiryApi.getExpiringDrugs(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to get expiry statistics
export const useExpiryStats = () => {
    return useQuery({
        queryKey: EXPIRY_QUERY_KEYS.stats(),
        queryFn: expiryApi.getExpiryStats,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to get expiry notifications
export const useExpiryNotifications = (filters: {
    isRead?: boolean;
    alertLevel?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: EXPIRY_QUERY_KEYS.notificationsWithFilters(filters),
        queryFn: () => expiryApi.getNotifications(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook to check if a drug is expired or expiring
export const useDrugExpiryCheck = (drugId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: EXPIRY_QUERY_KEYS.drugCheck(drugId),
        queryFn: () => expiryApi.checkDrugExpiry(drugId),
        enabled: enabled && !!drugId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to mark notification as read
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            expiryApi.markNotificationAsRead(notificationId),
        onSuccess: (updatedNotification: ExpiryNotification) => {
            // Update the notification in all queries
            queryClient.setQueriesData(
                { queryKey: EXPIRY_QUERY_KEYS.notifications() },
                (oldData: { data: ExpiryNotification[] } | undefined) => {
                    if (!oldData?.data) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.map(
                            (notification: ExpiryNotification) =>
                                notification.id === updatedNotification.id
                                    ? updatedNotification
                                    : notification,
                        ),
                    };
                },
            );
        },
    });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expiryApi.markAllNotificationsAsRead,
        onSuccess: () => {
            // Mark all notifications as read in cache
            queryClient.setQueriesData(
                { queryKey: EXPIRY_QUERY_KEYS.notifications() },
                (oldData: { data: ExpiryNotification[] } | undefined) => {
                    if (!oldData?.data) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.map(
                            (notification: ExpiryNotification) => ({
                                ...notification,
                                isRead: true,
                            }),
                        ),
                    };
                },
            );
        },
    });
};

// Hook to create/refresh expiry notifications
export const useCreateExpiryNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expiryApi.createExpiryNotifications,
        onSuccess: () => {
            // Invalidate and refetch all expiry-related queries
            queryClient.invalidateQueries({ queryKey: EXPIRY_QUERY_KEYS.all });
        },
    });
};

// Main composite hook that combines all expiry functionality
export const useExpiry = (
    filters?: ExpiryFilters & { page?: number; limit?: number },
) => {
    const defaultFilters: ExpiryFilters & { page: number; limit: number } = {
        daysRange: 30,
        alertLevel: undefined,
        category: '',
        page: 1,
        limit: 50,
        ...filters,
    };

    const expiringDrugsQuery = useExpiringDrugs(defaultFilters);
    const expiryStatsQuery = useExpiryStats();
    const notificationsQuery = useExpiryNotifications({});
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();
    const createNotifications = useCreateExpiryNotifications();

    const refreshData = () => {
        expiringDrugsQuery.refetch();
        expiryStatsQuery.refetch();
        notificationsQuery.refetch();
    };

    return {
        // Expiring drugs data
        expiringDrugs: Array.isArray(expiringDrugsQuery.data?.data)
            ? expiringDrugsQuery.data.data
            : [],
        isLoading: expiringDrugsQuery.isLoading,

        // Expiry statistics
        expiryStats: expiryStatsQuery.data,
        isStatsLoading: expiryStatsQuery.isLoading,

        // Notifications
        notifications: Array.isArray(notificationsQuery.data?.data)
            ? notificationsQuery.data.data
            : [],
        isNotificationsLoading: notificationsQuery.isLoading,

        // Actions
        markAsRead,
        markAllAsRead,
        createNotifications,
        refreshData,

        // Error states
        error:
            expiringDrugsQuery.error ||
            expiryStatsQuery.error ||
            notificationsQuery.error,
    };
};
