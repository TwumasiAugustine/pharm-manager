import cron from 'node-cron';
import { ExpiryService } from '../services/expiry.service';

class CronJobService {
    private expiryService: ExpiryService;

    constructor() {
        this.expiryService = new ExpiryService();
        this.initializeCronJobs();
    }

    private initializeCronJobs(): void {
        // Run every day at 10:00 AM to create expiry notifications
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
}

export const cronJobService = new CronJobService();
