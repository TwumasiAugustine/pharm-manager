import React from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts';
import { useNumberFormatter } from '../../../hooks/useDisplayMode';

interface ExpiryChartData {
    alertLevel: string;
    count: number;
    totalValue: number;
}

interface ExpiryChartProps {
    data: ExpiryChartData[];
}

const COLORS = {
    Expired: '#EF4444', // Red
    Critical: '#F59E0B', // Amber
    Warning: '#F97316', // Orange
    Normal: '#10B981', // Green
};

export const ExpiryChart: React.FC<ExpiryChartProps> = ({ data }) => {
    const { formatCurrency } = useNumberFormatter();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">📊</div>
                    <p className="text-gray-500 text-sm">
                        No expiry data available for the selected date range
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        Try adjusting your filters or date range
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {data.map((item) => (
                    <div
                        key={item.alertLevel}
                        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mx-auto mb-2 chart-indicator-${item.alertLevel.toLowerCase()}`}
                        />
                        <p className="text-xs font-medium text-gray-600 mb-1">
                            {item.alertLevel} Drugs
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                            {item.count}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatCurrency(item.totalValue)} value
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-1">
                            {(
                                (item.count /
                                    data.reduce((sum, d) => sum + d.count, 0)) *
                                100
                            ).toFixed(1)}
                            %
                        </p>
                    </div>
                ))}
            </div>

            {/* Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Drug Expiry Distribution
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                        Total: {data.reduce((sum, item) => sum + item.count, 0)}{' '}
                        drugs
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        COLORS[
                                            entry.alertLevel as keyof typeof COLORS
                                        ]
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => [
                                `${value} drugs (${(
                                    (value /
                                        data.reduce(
                                            (sum, d) => sum + d.count,
                                            0,
                                        )) *
                                    100
                                ).toFixed(1)}%)`,
                                'Drug Count',
                            ]}
                            labelFormatter={(label: string) =>
                                `${label} Status`
                            }
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow:
                                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '14px',
                            }}
                        />
                        <Legend
                            formatter={(value: string) =>
                                `${value} (${
                                    data.find((d) => d.alertLevel === value)
                                        ?.count || 0
                                } drugs)`
                            }
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '14px',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Detailed Expiry Analysis
                </h4>
                <div className="space-y-2 sm:space-y-3">
                    {data.map((item) => (
                        <div
                            key={item.alertLevel}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <div
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 sm:mr-4 chart-indicator-${item.alertLevel.toLowerCase()}`}
                                />
                                <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                                        {item.alertLevel} Status
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        {item.alertLevel === 'Expired'
                                            ? 'Past expiry date'
                                            : item.alertLevel === 'Critical'
                                            ? '≤ 30 days remaining'
                                            : item.alertLevel === 'Warning'
                                            ? '31-90 days remaining'
                                            : '> 90 days remaining'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs sm:text-sm font-bold text-gray-900">
                                    {item.count} drugs
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatCurrency(item.totalValue)} at risk
                                </div>
                                <div className="text-xs font-medium text-blue-600">
                                    {(
                                        (item.count /
                                            data.reduce(
                                                (sum, d) => sum + d.count,
                                                0,
                                            )) *
                                        100
                                    ).toFixed(1)}
                                    % of total
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">
                    📊 Key Insights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-blue-700">
                                Total drugs analyzed:
                            </span>
                            <span className="font-medium text-blue-900">
                                {data.reduce((sum, item) => sum + item.count, 0)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-blue-700">
                                Total value at risk:
                            </span>
                            <span className="font-medium text-blue-900">
                                {formatCurrency(
                                    data.reduce(
                                        (sum, item) => sum + item.totalValue,
                                        0,
                                    ),
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-blue-700">
                                Critical attention needed:
                            </span>
                            <span className="font-medium text-red-600">
                                {data.find((d) => d.alertLevel === 'Expired')
                                    ?.count || 0}{' '}
                                +{' '}
                                {data.find((d) => d.alertLevel === 'Critical')
                                    ?.count || 0}{' '}
                                drugs
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-blue-700">
                                Most urgent category:
                            </span>
                            <span className="font-medium text-blue-900">
                                {(() => {
                                    const urgentItems = data.filter(
                                        (item) =>
                                            item.alertLevel === 'Expired' ||
                                            item.alertLevel === 'Critical',
                                    );
                                    if (urgentItems.length === 0)
                                        return 'None';
                                    const mostUrgent = urgentItems.reduce(
                                        (max, item) =>
                                            item.count > max.count ? item : max,
                                    );
                                    return mostUrgent.alertLevel;
                                })()}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-blue-700">
                                Risk percentage:
                            </span>
                            <span className="font-medium text-blue-900">
                                {(
                                    (((data.find(
                                        (d) => d.alertLevel === 'Expired',
                                    )?.count || 0) +
                                        (data.find(
                                            (d) => d.alertLevel === 'Critical',
                                        )?.count || 0)) /
                                        data.reduce(
                                            (sum, item) => sum + item.count,
                                            0,
                                        )) *
                                    100
                                ).toFixed(1)}
                                %
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
