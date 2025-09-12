import React from 'react';
import {
    FiTrendingUp,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiAlertTriangle,
    FiDollarSign,
    FiPercent,
    FiTarget,
} from 'react-icons/fi';
import type { DashboardOverview } from '../../types/dashboard.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

interface OverviewCardsProps {
    overview: DashboardOverview;
    isLoading?: boolean;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color,
    isLoading = false,
}) => {
    const colorClasses = {
        blue: 'bg-blue-500 text-blue-600 bg-blue-50',
        green: 'bg-green-500 text-green-600 bg-green-50',
        purple: 'bg-purple-500 text-purple-600 bg-purple-50',
        orange: 'bg-orange-500 text-orange-600 bg-orange-50',
        red: 'bg-red-500 text-red-600 bg-red-50',
    };

    const [, textColor, lightBg] = colorClasses[color].split(' ');

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    {isLoading ? (
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-20"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900">
                            {typeof value === 'number' && value >= 1000000
                                ? `${(value / 1000000).toFixed(1)}M`
                                : typeof value === 'number' && value >= 1000
                                ? `${(value / 1000).toFixed(1)}K`
                                : value}
                        </p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 ${lightBg} rounded-lg flex items-center justify-center`}
                >
                    <div className={`${textColor} text-xl`}>{icon}</div>
                </div>
            </div>
        </div>
    );
};

export const OverviewCards: React.FC<OverviewCardsProps> = ({
    overview,
    isLoading = false,
}) => {
    const stats = [
        {
            title: 'Total Revenue',
            value: formatGHSDisplayAmount(overview.totalRevenue),
            icon: <FiTrendingUp />,
            color: 'green' as const,
        },
        {
            title: 'Total Profit',
            value: formatGHSDisplayAmount(overview.totalProfit || 0),
            icon: <FiDollarSign />,
            color: 'blue' as const,
        },
        {
            title: 'Profit Margin',
            value: `${(overview.profitMargin || 0).toFixed(1)}%`,
            icon: <FiPercent />,
            color: 'purple' as const,
        },
        {
            title: 'Avg Order Value',
            value: formatGHSDisplayAmount(overview.averageOrderValue || 0),
            icon: <FiTarget />,
            color: 'orange' as const,
        },
        {
            title: 'Total Sales',
            value: overview.totalSales.toLocaleString(),
            icon: <FiShoppingBag />,
            color: 'blue' as const,
        },
        {
            title: 'Total Customers',
            value: overview.totalCustomers.toLocaleString(),
            icon: <FiUsers />,
            color: 'purple' as const,
        },
        {
            title: 'Total Drugs',
            value: overview.totalDrugs.toLocaleString(),
            icon: <FiPackage />,
            color: 'orange' as const,
        },
        {
            title: 'Low Stock Items',
            value: overview.lowStockCount.toLocaleString(),
            icon: <FiAlertTriangle />,
            color: 'red' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
};
