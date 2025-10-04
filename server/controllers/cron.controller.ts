import { Request, Response } from 'express';
import { cronJobService } from '../services/cronJob.service';

/**
 * Controller for manual cron job triggers
 * Provides API endpoints to manually trigger cron jobs for testing and maintenance
 */
export class CronController {
    /**
     * Manually trigger expiry notifications creation
     */
    async triggerExpiryNotifications(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            await cronJobService.triggerExpiryNotifications();
            res.json({
                success: true,
                message: 'Expiry notifications triggered successfully',
            });
        } catch (error) {
            console.error('Error triggering expiry notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger expiry notifications',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger cleanup of old notifications
     */
    async triggerCleanupNotifications(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            await cronJobService.triggerCleanupNotifications();
            res.json({
                success: true,
                message: 'Notification cleanup triggered successfully',
            });
        } catch (error) {
            console.error('Error triggering notification cleanup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger notification cleanup',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger daily audit log cleanup (as requested by user)
     */
    async triggerDailyAuditLogCleanup(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const { daysToKeep = 1 } = req.body;
            const deletedCount =
                await cronJobService.triggerDailyAuditLogCleanup(
                    Number(daysToKeep),
                );
            res.json({
                success: true,
                message: `Daily audit log cleanup completed. Deleted ${deletedCount} records`,
                data: { deletedCount },
            });
        } catch (error) {
            console.error('Error triggering daily audit log cleanup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger daily audit log cleanup',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger weekly audit log cleanup
     */
    async triggerWeeklyAuditLogCleanup(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const deletedCount =
                await cronJobService.triggerWeeklyAuditLogCleanup();
            res.json({
                success: true,
                message: `Weekly audit log cleanup completed. Deleted ${deletedCount} records`,
                data: { deletedCount },
            });
        } catch (error) {
            console.error('Error triggering weekly audit log cleanup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger weekly audit log cleanup',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger monthly user activity cleanup
     */
    async triggerMonthlyUserActivityCleanup(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const deletedCount =
                await cronJobService.triggerMonthlyUserActivityCleanup();
            res.json({
                success: true,
                message: `Monthly user activity cleanup completed. Deleted ${deletedCount} records`,
                data: { deletedCount },
            });
        } catch (error) {
            console.error(
                'Error triggering monthly user activity cleanup:',
                error,
            );
            res.status(500).json({
                success: false,
                message: 'Failed to trigger monthly user activity cleanup',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger inventory check
     */
    async triggerInventoryCheck(req: Request, res: Response): Promise<void> {
        try {
            await cronJobService.triggerInventoryCheck();
            res.json({
                success: true,
                message: 'Inventory check completed successfully',
            });
        } catch (error) {
            console.error('Error triggering inventory check:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger inventory check',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger expired sessions cleanup
     */
    async triggerExpiredSessionsCleanup(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            await cronJobService.triggerExpiredSessionsCleanup();
            res.json({
                success: true,
                message: 'Expired sessions cleanup completed successfully',
            });
        } catch (error) {
            console.error('Error triggering expired sessions cleanup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger expired sessions cleanup',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Manually trigger weekly summary reports generation
     */
    async triggerWeeklySummaryReports(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            await cronJobService.triggerWeeklySummaryReports();
            res.json({
                success: true,
                message: 'Weekly summary reports generated successfully',
            });
        } catch (error) {
            console.error('Error triggering weekly summary reports:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger weekly summary reports',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get cron job status and information
     */
    async getCronJobStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = {
                cronJobs: [
                    {
                        name: 'Daily Expiry Notifications',
                        schedule: '0 8 * * *',
                        description:
                            'Creates expiry notifications every day at 8:00 AM',
                        manualTrigger: '/api/cron/trigger-expiry-notifications',
                    },
                    {
                        name: 'Weekly Notification Cleanup',
                        schedule: '0 2 * * 0',
                        description:
                            'Cleans up old notifications every Sunday at 2:00 AM',
                        manualTrigger:
                            '/api/cron/trigger-cleanup-notifications',
                    },
                    {
                        name: 'Weekly Audit Log Cleanup',
                        schedule: '0 3 * * 0',
                        description:
                            'Cleans up audit logs older than 7 days every Sunday at 3:00 AM',
                        manualTrigger: '/api/cron/trigger-weekly-audit-cleanup',
                    },
                    {
                        name: 'Monthly User Activity Cleanup',
                        schedule: '0 4 1 * *',
                        description:
                            'Cleans up user activities older than 30 days on 1st of every month at 4:00 AM',
                        manualTrigger:
                            '/api/cron/trigger-monthly-user-activity-cleanup',
                    },
                    {
                        name: 'Daily Inventory Check',
                        schedule: '0 9 * * *',
                        description:
                            'Checks for low stock items every day at 9:00 AM',
                        manualTrigger: '/api/cron/trigger-inventory-check',
                    },
                    {
                        name: 'Daily Session Cleanup',
                        schedule: '0 1 * * *',
                        description:
                            'Cleans up expired sessions every day at 1:00 AM',
                        manualTrigger:
                            '/api/cron/trigger-expired-sessions-cleanup',
                    },
                    {
                        name: 'Weekly Summary Reports',
                        schedule: '0 6 * * 0',
                        description:
                            'Generates weekly summary reports every Sunday at 6:00 AM',
                        manualTrigger:
                            '/api/cron/trigger-weekly-summary-reports',
                    },
                ],
                manualControl: {
                    dailyAuditLogCleanup: {
                        description:
                            'Manual control for daily audit log cleanup (as requested)',
                        endpoint: '/api/cron/trigger-daily-audit-cleanup',
                        note: 'Not automated - requires manual trigger',
                    },
                },
            };

            res.json({
                success: true,
                message: 'Cron job status retrieved successfully',
                data: status,
            });
        } catch (error) {
            console.error('Error getting cron job status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cron job status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export const cronController = new CronController();
