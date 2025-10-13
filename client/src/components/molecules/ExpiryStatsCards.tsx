import React from 'react';
import {
    FiAlertTriangle,
    FiAlertCircle,
    FiClock,
    FiInfo,
    FiDollarSign,
    FiTrendingDown,
    FiPackage,
} from 'react-icons/fi';
import type { ExpiryStats } from '../../types/expiry.types';
import { formatGHSWholeAmount } from '../../utils/currency';

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
            className={`bg-white rounded-xl shadow-lg border ${borderColor} p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300`}
        >
            <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                    <div
                        className={`w-12 h-12 ${lightBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                        <div className={`${textColor} text-xl`}>{icon}</div>
                    </div>
                    <div className={`px-2 py-1 ${lightBg} rounded-full`}>
                        <div
                            className={`w-2 h-2 ${textColor.replace(
                                'text-',
                                'bg-',
                            )} rounded-full`}
                        ></div>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        {title}
                    </p>
                    {isLoading ? (
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-20"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900 break-words">
                            {typeof value === 'string' &&
                            value.startsWith('GH₵')
                                ? value
                                : typeof value === 'number' && value >= 1000
                                ? value.toLocaleString()
                                : value}
                        </p>
                    )}
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
        // Ensure we have a valid number and format it as Ghanaian Cedis
        const validAmount = isNaN(amount) ? 0 : amount;
        return formatGHSWholeAmount(validAmount);
    };

    const statsData = [
        {
            title: 'Expired Drugs',
            value: stats.totalExpiredDrugs || 0,
            icon: <FiAlertTriangle />,
            color: 'red' as const,
        },
        {
            title: 'Critical (≤7 days)',
            value: stats.totalCriticalDrugs || 0,
            icon: <FiAlertCircle />,
            color: 'orange' as const,
        },
        {
            title: 'Warning (≤30 days)',
            value: stats.totalWarningDrugs || 0,
            icon: <FiClock />,
            color: 'yellow' as const,
        },
        {
            title: 'Notice (≤90 days)',
            value: stats.totalNoticeDrugs || 0,
            icon: <FiInfo />,
            color: 'blue' as const,
        },
        {
            title: 'Total Expired Value',
            value: formatCurrency(stats.expiredCostValue || 0),
            icon: <FiTrendingDown />,
            color: 'red' as const,
        },
        {
            title: 'Critical Value at Risk',
            value: formatCurrency(stats.criticalCostValue || 0),
            icon: <FiAlertCircle />,
            color: 'orange' as const,
        },
        {
            title: 'Warning Value at Risk',
            value: formatCurrency(stats.warningCostValue || 0),
            icon: <FiClock />,
            color: 'yellow' as const,
        },
        {
            title: 'Total Inventory Value',
            value: formatCurrency(stats.totalValue || 0),
            icon: <FiPackage />,
            color: 'green' as const,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Drug Count Statistics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiPackage className="mr-2 h-5 w-5 text-blue-500" />
                    Drug Quantities by Expiry Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {statsData.slice(0, 4).map((stat, index) => (
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
            </div>

            {/* Value Statistics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiDollarSign className="mr-2 h-5 w-5 text-green-500" />
                    Financial Impact (GH₵)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {statsData.slice(4).map((stat, index) => (
                        <StatCard
                            key={index + 4}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
