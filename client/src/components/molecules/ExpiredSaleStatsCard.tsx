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

export const ExpiredSaleStatsCard: React.FC = () => {
    const { data: stats, isLoading, error } = useExpiredSaleStats();
    const { mutate: triggerCleanup, isPending: isCleaningUp } =
        useTriggerExpiredSaleCleanup();

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

    const hasExpiredSales = stats.expiredSalesCount > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FiClock className="h-5 w-5 text-orange-600" />
                    Expired Sales Monitoring
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Automatic cleanup of unfinalised sales
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FiAlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">
                                Expired Sales
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-orange-900">
                            {stats.expiredSalesCount}
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FiDollarSign className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-900">
                                Total Value
                            </span>
                        </div>
                        <p className="text-lg font-bold text-red-900">
                            ${stats.totalValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:col-span-1 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                            <FiClock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                Oldest Expired
                            </span>
                        </div>
                        <p className="text-sm font-medium text-blue-900">
                            {stats.oldestExpired
                                ? new Date(stats.oldestExpired).toLocaleString()
                                : 'None'}
                        </p>
                    </div>
                </div>

                {hasExpiredSales && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-semibold text-yellow-900 mb-1">
                                    Manual Cleanup Available
                                </h4>
                                <p className="text-sm text-yellow-800 mb-3">
                                    There are {stats.expiredSalesCount} expired
                                    sale(s) that can be cleaned up manually.
                                    This will restore drug quantities and remove
                                    expired sales.
                                </p>
                            </div>
                            <button
                                onClick={() => triggerCleanup()}
                                disabled={isCleaningUp}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                {isCleaningUp ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <FiTrash2 className="h-4 w-4" />
                                )}
                                {isCleaningUp ? 'Cleaning...' : 'Cleanup Now'}
                            </button>
                        </div>
                    </div>
                )}

                {!hasExpiredSales && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-900">
                                No expired sales found. System is running
                                smoothly!
                            </span>
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    <p>• Cleanup runs automatically every 10 minutes</p>
                    <p>• Drug quantities are automatically restored</p>
                    <p>
                        • Only unfinalised sales with short codes are affected
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
