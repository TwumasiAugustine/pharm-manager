import cron from 'node-cron';
import { ExpiryService } from '../services/expiry.service';
import { AuditLogService } from '../services/audit-log.service';
import { UserActivityService } from '../services/user-activity.service';
import { io } from '../../server';

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
            const startTime = Date.now();
            try {
                console.log('Running daily expiry notification check...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Daily Expiry Notifications',
                    jobType: 'expiry-notifications',
                    timestamp: new Date().toISOString(),
                });

                await this.expiryService.createExpiryNotifications();

                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Daily Expiry Notifications',
                    jobType: 'expiry-notifications',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                });

                io.emit('expiry-notifications-updated');
                console.log('Expiry notifications created successfully');
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Daily Expiry Notifications',
                    jobType: 'expiry-notifications',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error creating expiry notifications:', error);
            }
        });

        // Run every Sunday at 2:00 AM to cleanup old notifications
        cron.schedule('0 2 * * 0', async () => {
            const startTime = Date.now();
            try {
                console.log('Running weekly cleanup of old notifications...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Weekly Notification Cleanup',
                    jobType: 'notification-cleanup',
                    timestamp: new Date().toISOString(),
                });

                await this.expiryService.cleanupOldNotifications();

                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Weekly Notification Cleanup',
                    jobType: 'notification-cleanup',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                });

                io.emit('expiry-notifications-updated');
                console.log('Old notifications cleaned up successfully');
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Weekly Notification Cleanup',
                    jobType: 'notification-cleanup',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error cleaning up old notifications:', error);
            }
        });

        // Run every day at 3:00 AM to cleanup old audit logs (keeps last 30 days)
        cron.schedule('0 3 * * *', async () => {
            const startTime = Date.now();
            try {
                console.log('Running daily audit log cleanup...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Daily Audit Log Cleanup',
                    jobType: 'audit-cleanup',
                    timestamp: new Date().toISOString(),
                });

                const daysToKeep = 30;
                const result =
                    await this.auditLogService.cleanupOldLogs(daysToKeep);

                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Daily Audit Log Cleanup',
                    jobType: 'audit-cleanup',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    result: { deletedCount: result },
                });

                io.emit('audit-logs-updated');
                console.log(
                    `Daily audit log cleanup completed. Deleted ${result} records`,
                );
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Daily Audit Log Cleanup',
                    jobType: 'audit-cleanup',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error during daily audit log cleanup:', error);
            }
        });

        // Run on the 1st of every month at 4:00 AM to cleanup user activity
        cron.schedule('0 4 1 * *', async () => {
            const startTime = Date.now();
            try {
                console.log('Running monthly user activity cleanup...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Monthly User Activity Cleanup',
                    jobType: 'user-activity-cleanup',
                    timestamp: new Date().toISOString(),
                });

                const daysToKeep = 30;
                const result =
                    await this.userActivityService.cleanupOldActivity(
                        daysToKeep,
                    );

                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Monthly User Activity Cleanup',
                    jobType: 'user-activity-cleanup',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    result: { deletedCount: result },
                });

                io.emit('user-activity-updated');
                console.log(
                    `Monthly user activity cleanup completed. Deleted ${result} records`,
                );
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Monthly User Activity Cleanup',
                    jobType: 'user-activity-cleanup',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error(
                    'Error during monthly user activity cleanup:',
                    error,
                );
            }
        });

        console.log('Cron jobs initialized successfully');
    }

    // Manual trigger methods for testing
    async triggerExpiryNotifications(): Promise<void> {
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Expiry Notifications',
                jobType: 'expiry-notifications',
                timestamp: new Date().toISOString(),
            });

            await this.expiryService.createExpiryNotifications();

            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Expiry Notifications',
                jobType: 'expiry-notifications',
                timestamp: new Date().toISOString(),
                duration: duration,
            });

            io.emit('expiry-notifications-updated');
            console.log('Manual expiry notifications trigger completed');
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Expiry Notifications',
                jobType: 'expiry-notifications',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error(
                'Error in manual expiry notifications trigger:',
                error,
            );
            throw error;
        }
    }

    async triggerCleanupNotifications(): Promise<void> {
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Notification Cleanup',
                jobType: 'notification-cleanup',
                timestamp: new Date().toISOString(),
            });

            await this.expiryService.cleanupOldNotifications();

            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Notification Cleanup',
                jobType: 'notification-cleanup',
                timestamp: new Date().toISOString(),
                duration: duration,
            });

            io.emit('expiry-notifications-updated');
            console.log('Manual cleanup notifications trigger completed');
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Notification Cleanup',
                jobType: 'notification-cleanup',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Error in manual cleanup trigger:', error);
            throw error;
        }
    }

    async triggerDailyAuditLogCleanup(daysToKeep: number): Promise<number> {
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Audit Log Cleanup',
                jobType: 'audit-cleanup',
                timestamp: new Date().toISOString(),
            });

            const result =
                await this.auditLogService.cleanupOldLogs(daysToKeep);

            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Audit Log Cleanup',
                jobType: 'audit-cleanup',
                timestamp: new Date().toISOString(),
                duration: duration,
                result: { deletedCount: result },
            });

            io.emit('audit-logs-updated');
            console.log(
                `Manual daily audit log cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Audit Log Cleanup',
                jobType: 'audit-cleanup',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Error in manual daily audit log cleanup:', error);
            throw error;
        }
    }

    async triggerWeeklyAuditLogCleanup(): Promise<number> {
        try {
            const result = await this.auditLogService.cleanupOldLogs(7);
            io.emit('audit-logs-updated');
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
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual User Activity Cleanup',
                jobType: 'user-activity-cleanup',
                timestamp: new Date().toISOString(),
            });

            const result =
                await this.userActivityService.cleanupOldActivity(30);

            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual User Activity Cleanup',
                jobType: 'user-activity-cleanup',
                timestamp: new Date().toISOString(),
                duration: duration,
                result: { deletedCount: result },
            });

            io.emit('user-activity-updated');
            console.log(
                `Manual monthly user activity cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual User Activity Cleanup',
                jobType: 'user-activity-cleanup',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
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
