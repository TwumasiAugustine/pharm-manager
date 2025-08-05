import React from 'react';
import { FiTrendingUp, FiPackage, FiPercent } from 'react-icons/fi';
import type { ReportSummaryData } from '../../types/report.types';

interface ReportSummaryProps {
    summary: ReportSummaryData | null;
    isLoading: boolean;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
    summary,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg border p-6 animate-pulse"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white rounded-lg border p-6 text-center">
                <p className="text-gray-500">No summary data available</p>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Revenue',
            value: `GH₵${summary.totalRevenue.toLocaleString()}`,
            icon: () => <span className="font-bold text-lg">₵</span>,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            label: 'Total Sales',
            value: summary.totalSales.toLocaleString(),
            icon: FiTrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Items Sold',
            value: summary.totalItems.toLocaleString(),
            icon: FiPackage,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'Profit Margin',
            value:
                summary.profitMargin !== null
                    ? `${summary.profitMargin.toFixed(1)}%`
                    : 'N/A',
            icon: FiPercent,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon
                                    className={`h-6 w-6 ${stat.color}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">
                            Top Selling Drug
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {summary.topSellingDrug || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">
                            Average Order Value
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            GH₵{summary.averageOrderValue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
