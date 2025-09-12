/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { ProfitMarginAnalysis } from '../../types/dashboard.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

interface ProfitMarginAnalysisChartProps {
    data: ProfitMarginAnalysis[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">
                    Revenue: {formatGHSDisplayAmount(data.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">
                    Profit: {formatGHSDisplayAmount(data.totalProfit)}
                </p>
                <p className="text-sm text-gray-600">
                    Margin: {data.profitMargin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                    Sales: {data.salesCount.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export const ProfitMarginAnalysisChart: React.FC<
    ProfitMarginAnalysisChartProps
> = ({ data, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Profit Margin by Category
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
                        Profit Margin by Category
                    </h3>
                </div>
                <div className="h-80 flex items-center justify-center text-gray-500">
                    No profit margin data available
                </div>
            </div>
        );
    }

    // Sort data by profit margin descending
    const sortedData = [...data].sort(
        (a, b) => b.profitMargin - a.profitMargin,
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Profit Margin by Category
                </h3>
                <div className="text-sm text-gray-500">Sorted by margin %</div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sortedData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 80,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="category"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                        />
                        <YAxis
                            label={{
                                value: 'Profit Margin %',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="profitMargin"
                            fill="#10B981"
                            name="Profit Margin %"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-600">Avg Margin</p>
                        <p className="text-sm font-medium">
                            {(
                                sortedData.reduce(
                                    (sum, item) => sum + item.profitMargin,
                                    0,
                                ) / sortedData.length
                            ).toFixed(1)}
                            %
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Best Category</p>
                        <p className="text-sm font-medium truncate">
                            {sortedData[0]?.category || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Total Revenue</p>
                        <p className="text-sm font-medium">
                            {formatGHSDisplayAmount(
                                sortedData.reduce(
                                    (sum, item) => sum + item.totalRevenue,
                                    0,
                                ),
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Total Profit</p>
                        <p className="text-sm font-medium">
                            {formatGHSDisplayAmount(
                                sortedData.reduce(
                                    (sum, item) => sum + item.totalProfit,
                                    0,
                                ),
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
