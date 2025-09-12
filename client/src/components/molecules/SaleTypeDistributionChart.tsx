/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import type { SaleTypeDistribution } from '../../types/dashboard.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

interface SaleTypeDistributionChartProps {
    data: SaleTypeDistribution[];
    isLoading?: boolean;
}

const COLORS = {
    unit: '#10B981', // Green
    pack: '#3B82F6', // Blue
    carton: '#8B5CF6', // Purple
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg">
                <p className="font-medium text-gray-900 capitalize">
                    {data.type} Sales
                </p>
                <p className="text-sm text-gray-600">
                    Count: {data.count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                    Revenue: {formatGHSDisplayAmount(data.revenue)}
                </p>
                <p className="text-sm text-gray-600">
                    Profit: {formatGHSDisplayAmount(data.profit)}
                </p>
                <p className="text-sm text-gray-600">
                    Share: {data.percentage.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};

export const SaleTypeDistributionChart: React.FC<
    SaleTypeDistributionChartProps
> = ({ data, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sale Type Distribution
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
                        Sale Type Distribution
                    </h3>
                </div>
                <div className="h-80 flex items-center justify-center text-gray-500">
                    No sale type data available
                </div>
            </div>
        );
    }

    // Filter out any invalid data and add safety checks
    const validData = data.filter(
        (item) => item && item.type && typeof item.type === 'string',
    );

    if (validData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sale Type Distribution
                    </h3>
                </div>
                <div className="h-80 flex items-center justify-center text-gray-500">
                    No valid sale type data available
                </div>
            </div>
        );
    }

    const chartData = validData.map((item) => ({
        ...item,
        name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        value: item.count,
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Sale Type Distribution
                </h3>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        COLORS[
                                            entry.type as keyof typeof COLORS
                                        ]
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span style={{ color: entry.color }}>
                                    {value} (
                                    {entry.payload.percentage.toFixed(1)}%)
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                    {validData.map((item) => (
                        <div key={item.type} className="space-y-1">
                            <div
                                className="w-3 h-3 rounded-full mx-auto"
                                style={{
                                    backgroundColor:
                                        COLORS[
                                            item.type as keyof typeof COLORS
                                        ],
                                }}
                            ></div>
                            <p className="text-xs text-gray-600 capitalize">
                                {item.type}
                            </p>
                            <p className="text-sm font-medium">{item.count}</p>
                            <p className="text-xs text-gray-500">
                                {formatGHSDisplayAmount(item.revenue)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
