import { useEffect } from 'react';
import { socketService } from '../../services/socket.service';
import { useSafeNotify } from '../../utils/useSafeNotify';
import type {
    CronJobTriggeredEvent,
    CronJobCompletedEvent,
    CronJobFailedEvent,
} from '../../types/socket.types';

export const CronJobNotifications = () => {
    const notify = useSafeNotify();

    useEffect(() => {
        const handleCronJobTriggered = (data: CronJobTriggeredEvent) => {
            notify.info(`⏰ Task Started: ${data.jobName}`);
        };

        const handleCronJobCompleted = (data: CronJobCompletedEvent) => {
            const duration = data.duration
                ? ` (${(data.duration / 1000).toFixed(1)}s)`
                : '';
            notify.success(`✅ Task Completed: ${data.jobName}${duration}`);
        };

        const handleCronJobFailed = (data: CronJobFailedEvent) => {
            notify.error(`❌ Task Failed: ${data.jobName}`);
        };

        // Subscribe to socket events
        socketService.on('cron-job-triggered', handleCronJobTriggered);
        socketService.on('cron-job-completed', handleCronJobCompleted);
        socketService.on('cron-job-failed', handleCronJobFailed);

        // Cleanup on unmount
        return () => {
            socketService.off('cron-job-triggered', handleCronJobTriggered);
            socketService.off('cron-job-completed', handleCronJobCompleted);
            socketService.off('cron-job-failed', handleCronJobFailed);
        };
    }, [notify]);

    // This component doesn't render anything visual
    return null;
};

export default CronJobNotifications;
