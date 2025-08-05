import React from 'react';
import { FaClock, FaPlay, FaInfo } from 'react-icons/fa';
import type { CronJobInfo } from '../../api/cron.api';
import CronJobRealTimeStatus from './CronJobRealTimeStatus';

interface ExtendedCronJobInfo extends CronJobInfo {
    lastRun?: string;
    nextRun?: string;
}

interface CronJobCardProps {
    cronJob: CronJobInfo;
    onTrigger: () => void;
    isLoading: boolean;
    canTrigger?: boolean;
}

const CronJobCard: React.FC<CronJobCardProps> = ({
    cronJob,
    onTrigger,
    isLoading,
    canTrigger = true,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {cronJob.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                        <FaClock className="mr-2 text-gray-400" />
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {cronJob.schedule}
                        </span>
                    </div>
                </div>
                {canTrigger && (
                    <button
                        onClick={onTrigger}
                        disabled={isLoading}
                        className={`
                            flex items-center px-4 py-2 rounded-md text-sm
                            font-medium transition-all duration-200 min-w-[100px]
                            ${
                                isLoading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md'
                            }
                        `}
                    >
                        <FaPlay
                            className={`mr-2 ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />
                        {isLoading ? 'Running...' : 'Trigger'}
                    </button>
                )}
            </div>

            {/* Real-time status indicator */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <CronJobRealTimeStatus jobName={cronJob.name} />
            </div>

            {/* Job details */}
            <div className="space-y-3">
                <div className="flex items-start text-sm text-gray-700">
                    <FaInfo className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="leading-relaxed">{cronJob.description}</p>
                </div>

                {/* Last run and next run info if available */}
                {((cronJob as ExtendedCronJobInfo).lastRun ||
                    (cronJob as ExtendedCronJobInfo).nextRun) && (
                    <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            {(cronJob as ExtendedCronJobInfo).lastRun && (
                                <div>
                                    <span className="font-medium">
                                        Last Run:
                                    </span>
                                    <br />
                                    <span className="font-mono">
                                        {new Date(
                                            (
                                                cronJob as ExtendedCronJobInfo
                                            ).lastRun!,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {(cronJob as ExtendedCronJobInfo).nextRun && (
                                <div>
                                    <span className="font-medium">
                                        Next Run:
                                    </span>
                                    <br />
                                    <span className="font-mono">
                                        {new Date(
                                            (
                                                cronJob as ExtendedCronJobInfo
                                            ).nextRun!,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CronJobCard;
