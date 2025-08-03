import React from 'react';
import { FaClock, FaPlay, FaInfo } from 'react-icons/fa';
import type { CronJobInfo } from '../../api/cron.api';

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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {cronJob.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FaClock className="mr-2" />
                        <span className="font-mono">{cronJob.schedule}</span>
                    </div>
                </div>
                {canTrigger && (
                    <button
                        onClick={onTrigger}
                        disabled={isLoading}
                        className={`
                            flex items-center px-3 py-2 rounded-md text-sm font-medium
                            transition-colors duration-200
                            ${
                                isLoading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }
                        `}
                    >
                        <FaPlay
                            className={`mr-1 ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />
                        {isLoading ? 'Running...' : 'Trigger'}
                    </button>
                )}
            </div>

            <div className="flex items-start text-sm text-gray-700">
                <FaInfo className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                <p className="leading-relaxed">{cronJob.description}</p>
            </div>
        </div>
    );
};

export default CronJobCard;
