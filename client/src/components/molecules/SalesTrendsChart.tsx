import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { SalesPeriodData } from '../../types/dashboard.types';

interface SalesTrendsChartProps {
    data: SalesPeriodData[];
    isLoading?: boolean;
}

export const SalesTrendsChart: React.FC<SalesTrendsChartProps> = ({
    data,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Sales Trends
                    </h3>
                </div>
                <div className="h-64 sm:h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Sales Trends
                    </h3>
                </div>
                <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 text-sm sm:text-base">
                    No sales data available for the selected period
                </div>
            </div>
        );
    }

    const formatTooltipValue = (value: number, name: string) => {
        if (name === 'revenue') {
            return [
                new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(value),
                'Revenue',
            ];
        }
        return [value.toLocaleString(), 'Sales Count'];
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-0">
                    Sales Trends
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Sales Count</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Revenue</span>
                    </div>
                </div>
            </div>

            <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="period"
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            yAxisId="sales"
                            orientation="left"
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            width={40}
                        />
                        <YAxis
                            yAxisId="revenue"
                            orientation="right"
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={(value) =>
                                `$${(value / 1000).toFixed(0)}K`
                            }
                            width={50}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelStyle={{ color: '#1f2937' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                            yAxisId="sales"
                            type="monotone"
                            dataKey="sales"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
