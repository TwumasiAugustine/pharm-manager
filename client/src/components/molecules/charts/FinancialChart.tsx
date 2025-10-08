import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { useNumberFormatter } from '../../../hooks/useDisplayMode';

interface FinancialChartData {
    date: string;
    revenue: number;
    profit: number;
}

interface FinancialChartProps {
    data: FinancialChartData[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
    const { formatCurrency } = useNumberFormatter();

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
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
                    <Bar dataKey="profit" fill="#10B981" name="Profit" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
