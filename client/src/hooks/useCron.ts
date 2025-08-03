import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeNotify } from '../utils/useSafeNotify';
import cronApi from '../api/cron.api';
import type { CronJobStatus, CronTriggerResponse } from '../api/cron.api';

/**
 * Hook for fetching cron job status
 */
export const useCronJobStatus = () => {
    return useQuery<CronJobStatus>({
        queryKey: ['cronJobStatus'],
        queryFn: () => cronApi.getCronJobStatus(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
};

/**
 * Hook for triggering cron-related operations
 */
export const useCronTriggers = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    // Trigger expiry notifications mutation
    const triggerExpiryNotifications = useMutation({
        mutationFn: () => cronApi.triggerExpiryNotifications(),
        onSuccess: () => {
            notify.success('Expiry notifications triggered successfully');
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['expiry'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error) => {
            console.error('Error triggering expiry notifications:', error);
            notify.error('Failed to trigger expiry notifications');
        },
    });

    // Trigger cleanup notifications mutation
    const triggerCleanupNotifications = useMutation({
        mutationFn: () => cronApi.triggerCleanupNotifications(),
        onSuccess: () => {
            notify.success('Notification cleanup triggered successfully');
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error) => {
            console.error('Error triggering notification cleanup:', error);
            notify.error('Failed to trigger notification cleanup');
        },
    });

    // Trigger daily audit log cleanup mutation (with parameter)
    const triggerDailyAuditLogCleanup = useMutation({
        mutationFn: (daysToKeep: number = 1) =>
            cronApi.triggerDailyAuditLogCleanup(daysToKeep),
        onSuccess: (data: CronTriggerResponse) => {
            const deletedCount = data.data?.deletedCount || 0;
            notify.success(
                `Daily audit log cleanup completed. ${deletedCount} records removed.`,
            );
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        },
        onError: (error) => {
            console.error('Error triggering daily audit log cleanup:', error);
            notify.error('Failed to trigger daily audit log cleanup');
        },
    });

    // Trigger weekly audit log cleanup mutation
    const triggerWeeklyAuditLogCleanup = useMutation({
        mutationFn: () => cronApi.triggerWeeklyAuditLogCleanup(),
        onSuccess: () => {
            notify.success('Weekly audit log cleanup triggered successfully');
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        },
        onError: (error) => {
            console.error('Error triggering weekly audit log cleanup:', error);
            notify.error('Failed to trigger weekly audit log cleanup');
        },
    });

    // Trigger monthly user activity cleanup mutation
    const triggerMonthlyUserActivityCleanup = useMutation({
        mutationFn: () => cronApi.triggerMonthlyUserActivityCleanup(),
        onSuccess: () => {
            notify.success(
                'Monthly user activity cleanup triggered successfully',
            );
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['userActivity'] });
        },
        onError: (error) => {
            console.error(
                'Error triggering monthly user activity cleanup:',
                error,
            );
            notify.error('Failed to trigger monthly user activity cleanup');
        },
    });

    // Trigger inventory check mutation
    const triggerInventoryCheck = useMutation({
        mutationFn: () => cronApi.triggerInventoryCheck(),
        onSuccess: () => {
            notify.success('Inventory check triggered successfully');
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            queryClient.invalidateQueries({ queryKey: ['expiry'] });
        },
        onError: (error) => {
            console.error('Error triggering inventory check:', error);
            notify.error('Failed to trigger inventory check');
        },
    });

    // Trigger expired sessions cleanup mutation
    const triggerExpiredSessionsCleanup = useMutation({
        mutationFn: () => cronApi.triggerExpiredSessionsCleanup(),
        onSuccess: () => {
            notify.success('Expired sessions cleanup triggered successfully');
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['userActivity'] });
        },
        onError: (error) => {
            console.error('Error triggering expired sessions cleanup:', error);
            notify.error('Failed to trigger expired sessions cleanup');
        },
    });

    // Trigger weekly summary reports mutation
    const triggerWeeklySummaryReports = useMutation({
        mutationFn: () => cronApi.triggerWeeklySummaryReports(),
        onSuccess: () => {
            notify.success('Weekly summary reports triggered successfully');
            queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
        onError: (error) => {
            console.error('Error triggering weekly summary reports:', error);
            notify.error('Failed to trigger weekly summary reports');
        },
    });

    return {
        triggerExpiryNotifications,
        triggerCleanupNotifications,
        triggerDailyAuditLogCleanup,
        triggerWeeklyAuditLogCleanup,
        triggerMonthlyUserActivityCleanup,
        triggerInventoryCheck,
        triggerExpiredSessionsCleanup,
        triggerWeeklySummaryReports,
    };
};
