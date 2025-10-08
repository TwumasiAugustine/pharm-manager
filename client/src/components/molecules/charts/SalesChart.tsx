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
import type { SalesChartData } from '../../../utils/chart-data.utils';

interface SalesChartProps {
    data: SalesChartData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const { formatCurrency } = useNumberFormatter();

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={300} className="sm:h-[350px] md:h-[400px]">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        className="sm:text-xs md:text-sm"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fontSize: 10 }}
                        className="sm:text-xs md:text-sm"
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
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
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
