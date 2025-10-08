import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { useNumberFormatter } from '../../../hooks/useDisplayMode';

interface SalesChartData {
    date: string;
    totalSales: number;
    totalProfit: number;
    count: number;
}

interface SalesChartProps {
    data: SalesChartData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const { formatCurrency } = useNumberFormatter();

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
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
        </div>
    );
};
