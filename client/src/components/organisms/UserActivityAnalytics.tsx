import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaChartLine } from 'react-icons/fa';
import { useActivityAnalytics } from '../../hooks/useUserActivity';

export const UserActivityAnalytics: React.FC = () => {
    const [timeframe, setTimeframe] = useState<
        'today' | 'week' | 'month' | 'quarter'
    >('week');
    const [selectedResource, setSelectedResource] = useState<string>('');

    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        error: analyticsError,
    } = useActivityAnalytics({
        timeframe,
        resource: selectedResource || undefined,
    });

    const activitySummary = analyticsData?.summary;
    const stats = analyticsData?.stats;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                        <FaChartLine className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Activity Analytics
                    </h2>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <select
                            value={timeframe}
                            onChange={(e) =>
                                setTimeframe(
                                    e.target.value as
                                        | 'today'
                                        | 'week'
                                        | 'month'
                                        | 'quarter',
                                )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <select
                            value={selectedResource}
                            onChange={(e) => setSelectedResource(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="">All Resources</option>
                            <option value="DRUG">Drugs</option>
                            <option value="SALE">Sales</option>
                            <option value="CUSTOMER">Customers</option>
                            <option value="USER">Users</option>
                            <option value="BRANCH">Branches</option>
                            <option value="REPORT">Reports</option>
                        </select>
                    </div>
                </div>

                {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                            Loading analytics...
                        </span>
                    </div>
                ) : analyticsError ? (
                    <div className="text-red-600 text-center py-4">
                        Error loading analytics:{' '}
                        {(analyticsError as Error).message}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
                            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                                Total Activities
                            </h3>
                            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                                {activitySummary?.todayActivity
                                    ?.totalActivities || 0}
                            </p>
                            <p className="text-xs text-blue-600">Today</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm">
                            <h3 className="text-xs sm:text-sm font-medium text-green-800">
                                Weekly Activities
                            </h3>
                            <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                                {activitySummary?.weeklyActivity
                                    ?.totalActivities || 0}
                            </p>
                            <p className="text-xs text-green-600">This Week</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-sm">
                            <h3 className="text-xs sm:text-sm font-medium text-purple-800">
                                Active Users
                            </h3>
                            <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                                {stats?.overview?.activeUsers || 0}
                            </p>
                            <p className="text-xs text-purple-600">
                                Currently Active
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {activitySummary?.todayActivity?.byResource && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                        Today's Activity by Resource
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(
                            activitySummary.todayActivity.byResource,
                        ).map(([resource, activities]) => (
                            <div
                                key={resource}
                                className="border-l-4 border-blue-500 pl-4 bg-gray-50 p-3 rounded-r-lg"
                            >
                                <h4 className="font-medium text-gray-800 capitalize">
                                    {resource.toLowerCase()}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                    {(
                                        activities as Array<{
                                            action: string;
                                            count: number;
                                            uniqueUsers: number;
                                        }>
                                    ).map((activity, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-white p-2 rounded-lg shadow-sm text-sm"
                                        >
                                            <span className="font-medium">
                                                {activity.action}:
                                            </span>{' '}
                                            {activity.count}
                                            <br />
                                            <span className="text-gray-600 text-xs">
                                                {activity.uniqueUsers} users
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activitySummary?.recentActivities &&
                activitySummary.recentActivities.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                            Recent Specific Activities
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {activitySummary.recentActivities.map(
                                (activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {activity.user.name}
                                                </span>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    {activity.user.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {activity.activity.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                                                <span>
                                                    {format(
                                                        new Date(
                                                            activity.timestamp,
                                                        ),
                                                        'MMM dd, yyyy HH:mm',
                                                    )}
                                                </span>
                                                {activity.ipAddress && (
                                                    <span>
                                                        IP: {activity.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded self-start">
                                            {activity.activity.resource}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

            {activitySummary?.weeklyActivity?.topActions &&
                activitySummary.weeklyActivity.topActions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                            Top Actions This Week
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {activitySummary.weeklyActivity.topActions
                                .slice(0, 6)
                                .map(
                                    (
                                        action: {
                                            action: string;
                                            resource: string;
                                            totalCount?: number;
                                            count?: number;
                                            uniqueUsers: number;
                                        },
                                        index: number,
                                    ) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-medium text-gray-800 capitalize text-sm">
                                                    {action.action}{' '}
                                                    {action.resource.toLowerCase()}
                                                </span>
                                                <span className="text-xl sm:text-2xl font-bold text-blue-600">
                                                    {action.totalCount ||
                                                        action.count}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                                {action.uniqueUsers} unique users
                                            </p>
                                        </div>
                                    ),
                                )}
                        </div>
                    </div>
                )}
        </div>
    );
};
