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
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sales Trends
                    </h3>
                </div>
                <div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sales Trends
                    </h3>
                </div>
                <div className="h-80 flex items-center justify-center text-gray-500">
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Sales Trends
                </h3>
                <div className="flex items-center gap-4 text-sm">
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

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="period"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            yAxisId="sales"
                            orientation="left"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            yAxisId="revenue"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={(value) =>
                                `$${(value / 1000).toFixed(0)}K`
                            }
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelStyle={{ color: '#1f2937' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Legend />
                        <Line
                            yAxisId="sales"
                            type="monotone"
                            dataKey="sales"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
