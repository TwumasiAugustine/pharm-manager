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

interface InventoryChartData {
    category: string;
    totalValue: number;
    totalQuantity: number;
    count: number;
}

interface InventoryChartProps {
    data: InventoryChartData[];
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
    const { formatCurrency } = useNumberFormatter();

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
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
        </div>
    );
};
