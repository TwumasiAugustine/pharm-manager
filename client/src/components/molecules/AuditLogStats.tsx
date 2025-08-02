import React from 'react';
import { FiActivity, FiUsers, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import type { AuditLogStatsResponse } from '../../types/audit-log.types';

interface AuditLogStatsProps {
    stats: AuditLogStatsResponse;
    isLoading?: boolean;
}

export const AuditLogStats: React.FC<AuditLogStatsProps> = ({
    stats,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
                    >
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Logs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                        <FiActivity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Total Logs
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {stats.totalLogs.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Today's Logs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100">
                        <FiCalendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Today's Activity
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {stats.todayLogs.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Week's Logs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100">
                        <FiTrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            This Week
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {stats.weekLogs.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-orange-100">
                        <FiUsers className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Active Users
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {stats.topUsers.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogStats;
