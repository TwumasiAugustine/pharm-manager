import React from 'react';
import { format } from 'date-fns';

interface SummaryData {
    todayActivity?: {
        totalActivities?: number;
    } | number;
    weeklyActivity?: {
        totalActivities?: number;
    } | number;
    activeSessions?: number;
    topActiveUsers?: Array<{
        userId: string;
        userName: string;
        activityCount: number;
        lastActivity: string;
    }>;
}

interface UserActivitySummaryProps {
    summary: SummaryData | undefined;
    isLoading: boolean;
    error: Error | null;
}

export const UserActivitySummary: React.FC<UserActivitySummaryProps> = ({
    summary,
    isLoading,
    error,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading summary...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-red-600">
                Error loading summary: {error.message}
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No summary data available
            </div>
        );
    }

    const todayCount =
        typeof summary.todayActivity === 'object'
            ? summary.todayActivity?.totalActivities || 0
            : summary.todayActivity || 0;

    const weeklyCount =
        typeof summary.weeklyActivity === 'object'
            ? summary.weeklyActivity?.totalActivities || 0
            : summary.weeklyActivity || 0;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm sm:text-lg font-semibold text-blue-900">
                        Today
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                        {todayCount}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-700">
                        Activities
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm sm:text-lg font-semibold text-green-900">
                        This Week
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                        {weeklyCount}
                    </p>
                    <p className="text-xs sm:text-sm text-green-700">
                        Activities
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm sm:text-lg font-semibold text-purple-900">
                        This Month
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                        {summary.activeSessions || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-purple-700">
                        Activities
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm sm:text-lg font-semibold text-orange-900">
                        Active Users
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                        {summary.topActiveUsers?.length || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-orange-700">Users</p>
                </div>
            </div>

            {summary.topActiveUsers && summary.topActiveUsers.length > 0 && (
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                        Most Active Users
                    </h3>
                    <div className="space-y-2">
                        {summary.topActiveUsers.slice(0, 5).map((user) => (
                            <div
                                key={user.userId}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900">
                                        {user.userName}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-500 ml-0 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                                        Last activity:{' '}
                                        {format(
                                            new Date(user.lastActivity),
                                            'MMM dd, HH:mm',
                                        )}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 mt-2 sm:mt-0">
                                    {user.activityCount} activities
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
