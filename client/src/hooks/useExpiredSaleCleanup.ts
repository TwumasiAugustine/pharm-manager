import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expiredSaleCleanupApi } from '../api/expired-sale-cleanup.api';
import { useSafeNotify } from '../utils/useSafeNotify';
import { useAuthStore } from '../store/auth.store';
import { useEffect } from 'react';
import { socketService } from '../services/socket.service';
import type { ExpiredSalesCleanedEvent } from '../types/socket.types';

// Query Keys
export const EXPIRED_SALE_CLEANUP_QUERY_KEYS = {
    all: ['expired-sale-cleanup'] as const,
    stats: () => [...EXPIRED_SALE_CLEANUP_QUERY_KEYS.all, 'stats'] as const,
};

// Hook to get expired sale statistics
export const useExpiredSaleStats = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    // Listen for real-time expired sale cleanup events
    useEffect(() => {
        const handleExpiredSalesCleanup = (data: ExpiredSalesCleanedEvent) => {
            queryClient.invalidateQueries({
                queryKey: EXPIRED_SALE_CLEANUP_QUERY_KEYS.stats(),
            });
            // Also invalidate sales and drugs data
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['drugs'] });

            notify.info(
                `Automated cleanup: ${data.count} expired sale(s) cleaned up`,
            );
        };

        socketService.on('expired-sales-cleaned', handleExpiredSalesCleanup);

        return () => {
            socketService.off(
                'expired-sales-cleaned',
                handleExpiredSalesCleanup,
            );
        };
    }, [queryClient, notify]);

    return useQuery({
        queryKey: EXPIRED_SALE_CLEANUP_QUERY_KEYS.stats(),
        queryFn: () => expiredSaleCleanupApi.getExpiredSaleStats(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
};

// Hook to trigger manual cleanup
export const useTriggerExpiredSaleCleanup = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: () => {
            if (user?.role !== 'admin' && user?.role !== 'super_admin') {
                const error = new Error(
                    'You are not authorized to perform this action.',
                );
                notify.error(error.message);
                return Promise.reject(error);
            }
            return expiredSaleCleanupApi.triggerCleanup();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: EXPIRED_SALE_CLEANUP_QUERY_KEYS.stats(),
            });
            // Also invalidate sales data since some might have been cleaned up
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['drugs'] }); // Drug quantities might have been restored

            if (data.cleanedUpCount > 0) {
                notify.success(
                    `Successfully cleaned up ${data.cleanedUpCount} expired sale(s)!`,
                );
            } else {
                notify.info('No expired sales found to clean up.');
            }
        },
        onError: (error: Error) => {
            notify.error(
                error.message || 'Failed to trigger expired sale cleanup',
            );
        },
    });
};
