import React, { useState, useEffect } from 'react';
import {
    FaCircle,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
} from 'react-icons/fa';
import { socketService } from '../../services/socket.service';
import type {
    CronJobTriggeredEvent,
    CronJobCompletedEvent,
    CronJobFailedEvent,
} from '../../types/socket.types';

interface CronJobRealTimeStatusProps {
    jobName: string;
    className?: string;
}

type JobStatus = 'idle' | 'running' | 'completed' | 'failed';

const CronJobRealTimeStatus: React.FC<CronJobRealTimeStatusProps> = ({
    jobName,
    className = '',
}) => {
    const [status, setStatus] = useState<JobStatus>('idle');
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [duration, setDuration] = useState<number | null>(null);

    useEffect(() => {
        const handleJobTriggered = (data: CronJobTriggeredEvent) => {
            if (data.jobName.includes(jobName) || jobName.includes('Manual')) {
                setStatus('running');
                setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
                setDuration(null);
            }
        };

        const handleJobCompleted = (data: CronJobCompletedEvent) => {
            if (data.jobName.includes(jobName) || jobName.includes('Manual')) {
                setStatus('completed');
                setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
                setDuration(data.duration || null);
                // Reset to idle after 5 seconds
                setTimeout(() => setStatus('idle'), 5000);
            }
        };

        const handleJobFailed = (data: CronJobFailedEvent) => {
            if (data.jobName.includes(jobName) || jobName.includes('Manual')) {
                setStatus('failed');
                setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
                setDuration(null);
                // Reset to idle after 8 seconds
                setTimeout(() => setStatus('idle'), 8000);
            }
        };

        socketService.on('cron-job-triggered', handleJobTriggered);
        socketService.on('cron-job-completed', handleJobCompleted);
        socketService.on('cron-job-failed', handleJobFailed);

        return () => {
            socketService.off('cron-job-triggered', handleJobTriggered);
            socketService.off('cron-job-completed', handleJobCompleted);
            socketService.off('cron-job-failed', handleJobFailed);
        };
    }, [jobName]);

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <FaSpinner className="animate-spin text-blue-500" />;
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaCircle className="text-gray-400" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'running':
                return 'Running...';
            case 'completed':
                return `Completed at ${lastUpdate}${
                    duration ? ` (${(duration / 1000).toFixed(1)}s)` : ''
                }`;
            case 'failed':
                return `Failed at ${lastUpdate}`;
            default:
                return 'Idle';
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'running':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaSpinner className="animate-spin mr-1" />
                        Running
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" />
                        Completed
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaTimesCircle className="mr-1" />
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FaCircle className="mr-1" />
                        Idle
                    </span>
                );
        }
    };

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm text-gray-600">{getStatusText()}</span>
            </div>
            <div className="flex justify-start">{getStatusBadge()}</div>
        </div>
    );
};

export default CronJobRealTimeStatus;
