import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { UserActivityStats } from './UserActivityStats';
import type { UserActivityStats as StatsType } from '../../types/user-activity.types';

interface UserActivityStatsSectionProps {
    stats: StatsType | undefined;
    isLoading: boolean;
    error: Error | null;
}

export const UserActivityStatsSection: React.FC<UserActivityStatsSectionProps> = ({
    stats,
    isLoading,
    error,
}) => {
    return (
        <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <FaChartLine className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Activity Statistics
            </h2>
            <UserActivityStats
                stats={stats}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
};
