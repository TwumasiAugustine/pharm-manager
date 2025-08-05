import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { FiBarChart } from 'react-icons/fi';
import type { ReportDataItem, ReportFilters } from '../../types/report.types';

interface ReportChartProps {
    data: ReportDataItem[];
    reportType: ReportFilters['reportType'];
    isLoading: boolean;
}

export const ReportChart: React.FC<ReportChartProps> = ({
    data,
    reportType,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading chart...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <FiBarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No data to display
                    </h3>
                    <p className="text-gray-500">
                        No data available for the selected filters
                    </p>
                </div>
            </div>
        );
    }

    const formatCurrency = (value: number) => `GH₵${value.toLocaleString()}`;

    const prepareChartData = () => {
        switch (reportType) {
            case 'sales': {
                // Group by date and aggregate
                const groupedData = data.reduce(
                    (acc, item) => {
                        const date = new Date(item.date).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = {
                                date,
                                totalSales: 0,
                                totalProfit: 0,
                                count: 0,
                            };
                        }
                        acc[date].totalSales += item.totalPrice;
                        acc[date].totalProfit += item.profit || 0;
                        acc[date].count += 1;
                        return acc;
                    },
                    {} as Record<
                        string,
                        {
                            date: string;
                            totalSales: number;
                            totalProfit: number;
                            count: number;
                        }
                    >,
                );

                return Object.values(groupedData).sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                );
            }

            case 'inventory': {
                // Group by category
                const groupedData = data.reduce(
                    (acc, item) => {
                        const category = item.category || 'Other';
                        if (!acc[category]) {
                            acc[category] = {
                                category,
                                totalValue: 0,
                                totalQuantity: 0,
                                count: 0,
                            };
                        }
                        acc[category].totalValue += item.totalPrice;
                        acc[category].totalQuantity += item.quantity;
                        acc[category].count += 1;
                        return acc;
                    },
                    {} as Record<
                        string,
                        {
                            category: string;
                            totalValue: number;
                            totalQuantity: number;
                            count: number;
                        }
                    >,
                );

                return Object.values(groupedData);
            }

            case 'expiry': {
                // Group by alert level
                const groupedData = data.reduce(
                    (acc, item) => {
                        const daysLeft =
                            item.daysUntilExpiry !== undefined
                                ? item.daysUntilExpiry
                                : item.expiryDate
                                ? Math.ceil(
                                      (new Date(item.expiryDate).getTime() -
                                          Date.now()) /
                                          (1000 * 60 * 60 * 24),
                                  )
                                : 0;

                        let alertLevel: string;
                        if (daysLeft <= 0) alertLevel = 'Expired';
                        else if (daysLeft <= 30) alertLevel = 'Critical';
                        else if (daysLeft <= 90) alertLevel = 'Warning';
                        else alertLevel = 'Normal';

                        if (!acc[alertLevel]) {
                            acc[alertLevel] = {
                                alertLevel,
                                count: 0,
                                totalValue: 0,
                            };
                        }
                        acc[alertLevel].count += 1;
                        acc[alertLevel].totalValue += item.totalPrice;
                        return acc;
                    },
                    {} as Record<
                        string,
                        {
                            alertLevel: string;
                            count: number;
                            totalValue: number;
                        }
                    >,
                );

                return Object.values(groupedData);
            }

            case 'financial': {
                // Group by date for financial trends
                const groupedData = data.reduce(
                    (acc, item) => {
                        const date = new Date(item.date).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = {
                                date,
                                revenue: 0,
                                profit: 0,
                            };
                        }
                        acc[date].revenue += item.totalPrice;
                        acc[date].profit += item.profit || 0;
                        return acc;
                    },
                    {} as Record<
                        string,
                        {
                            date: string;
                            revenue: number;
                            profit: number;
                        }
                    >,
                );

                return Object.values(groupedData).sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                );
            }

            default:
                return data;
        }
    };

    const chartData = prepareChartData();

    const renderChart = () => {
        switch (reportType) {
            case 'sales':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value),
                                    name === 'totalSales'
                                        ? 'Total Sales'
                                        : 'Total Profit',
                                ]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="totalSales"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                name="Total Sales"
                            />
                            <Line
                                type="monotone"
                                dataKey="totalProfit"
                                stroke="#10B981"
                                strokeWidth={2}
                                name="Total Profit"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'inventory':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="category"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'totalValue'
                                        ? formatCurrency(value)
                                        : value,
                                    name === 'totalValue'
                                        ? 'Total Value'
                                        : 'Total Quantity',
                                ]}
                            />
                            <Legend />
                            <Bar
                                dataKey="totalValue"
                                fill="#3B82F6"
                                name="Total Value"
                            />
                            <Bar
                                dataKey="totalQuantity"
                                fill="#10B981"
                                name="Total Quantity"
                                yAxisId="right"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'expiry': {
                const COLORS = {
                    Expired: '#EF4444', // Red
                    Critical: '#F59E0B', // Amber
                    Warning: '#F97316', // Orange
                    Normal: '#10B981', // Green
                };

                // Cast chartData to the expected type for expiry
                const expiryData = chartData as Array<{
                    alertLevel: string;
                    count: number;
                    totalValue: number;
                }>;

                return (
                    <div className="space-y-6">
                        {/* Expiry Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {expiryData.map((item) => (
                                <div
                                    key={item.alertLevel}
                                    className="bg-gray-50 rounded-lg p-4 text-center"
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full mx-auto mb-2 chart-indicator-${item.alertLevel.toLowerCase()}`}
                                    />
                                    <p className="text-xs font-medium text-gray-600 mb-1">
                                        {item.alertLevel} Drugs
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {item.count}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatCurrency(item.totalValue)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Pie Chart */}
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={expiryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {expiryData.map((entry, index) => (
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
                                        `${value} drugs`,
                                        'Count',
                                    ]}
                                    labelFormatter={() => 'Expiry Status'}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        boxShadow:
                                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                                <Legend formatter={(value: string) => value} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Detailed Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Expiry Status Breakdown
                            </h4>
                            <div className="space-y-2">
                                {expiryData.map((item) => (
                                    <div
                                        key={item.alertLevel}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`w-3 h-3 rounded-full mr-3 chart-indicator-${item.alertLevel.toLowerCase()}`}
                                            />
                                            <span className="text-sm text-gray-700">
                                                {item.alertLevel}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.count} drugs
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatCurrency(
                                                    item.totalValue,
                                                )}{' '}
                                                value at risk
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alert Level Descriptions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                                Alert Level Definitions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="font-medium text-red-700">
                                            Expired:
                                        </span>
                                        <span className="text-red-600 ml-1">
                                            Past expiry date
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="font-medium text-amber-700">
                                            Critical:
                                        </span>
                                        <span className="text-amber-600 ml-1">
                                            ≤ 30 days remaining
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="font-medium text-orange-700">
                                            Warning:
                                        </span>
                                        <span className="text-orange-600 ml-1">
                                            31-90 days remaining
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="font-medium text-green-700">
                                            Normal:
                                        </span>
                                        <span className="text-green-600 ml-1">
                                            &gt; 90 days remaining
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'financial':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    formatCurrency(value),
                                    name === 'revenue' ? 'Revenue' : 'Profit',
                                ]}
                            />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                fill="#3B82F6"
                                name="Revenue"
                            />
                            <Bar
                                dataKey="profit"
                                fill="#10B981"
                                name="Profit"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            Chart view not available for this report type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {renderChart()}

            {/* Chart Summary */}
            {reportType !== 'expiry' && (
                <div className="mt-6 bg-gray-50 px-6 py-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-600">Total Records</p>
                            <p className="font-semibold text-gray-900">
                                {data.length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Total Value</p>
                            <p className="font-semibold text-gray-900">
                                {formatCurrency(
                                    data.reduce(
                                        (sum, item) => sum + item.totalPrice,
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                        {reportType === 'sales' && (
                            <div className="text-center">
                                <p className="text-gray-600">Total Profit</p>
                                <p className="font-semibold text-green-600">
                                    {formatCurrency(
                                        data.reduce(
                                            (sum, item) =>
                                                sum + (item.profit || 0),
                                            0,
                                        ),
                                    )}
                                </p>
                            </div>
                        )}
                        {reportType === 'inventory' && (
                            <div className="text-center">
                                <p className="text-gray-600">Total Quantity</p>
                                <p className="font-semibold text-gray-900">
                                    {data.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0,
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportChart;
