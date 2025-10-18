import React from 'react';
import type { ReportDataItem, ReportFilters } from '../../types/report.types';
import { ChartLoadingState } from './charts/ChartLoadingState';
import { ChartEmptyState } from './charts/ChartEmptyState';
import { ChartSummary } from './charts/ChartSummary';
import { SalesChart } from './charts/SalesChart';
import { InventoryChart } from './charts/InventoryChart';
import { ExpiryChart } from './charts/ExpiryChart';
import { FinancialChart } from './charts/FinancialChart';
import {
    prepareSalesChartData,
    prepareInventoryChartData,
    prepareExpiryChartData,
    prepareFinancialChartData,
} from '../../utils/chart-data.utils';

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
        return <ChartLoadingState />;
    }

    if (!data || data.length === 0) {
        return <ChartEmptyState />;
    }

    const renderChart = () => {
        switch (reportType) {
            case 'sales':
                return <SalesChart data={prepareSalesChartData(data)} />;

            case 'inventory':
                return (
                    <InventoryChart data={prepareInventoryChartData(data)} />
                );

            case 'expiry':
                return <ExpiryChart data={prepareExpiryChartData(data)} />;

            case 'financial':
                return (
                    <FinancialChart data={prepareFinancialChartData(data)} />
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64 sm:h-80 md:h-96 bg-gray-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-500">
                            Chart view not available for this report type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {renderChart()}
            {reportType !== 'expiry' && (
                <ChartSummary data={data} reportType={reportType} />
            )}
        </div>
    );
};

export default ReportChart;
