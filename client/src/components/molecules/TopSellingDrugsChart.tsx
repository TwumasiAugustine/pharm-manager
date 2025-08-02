import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { TopSellingDrug } from '../../types/dashboard.types';

interface TopSellingDrugsChartProps {
    data: TopSellingDrug[];
    isLoading?: boolean;
}

export const TopSellingDrugsChart: React.FC<TopSellingDrugsChartProps> = ({
    data,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Top Selling Drugs
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
                        Top Selling Drugs
                    </h3>
                </div>
                <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 text-sm sm:text-base">
                    No top selling drugs data available
                </div>
            </div>
        );
    }

    // Prepare data for chart (take top 10, adjust names for mobile)
    const chartData = data.slice(0, 10).map((drug) => ({
        name:
            drug.name.length > 12
                ? `${drug.name.substring(0, 12)}...`
                : drug.name,
        fullName: drug.name,
        brand: drug.brand,
        category: drug.category,
        quantity: drug.totalQuantity,
        revenue: drug.totalRevenue,
    }));

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
        return [value.toLocaleString(), 'Quantity Sold'];
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">
                        {data.fullName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                        Brand: {data.brand}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Category: {data.category}
                    </p>
                    <div className="border-t pt-2">
                        <p className="text-sm">
                            <span className="text-blue-600 font-medium">
                                Quantity Sold: {data.quantity.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-sm">
                            <span className="text-green-600 font-medium">
                                Revenue:{' '}
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(data.revenue)}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-0">
                    Top Selling Drugs
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Quantity Sold</span>
                    </div>
                </div>
            </div>

            <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 15,
                            left: 10,
                            bottom: 50,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                            interval={0}
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="quantity"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table view for additional details */}
            <div className="mt-4 sm:mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Detailed Rankings
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-gray-600 font-medium">
                                    Rank
                                </th>
                                <th className="text-left py-2 text-gray-600 font-medium">
                                    Drug Name
                                </th>
                                <th className="text-left py-2 text-gray-600 font-medium hidden sm:table-cell">
                                    Brand
                                </th>
                                <th className="text-right py-2 text-gray-600 font-medium">
                                    Qty Sold
                                </th>
                                <th className="text-right py-2 text-gray-600 font-medium">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((drug, index) => (
                                <tr
                                    key={drug.id}
                                    className="border-b border-gray-100"
                                >
                                    <td className="py-2 text-gray-900 font-medium">
                                        #{index + 1}
                                    </td>
                                    <td className="py-2 text-gray-900">
                                        <div className="truncate max-w-32 sm:max-w-none">
                                            {drug.name}
                                        </div>
                                        <div className="text-xs text-gray-500 sm:hidden">
                                            {drug.brand}
                                        </div>
                                    </td>
                                    <td className="py-2 text-gray-600 hidden sm:table-cell">
                                        {drug.brand}
                                    </td>
                                    <td className="py-2 text-right text-gray-900 font-medium">
                                        {drug.totalQuantity.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-right text-green-600 font-medium">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }).format(drug.totalRevenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
