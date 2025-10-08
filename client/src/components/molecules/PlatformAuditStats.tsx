import React from 'react';
import {
    FiShield,
    FiAlertTriangle,
    FiTrendingUp,
    FiDatabase,
} from 'react-icons/fi';
import { Badge } from '../atoms/Badge';
import type { PlatformAuditStatsResponse } from '../../types/audit-log.types';

interface PlatformAuditStatsProps {
    stats: PlatformAuditStatsResponse;
    isLoading?: boolean;
}

export const PlatformAuditStats: React.FC<PlatformAuditStatsProps> = ({
    stats,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border p-6"
                    >
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const healthScore =
        100 -
        (stats.systemHealth.failedLogins * 0.3 +
            stats.systemHealth.suspiciousActivity * 0.5 +
            stats.systemHealth.dataIntegrityIssues * 0.2);

    return (
        <div className="space-y-6 mb-8">
            {/* High-level Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Platform Logs
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.totalLogs.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiDatabase className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Today:{' '}
                            <span className="font-medium">
                                {stats.todayLogs}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Security Events
                            </p>
                            <p className="text-3xl font-bold text-red-600">
                                {stats.securityEvents}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FiAlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Critical:{' '}
                            <span className="font-medium">
                                {stats.criticalActions}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                System Health
                            </p>
                            <p
                                className={`text-3xl font-bold ${
                                    healthScore >= 80
                                        ? 'text-green-600'
                                        : healthScore >= 60
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {Math.round(healthScore)}%
                            </p>
                        </div>
                        <div
                            className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                healthScore >= 80
                                    ? 'bg-green-100'
                                    : healthScore >= 60
                                    ? 'bg-yellow-100'
                                    : 'bg-red-100'
                            }`}
                        >
                            <FiShield
                                className={`h-6 w-6 ${
                                    healthScore >= 80
                                        ? 'text-green-600'
                                        : healthScore >= 60
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Failed Logins:{' '}
                            <span className="font-medium">
                                {stats.systemHealth.failedLogins}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Weekly Activity
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.weekLogs.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiTrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Avg per day:{' '}
                            <span className="font-medium">
                                {Math.round(stats.weekLogs / 7)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* System Health Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Health Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                            {stats.systemHealth.failedLogins}
                        </p>
                        <p className="text-sm text-gray-600">
                            Failed Login Attempts
                        </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                            {stats.systemHealth.suspiciousActivity}
                        </p>
                        <p className="text-sm text-gray-600">
                            Suspicious Activities
                        </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                            {stats.systemHealth.dataIntegrityIssues}
                        </p>
                        <p className="text-sm text-gray-600">
                            Data Integrity Issues
                        </p>
                    </div>
                </div>
            </div>

            {/* Pharmacy Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Activity by Pharmacy
                </h3>
                <div className="space-y-3">
                    {stats.pharmacyBreakdown
                        .slice(0, 10)
                        .map((pharmacy, index) => (
                            <div
                                key={pharmacy.pharmacyId}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                        {index + 1}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {pharmacy.pharmacyName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ID: {pharmacy.pharmacyId}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {pharmacy.count} logs
                                </Badge>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default PlatformAuditStats;
