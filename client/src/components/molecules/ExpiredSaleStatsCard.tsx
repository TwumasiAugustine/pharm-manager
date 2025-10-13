import React from 'react';
import {
    FiClock,
    FiAlertTriangle,
    FiDollarSign,
    FiTrash2,
} from 'react-icons/fi';
import {
    useExpiredSaleStats,
    useTriggerExpiredSaleCleanup,
} from '../../hooks/useExpiredSaleCleanup';
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card';
import { formatGHSWholeAmount } from '../../utils/currency';

export const ExpiredSaleStatsCard: React.FC = () => {
    const { data: stats, isLoading, error, refetch } = useExpiredSaleStats();
    const { mutate: triggerCleanup, isPending: isCleaningUp } =
        useTriggerExpiredSaleCleanup();

    // Auto-refresh stats every 30 seconds to keep data current
    React.useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000);

        return () => clearInterval(interval);
    }, [refetch]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FiClock className="h-5 w-5 text-orange-600" />
                        Expired Sales Monitoring
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FiClock className="h-5 w-5 text-orange-600" />
                        Expired Sales Monitoring
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">
                        Failed to load expired sales data
                    </p>
                </CardContent>
            </Card>
        );
    }

    const hasExpiredSales = (stats.expiredSalesCount || 0) > 0;
    const totalCleaned = stats.totalCleaned || 0;
    const lastCleanupTime = stats.lastCleanupTime;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FiClock className="h-5 w-5 text-orange-600" />
                    Expired Sales Monitoring
                    {hasExpiredSales && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            {stats.expiredSalesCount} pending
                        </span>
                    )}
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Automatic cleanup of unfinalised sales every 10 minutes
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <FiAlertTriangle className="h-5 w-5 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-900">
                                Expired Sales
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-orange-900">
                            {stats.expiredSalesCount || 0}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                            Awaiting cleanup
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <FiDollarSign className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-semibold text-red-900">
                                Expired Value
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-red-900">
                            {formatGHSWholeAmount(stats.totalValue || 0)}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            To be recovered
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <FiTrash2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-900">
                                Total Cleaned
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-green-900">
                            {totalCleaned || '--'}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            {totalCleaned > 0 ? 'All time' : 'Not tracked'}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <FiClock className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">
                                Last Cleanup
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-blue-900">
                            {lastCleanupTime
                                ? new Date(lastCleanupTime).toLocaleString()
                                : 'Not available'}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            {stats.oldestExpired &&
                                'Oldest: ' +
                                    new Date(
                                        stats.oldestExpired,
                                    ).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Action Section */}
                {hasExpiredSales ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
                                    <h4 className="text-lg font-bold text-yellow-900">
                                        Manual Cleanup Required
                                    </h4>
                                </div>
                                <p className="text-sm text-yellow-800 mb-4 leading-relaxed">
                                    <strong>
                                        {stats.expiredSalesCount || 0}
                                    </strong>{' '}
                                    expired sale(s) detected. Manual cleanup
                                    will:
                                </p>
                                <ul className="text-sm text-yellow-800 space-y-1 mb-4">
                                    <li>
                                        • Restore{' '}
                                        {formatGHSWholeAmount(
                                            stats.totalValue || 0,
                                        )}{' '}
                                        worth of drug quantities
                                    </li>
                                    <li>• Remove expired unfinalised sales</li>
                                    <li>• Update inventory records</li>
                                    <li>• Generate cleanup audit logs</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => {
                                    triggerCleanup();
                                    // Refresh stats after cleanup
                                    setTimeout(() => refetch(), 2000);
                                }}
                                disabled={isCleaningUp}
                                className="ml-4 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {isCleaningUp ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 className="h-5 w-5" />
                                        <span>Cleanup Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-green-900 mb-1">
                                    System Running Smoothly
                                </h4>
                                <p className="text-sm text-green-700">
                                    No expired sales detected. All transactions
                                    are properly managed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* System Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiClock className="h-4 w-4" />
                        System Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                Automatic cleanup runs every 10 minutes
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Drug quantities automatically restored
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Only unfinalised short-code sales affected
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                All cleanup actions are audited
                            </p>
                        </div>
                    </div>
                    {totalCleaned > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                                <strong>Lifetime Statistics:</strong>{' '}
                                {totalCleaned} sales cleaned, helping maintain
                                accurate inventory records.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
