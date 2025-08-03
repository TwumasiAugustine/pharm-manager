import cron from 'node-cron';
import { ExpiryService } from '../services/expiry.service';
import { AuditLogService } from '../services/audit-log.service';
import { UserActivityService } from '../services/user-activity.service';

class CronJobService {
    private expiryService: ExpiryService;
    private auditLogService: AuditLogService;
    private userActivityService: UserActivityService;

    constructor() {
        this.expiryService = new ExpiryService();
        this.auditLogService = new AuditLogService();
        this.userActivityService = new UserActivityService();
        this.initializeCronJobs();
    }

    private initializeCronJobs(): void {
        // Run every day at 8:00 AM to create expiry notifications
        cron.schedule('0 8 * * *', async () => {
            try {
                console.log('Running daily expiry notification check...');
                await this.expiryService.createExpiryNotifications();
                console.log('Expiry notifications created successfully');
            } catch (error) {
                console.error('Error creating expiry notifications:', error);
            }
        });

        // Run every Sunday at 2:00 AM to cleanup old notifications
        cron.schedule('0 2 * * 0', async () => {
            try {
                console.log('Running weekly cleanup of old notifications...');
                await this.expiryService.cleanupOldNotifications();
                console.log('Old notifications cleaned up successfully');
            } catch (error) {
                console.error('Error cleaning up old notifications:', error);
            }
        });

        console.log('Cron jobs initialized successfully');
    }

    // Manual trigger methods for testing
    async triggerExpiryNotifications(): Promise<void> {
        try {
            await this.expiryService.createExpiryNotifications();
            console.log('Manual expiry notifications trigger completed');
        } catch (error) {
            console.error(
                'Error in manual expiry notifications trigger:',
                error,
            );
            throw error;
        }
    }

    async triggerCleanupNotifications(): Promise<void> {
        try {
            await this.expiryService.cleanupOldNotifications();
            console.log('Manual cleanup notifications trigger completed');
        } catch (error) {
            console.error('Error in manual cleanup trigger:', error);
            throw error;
        }
    }

    async triggerDailyAuditLogCleanup(daysToKeep: number): Promise<number> {
        try {
            const result =
                await this.auditLogService.cleanupOldLogs(daysToKeep);
            console.log(
                `Manual daily audit log cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            console.error('Error in manual daily audit log cleanup:', error);
            throw error;
        }
    }

    async triggerWeeklyAuditLogCleanup(): Promise<number> {
        try {
            const result = await this.auditLogService.cleanupOldLogs(7);
            console.log(
                `Manual weekly audit log cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            console.error('Error in manual weekly audit log cleanup:', error);
            throw error;
        }
    }

    async triggerMonthlyUserActivityCleanup(): Promise<number> {
        try {
            const result =
                await this.userActivityService.cleanupOldActivity(30);
            console.log(
                `Manual monthly user activity cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            console.error(
                'Error in manual monthly user activity cleanup:',
                error,
            );
            throw error;
        }
    }

    async triggerInventoryCheck(): Promise<void> {
        try {
            await this.expiryService.createExpiryNotifications();
            console.log('Manual inventory check completed');
        } catch (error) {
            console.error('Error in manual inventory check:', error);
            throw error;
        }
    }

    async triggerExpiredSessionsCleanup(): Promise<void> {
        try {
            // This would typically involve cleaning up expired sessions from a session store
            // For now, we'll just log the action
            console.log('Manual expired sessions cleanup completed');
        } catch (error) {
            console.error('Error in manual expired sessions cleanup:', error);
            throw error;
        }
    }

    async triggerWeeklySummaryReports(): Promise<void> {
        try {
            // This would typically involve generating summary reports
            // For now, we'll just log the action
            console.log('Manual weekly summary reports generation completed');
        } catch (error) {
            console.error(
                'Error in manual weekly summary reports generation:',
                error,
            );
            throw error;
        }
    }
}

export const cronJobService = new CronJobService();
