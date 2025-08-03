import api from './api';

export interface CronJobInfo {
    name: string;
    schedule: string;
    description: string;
    manualTrigger: string;
}

export interface CronJobStatus {
    cronJobs: CronJobInfo[];
    manualControl: {
        dailyAuditLogCleanup: {
            description: string;
            endpoint: string;
            note: string;
        };
    };
}

export interface CronTriggerResponse {
    success: boolean;
    message: string;
    data?: {
        deletedCount?: number;
    };
}

const cronApi = {
    /**
     * Get cron job status and information
     */
    async getCronJobStatus(): Promise<CronJobStatus> {
        const response = await api.get('/cron/status');
        return response.data.data;
    },

    /**
     * Trigger expiry notifications creation
     */
    async triggerExpiryNotifications(): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-expiry-notifications');
        return response.data;
    },

    /**
     * Trigger cleanup of old notifications
     */
    async triggerCleanupNotifications(): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-cleanup-notifications');
        return response.data;
    },

    /**
     * Trigger daily audit log cleanup (manual control as requested by user)
     */
    async triggerDailyAuditLogCleanup(
        daysToKeep: number = 1,
    ): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-daily-audit-cleanup', {
            daysToKeep,
        });
        return response.data;
    },

    /**
     * Trigger weekly audit log cleanup
     */
    async triggerWeeklyAuditLogCleanup(): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-weekly-audit-cleanup');
        return response.data;
    },

    /**
     * Trigger monthly user activity cleanup
     */
    async triggerMonthlyUserActivityCleanup(): Promise<CronTriggerResponse> {
        const response = await api.post(
            '/cron/trigger-monthly-user-activity-cleanup',
        );
        return response.data;
    },

    /**
     * Trigger inventory check
     */
    async triggerInventoryCheck(): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-inventory-check');
        return response.data;
    },

    /**
     * Trigger expired sessions cleanup
     */
    async triggerExpiredSessionsCleanup(): Promise<CronTriggerResponse> {
        const response = await api.post(
            '/cron/trigger-expired-sessions-cleanup',
        );
        return response.data;
    },

    /**
     * Trigger weekly summary reports generation
     */
    async triggerWeeklySummaryReports(): Promise<CronTriggerResponse> {
        const response = await api.post('/cron/trigger-weekly-summary-reports');
        return response.data;
    },
};

export default cronApi;
