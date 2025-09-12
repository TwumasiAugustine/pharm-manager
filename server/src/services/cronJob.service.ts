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

        // Run every Sunday at 3:00 AM to cleanup old audit logs (weekly cleanup - keeps last 7 days)
        cron.schedule('0 3 * * 0', async () => {
            const startTime = Date.now();
            try {
                console.log('Running weekly audit log cleanup...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Weekly Audit Log Cleanup',
                    jobType: 'weekly-audit-cleanup',
                    timestamp: new Date().toISOString(),
                });

                const daysToKeep = 7;
                const result =
                    await this.auditLogService.cleanupOldLogs(daysToKeep);

                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Weekly Audit Log Cleanup',
                    jobType: 'weekly-audit-cleanup',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    result: { deletedCount: result },
                });

                io.emit('audit-logs-updated');
                console.log(
                    `Weekly audit log cleanup completed. Deleted ${result} records`,
                );
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Weekly Audit Log Cleanup',
                    jobType: 'weekly-audit-cleanup',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error during weekly audit log cleanup:', error);
            }
        });

        // Run every day at 9:00 AM to check inventory levels and low stock
        cron.schedule('0 9 * * *', async () => {
            const startTime = Date.now();
            try {
                console.log('Running daily inventory check...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Daily Inventory Check',
                    jobType: 'inventory-check',
                    timestamp: new Date().toISOString(),
                });

                // Create expiry notifications as part of inventory check
                await this.expiryService.createExpiryNotifications();
                
                // TODO: Add low stock alerts and inventory level checks here
                // This could involve checking stock levels against minimum thresholds
                
                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Daily Inventory Check',
                    jobType: 'inventory-check',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                });

                io.emit('inventory-updated');
                console.log('Daily inventory check completed successfully');
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Daily Inventory Check',
                    jobType: 'inventory-check',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error during daily inventory check:', error);
            }
        });

        // Run every day at 1:00 AM to cleanup expired sessions
        cron.schedule('0 1 * * *', async () => {
            const startTime = Date.now();
            try {
                console.log('Running daily session cleanup...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Daily Session Cleanup',
                    jobType: 'session-cleanup',
                    timestamp: new Date().toISOString(),
                });

                // TODO: Implement actual session cleanup logic
                // This could involve cleaning up expired JWT tokens from a blacklist/whitelist
                // For now, we'll simulate the cleanup
                const cleanedSessions = await this.cleanupExpiredSessions();
                
                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Daily Session Cleanup',
                    jobType: 'session-cleanup',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    result: { cleanedSessions },
                });

                console.log(`Daily session cleanup completed. Cleaned ${cleanedSessions} sessions`);
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Daily Session Cleanup',
                    jobType: 'session-cleanup',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error during daily session cleanup:', error);
            }
        });

        // Run every Sunday at 6:00 AM to generate weekly summary reports
        cron.schedule('0 6 * * 0', async () => {
            const startTime = Date.now();
            try {
                console.log('Running weekly summary reports generation...');

                // Emit job started
                io.emit('cron-job-triggered', {
                    jobName: 'Weekly Summary Reports',
                    jobType: 'weekly-reports',
                    timestamp: new Date().toISOString(),
                });

                // TODO: Implement actual report generation logic
                // This could involve generating PDF reports, sending email summaries, etc.
                const reportsGenerated = await this.generateWeeklySummaryReports();
                
                // Emit job completed
                const duration = Date.now() - startTime;
                io.emit('cron-job-completed', {
                    jobName: 'Weekly Summary Reports',
                    jobType: 'weekly-reports',
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    result: { reportsGenerated },
                });

                console.log(`Weekly summary reports generated successfully. ${reportsGenerated} reports created`);
            } catch (error) {
                // Emit job failed
                io.emit('cron-job-failed', {
                    jobName: 'Weekly Summary Reports',
                    jobType: 'weekly-reports',
                    timestamp: new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
                console.error('Error during weekly summary reports generation:', error);
            }
        });

        console.log('Cron jobs initialized successfully');
    }

    /**
     * Helper method to cleanup expired sessions
     * TODO: Implement actual session store cleanup logic
     */
    private async cleanupExpiredSessions(): Promise<number> {
        // This is a placeholder implementation
        // In a real application, this would:
        // 1. Connect to session store (Redis, database, etc.)
        // 2. Remove expired session entries
        // 3. Clean up any associated data
        // 4. Return count of cleaned sessions
        
        // For now, simulate cleanup
        const simulatedCleanedCount = Math.floor(Math.random() * 10);
        console.log(`Simulated session cleanup: ${simulatedCleanedCount} sessions cleaned`);
        return simulatedCleanedCount;
    }

    /**
     * Helper method to generate weekly summary reports
     * TODO: Implement actual report generation logic
     */
    private async generateWeeklySummaryReports(): Promise<number> {
        // This is a placeholder implementation
        // In a real application, this would:
        // 1. Generate sales summary reports
        // 2. Create inventory status reports
        // 3. Generate financial summaries
        // 4. Send email notifications to managers
        // 5. Store reports in designated location
        
        // For now, simulate report generation
        const simulatedReportCount = 3; // Weekly sales, inventory, financial reports
        console.log(`Simulated report generation: ${simulatedReportCount} reports generated`);
        return simulatedReportCount;
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
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Weekly Audit Cleanup',
                jobType: 'weekly-audit-cleanup',
                timestamp: new Date().toISOString(),
            });

            const result = await this.auditLogService.cleanupOldLogs(7);

            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Weekly Audit Cleanup',
                jobType: 'weekly-audit-cleanup',
                timestamp: new Date().toISOString(),
                duration: duration,
                result: { deletedCount: result },
            });

            io.emit('audit-logs-updated');
            console.log(
                `Manual weekly audit log cleanup completed. Deleted ${result} records`,
            );
            return result;
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Weekly Audit Cleanup',
                jobType: 'weekly-audit-cleanup',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
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
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Inventory Check',
                jobType: 'inventory-check',
                timestamp: new Date().toISOString(),
            });

            // Create expiry notifications as part of inventory check
            await this.expiryService.createExpiryNotifications();
            
            // TODO: Add low stock alerts and inventory level checks here
            
            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Inventory Check',
                jobType: 'inventory-check',
                timestamp: new Date().toISOString(),
                duration: duration,
            });

            io.emit('inventory-updated');
            console.log('Manual inventory check completed');
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Inventory Check',
                jobType: 'inventory-check',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Error in manual inventory check:', error);
            throw error;
        }
    }

    async triggerExpiredSessionsCleanup(): Promise<void> {
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Session Cleanup',
                jobType: 'session-cleanup',
                timestamp: new Date().toISOString(),
            });

            // Cleanup expired sessions
            const cleanedSessions = await this.cleanupExpiredSessions();
            
            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Session Cleanup',
                jobType: 'session-cleanup',
                timestamp: new Date().toISOString(),
                duration: duration,
                result: { cleanedSessions },
            });

            console.log(`Manual expired sessions cleanup completed. Cleaned ${cleanedSessions} sessions`);
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Session Cleanup',
                jobType: 'session-cleanup',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Error in manual expired sessions cleanup:', error);
            throw error;
        }
    }

    async triggerWeeklySummaryReports(): Promise<void> {
        const startTime = Date.now();
        try {
            // Emit job started
            io.emit('cron-job-triggered', {
                jobName: 'Manual Weekly Reports',
                jobType: 'weekly-reports',
                timestamp: new Date().toISOString(),
            });

            // Generate weekly summary reports
            const reportsGenerated = await this.generateWeeklySummaryReports();
            
            // Emit job completed
            const duration = Date.now() - startTime;
            io.emit('cron-job-completed', {
                jobName: 'Manual Weekly Reports',
                jobType: 'weekly-reports',
                timestamp: new Date().toISOString(),
                duration: duration,
                result: { reportsGenerated },
            });

            console.log(`Manual weekly summary reports generation completed. ${reportsGenerated} reports generated`);
        } catch (error) {
            // Emit job failed
            io.emit('cron-job-failed', {
                jobName: 'Manual Weekly Reports',
                jobType: 'weekly-reports',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error(
                'Error in manual weekly summary reports generation:',
                error,
            );
            throw error;
        }
    }
}

export const cronJobService = new CronJobService();
