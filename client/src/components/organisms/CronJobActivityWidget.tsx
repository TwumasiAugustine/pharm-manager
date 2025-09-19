import React, { useState, useEffect } from 'react';
import {
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
} from 'react-icons/fa';
import { socketService } from '../../services/socket.service';
import { Badge } from '../atoms/Badge';
import type {
    CronJobTriggeredEvent,
    CronJobCompletedEvent,
    CronJobFailedEvent,
} from '../../types/socket.types';

interface CronJobEvent {
    jobName: string;
    jobType: string;
    timestamp: string;
    status: 'triggered' | 'completed' | 'failed';
    duration?: number;
    error?: string;
}

const CronJobActivityWidget: React.FC = () => {
    const [recentActivity, setRecentActivity] = useState<CronJobEvent[]>([]);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleCronJobTriggered = (data: CronJobTriggeredEvent) => {
            const event: CronJobEvent = {
                jobName: data.jobName,
                jobType: data.jobType,
                timestamp: data.timestamp,
                status: 'triggered',
            };

            setRecentActivity((prev) => [event, ...prev.slice(0, 9)]); // Keep last 10 events
        };

        const handleCronJobCompleted = (data: CronJobCompletedEvent) => {
            const event: CronJobEvent = {
                jobName: data.jobName,
                jobType: data.jobType,
                timestamp: data.timestamp,
                status: 'completed',
                duration: data.duration,
            };

            setRecentActivity((prev) => [event, ...prev.slice(0, 9)]);
        };

        const handleCronJobFailed = (data: CronJobFailedEvent) => {
            const event: CronJobEvent = {
                jobName: data.jobName,
                jobType: data.jobType,
                timestamp: data.timestamp,
                status: 'failed',
                error: data.error,
            };

            setRecentActivity((prev) => [event, ...prev.slice(0, 9)]);
        };

        const handleConnect = () => setIsOnline(true);
        const handleDisconnect = () => setIsOnline(false);

        // Subscribe to socket events
        socketService.on('cron-job-triggered', handleCronJobTriggered);
        socketService.on('cron-job-completed', handleCronJobCompleted);
        socketService.on('cron-job-failed', handleCronJobFailed);
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);

        // Cleanup on unmount
        return () => {
            socketService.off('cron-job-triggered', handleCronJobTriggered);
            socketService.off('cron-job-completed', handleCronJobCompleted);
            socketService.off('cron-job-failed', handleCronJobFailed);
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
        };
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'triggered':
                return <FaSpinner className="animate-spin text-blue-500" />;
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'triggered':
                return 'bg-blue-50 border-blue-200';
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'failed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Recent Cron Activity
                </h3>
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    ></div>
                    <span className="text-sm text-gray-500">
                        {isOnline ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FaClock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p>No recent activity</p>
                        <p className="text-sm">
                            Cron job events will appear here
                        </p>
                    </div>
                ) : (
                    recentActivity.map((event, index) => (
                        <div
                            key={`${event.timestamp}-${index}`}
                            className={`p-3 rounded-lg border ${getStatusColor(
                                event.status,
                            )}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1">
                                        {getStatusIcon(event.status)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {event.jobName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(
                                                event.timestamp,
                                            ).toLocaleString()}
                                            {event.duration &&
                                                event.status ===
                                                    'completed' && (
                                                    <span className="ml-2 font-mono">
                                                        (
                                                        {(
                                                            event.duration /
                                                            1000
                                                        ).toFixed(1)}
                                                        s)
                                                    </span>
                                                )}
                                        </p>
                                        {event.error && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {event.error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        event.status === 'triggered'
                                            ? 'primary'
                                            : event.status === 'completed'
                                            ? 'success'
                                            : 'danger'
                                    }
                                    size="sm"
                                >
                                    {event.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CronJobActivityWidget;
