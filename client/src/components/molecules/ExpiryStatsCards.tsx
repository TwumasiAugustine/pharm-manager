import React from 'react';
import {
    FiAlertTriangle,
    FiAlertCircle,
    FiClock,
    FiInfo,
} from 'react-icons/fi';
import type { ExpiryStats } from '../../types/expiry.types';

interface ExpiryStatsCardsProps {
    stats: ExpiryStats;
    isLoading?: boolean;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
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
        red: 'bg-red-500 text-red-600 bg-red-50 border-red-200',
        orange: 'bg-orange-500 text-orange-600 bg-orange-50 border-orange-200',
        yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50 border-yellow-200',
        blue: 'bg-blue-500 text-blue-600 bg-blue-50 border-blue-200',
        green: 'bg-green-500 text-green-600 bg-green-50 border-green-200',
    };

    const [, textColor, lightBg, borderColor] = colorClasses[color].split(' ');

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border ${borderColor} p-4 sm:p-6`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1 mb-3 sm:mb-0">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 bg-gray-200 animate-pulse rounded w-16 sm:w-20"></div>
                    ) : (
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {typeof value === 'number' && value >= 1000
                                ? value.toLocaleString()
                                : value}
                        </p>
                    )}
                </div>
                <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${lightBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                    <div className={`${textColor} text-lg sm:text-xl`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ExpiryStatsCards: React.FC<ExpiryStatsCardsProps> = ({
    stats,
    isLoading = false,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const statsData = [
        {
            title: 'Expired Drugs',
            value: stats.totalExpiredDrugs,
            icon: <FiAlertTriangle />,
            color: 'red' as const,
        },
        {
            title: 'Critical (≤7 days)',
            value: stats.totalCriticalDrugs,
            icon: <FiAlertCircle />,
            color: 'orange' as const,
        },
        {
            title: 'Warning (≤30 days)',
            value: stats.totalWarningDrugs,
            icon: <FiClock />,
            color: 'yellow' as const,
        },
        {
            title: 'Notice (≤90 days)',
            value: stats.totalNoticeDrugs,
            icon: <FiInfo />,
            color: 'blue' as const,
        },
        {
            title: 'Risk Value',
            value: formatCurrency(stats.expiredValue + stats.criticalValue),
            icon: <span className="font-bold text-lg">₵</span>,
            color: 'green' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {statsData.map((stat, index) => (
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
