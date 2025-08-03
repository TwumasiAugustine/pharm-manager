import React from 'react';
import {
    FiDollarSign,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiAlertTriangle,
} from 'react-icons/fi';
import type { DashboardOverview } from '../../types/dashboard.types';

interface OverviewCardsProps {
    overview?: DashboardOverview;
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
        blue: {
            textColor: 'text-blue-600',
            lightBg: 'bg-blue-50',
        },
        green: {
            textColor: 'text-green-600',
            lightBg: 'bg-green-50',
        },
        purple: {
            textColor: 'text-purple-600',
            lightBg: 'bg-purple-50',
        },
        orange: {
            textColor: 'text-orange-600',
            lightBg: 'bg-orange-50',
        },
        red: {
            textColor: 'text-red-600',
            lightBg: 'bg-red-50',
        },
    };

    const { textColor, lightBg } = colorClasses[color];

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
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Provide default values when overview is undefined or loading
    const defaultOverview = {
        totalRevenue: 0,
        totalSales: 0,
        totalCustomers: 0,
        totalDrugs: 0,
        lowStockCount: 0,
    };

    const safeOverview = overview || defaultOverview;

    const stats = [
        {
            title: 'Total Revenue',
            value: formatCurrency(safeOverview.totalRevenue),
            icon: <FiDollarSign />,
            color: 'green' as const,
        },
        {
            title: 'Total Sales',
            value: safeOverview.totalSales.toLocaleString(),
            icon: <FiShoppingBag />,
            color: 'blue' as const,
        },
        {
            title: 'Total Customers',
            value: safeOverview.totalCustomers.toLocaleString(),
            icon: <FiUsers />,
            color: 'purple' as const,
        },
        {
            title: 'Total Drugs',
            value: safeOverview.totalDrugs.toLocaleString(),
            icon: <FiPackage />,
            color: 'orange' as const,
        },
        {
            title: 'Low Stock Items',
            value: safeOverview.lowStockCount.toLocaleString(),
            icon: <FiAlertTriangle />,
            color: 'red' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
