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
import Badge from '../atoms/Badge';
import { formatGHSCurrency } from '../../utils/currency';

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
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Top Selling Drugs
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
                        Top Selling Drugs
                    </h3>
                </div>
                <div className="h-80 flex items-center justify-center text-gray-500">
                    No top selling drugs data available
                </div>
            </div>
        );
    }

    // Prepare data for chart (limit to 3)
    const chartData = data.slice(0, 3).map((drug) => ({
        name:
            drug.name.length > 15
                ? `${drug.name.substring(0, 15)}...`
                : drug.name,
        fullName: drug.name,
        brand: drug.brand,
        category: drug.category,
        quantity: drug.totalQuantity,
        revenue: drug.totalRevenue,
        salesByType: drug.salesByType || [],
    }));

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{
            payload: {
                fullName: string;
                brand: string;
                category: string;
                quantity: number;
                revenue: number;
                salesByType: Array<{
                    saleType: string;
                    quantity: number;
                }>;
            };
        }>;
    }

    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
                    <p className="font-semibold text-gray-900 mb-2">
                        {data.fullName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                        Brand: {data.brand}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Category: {data.category}
                    </p>
                    <div className="border-t pt-2 mb-2">
                        <p className="text-sm">
                            <span className="text-blue-600 font-medium">
                                Quantity Sold: {data.quantity.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-sm">
                            <span className="text-green-600 font-medium">
                                Revenue: {formatGHSCurrency(data.revenue)}
                            </span>
                        </p>
                    </div>
                    {data.salesByType && data.salesByType.length > 0 && (
                        <div className="border-t pt-2">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                                Sales by Type:
                            </p>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {data.salesByType.map((sale, index) => (
                                    <Badge
                                        key={index}
                                        variant="info"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        {sale.saleType}: {sale.quantity}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Top Selling Drugs
                </h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Quantity Sold</span>
                    </div>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e5e7eb' }}
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
            <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Detailed Rankings (Top 3)
                </h4>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="max-h-64 overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                                        Rank
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                                        Drug Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                                        Brand
                                    </th>
                                    <th className="text-right py-3 px-4 text-gray-600 font-medium">
                                        Revenue
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                                        Sales Types & Qty
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {data.slice(0, 3).map((drug, index) => (
                                    <tr
                                        key={drug.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <Badge
                                                variant={
                                                    index === 0
                                                        ? 'warning'
                                                        : index === 1
                                                        ? 'secondary'
                                                        : 'info'
                                                }
                                                size="sm"
                                            >
                                                #{index + 1}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">
                                                {drug.name}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {drug.brand}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Badge variant="success" size="sm">
                                                {formatGHSCurrency(
                                                    drug.totalRevenue,
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            {drug.salesByType &&
                                            drug.salesByType.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                                    {drug.salesByType.map(
                                                        (sale, saleIndex) => (
                                                            <Badge
                                                                key={saleIndex}
                                                                variant="primary"
                                                                size="sm"
                                                                className="text-xs"
                                                            >
                                                                {sale.saleType}:{' '}
                                                                {sale.quantity}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs"
                                                >
                                                    No sales data
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
