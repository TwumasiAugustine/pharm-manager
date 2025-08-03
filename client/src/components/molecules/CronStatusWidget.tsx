import React from 'react';
import { Link } from 'react-router-dom';
import { FaCogs,  FaExternalLinkAlt } from 'react-icons/fa';
import { useCronJobStatus } from '../../hooks/useCron';

const CronStatusWidget: React.FC = () => {
    const { data: cronStatus, isLoading, isError } = useCronJobStatus();

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !cronStatus) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaCogs className="mr-2 text-gray-400" />
                        Automated Tasks
                    </h3>
                </div>
                <p className="text-sm text-red-600">
                    Failed to load task status
                </p>
            </div>
        );
    }

    const totalTasks = cronStatus.cronJobs.length;
    const activeTasksCount = cronStatus.cronJobs.filter(
        (job) => job.schedule && job.schedule !== 'manual',
    ).length;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaCogs className="mr-2 text-blue-600" />
                    Automated Tasks
                </h3>
                <Link
                    to="/cron-management"
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                    <FaExternalLinkAlt className="mr-1" />
                    Manage
                </Link>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Tasks</span>
                    <span className="text-lg font-semibold text-green-600">
                        {activeTasksCount}/{totalTasks}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">
                        Next Scheduled Tasks:
                    </div>
                    <div className="space-y-1">
                        {cronStatus.cronJobs.slice(0, 3).map((job, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-xs"
                            >
                                <span className="text-gray-700 truncate flex-1 mr-2">
                                    {job.name}
                                </span>
                                <span className="text-gray-500 font-mono text-xs">
                                    {job.schedule}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {cronStatus.manualControl && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-yellow-700">
                                Manual Control Available
                            </span>
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                Daily Audit Cleanup
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CronStatusWidget;
