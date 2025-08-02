import React from 'react';
import type { UserActivityStats as StatsType } from '../../types/user-activity.types';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';
import {
    FaUsers,
    FaClipboardList,
    FaClock,
    FaUserClock,
    FaChartBar,
    FaChartPie,
    FaHourglassHalf,
} from 'react-icons/fa';

interface UserActivityStatsProps {
    stats: StatsType | undefined;
    isLoading: boolean;
    error: Error | null;
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    isLoading: boolean;
}> = ({ icon, title, value, isLoading }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            )}
        </div>
    </div>
);

export const UserActivityStats: React.FC<UserActivityStatsProps> = ({
    stats,
    isLoading,
    error,
}) => {
    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={<FaClipboardList size={24} />}
                title="Total Activities"
                value={stats?.overview.totalActivities ?? 0}
                isLoading={isLoading}
            />
            <StatCard
                icon={<FaUsers size={24} />}
                title="Active Users"
                value={stats?.overview.activeUsers ?? 0}
                isLoading={isLoading}
            />
            <StatCard
                icon={<FaUserClock size={24} />}
                title="Active Sessions"
                value={stats?.overview.activeSessions ?? 0}
                isLoading={isLoading}
            />
            <StatCard
                icon={<FaHourglassHalf size={24} />}
                title="Avg. Session (min)"
                value={stats?.overview.averageSessionDuration ?? 0}
                isLoading={isLoading}
            />

            {/* More detailed stats can be added here, e.g., charts */}
            {stats && !isLoading && (
                <>
                    <div className="sm:col-span-2 lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaChartPie className="mr-2" />
                            Activity Breakdown
                        </h4>
                        <ul className="space-y-1 text-sm">
                            {stats.activityBreakdown.map((item) => (
                                <li
                                    key={item.type}
                                    className="flex justify-between"
                                >
                                    <span>{item.type}</span>
                                    <span className="font-medium">
                                        {item.count} ({item.percentage}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaChartBar className="mr-2" />
                            Resource Breakdown
                        </h4>
                        <ul className="space-y-1 text-sm">
                            {stats.resourceBreakdown.map((item) => (
                                <li
                                    key={item.resource}
                                    className="flex justify-between"
                                >
                                    <span>{item.resource}</span>
                                    <span className="font-medium">
                                        {item.count} ({item.percentage}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};
