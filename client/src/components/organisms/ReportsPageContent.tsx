import React from 'react';
import { ReportSummary } from '../molecules/ReportSummary';
import ReportTable from '../molecules/ReportTable';
import ReportChart from '../molecules/ReportChart';
import { Pagination } from '../molecules/Pagination';
import type {
    ReportFilters,
    ReportDataItem,
    ReportSummaryData,
} from '../../types/report.types';

interface ReportsPageContentProps {
    filters: ReportFilters;
    reportData: ReportDataItem[] | null;
    reportSummary: ReportSummaryData | null;
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

export const ReportsPageContent: React.FC<ReportsPageContentProps> = ({
    filters,
    reportData,
    reportSummary,
    totalRecords,
    currentPage,
    totalPages,
    isLoading,
    onPageChange,
}) => {
    const getReportTitle = () => {
        switch (filters.reportType) {
            case 'sales':
                return 'Sales Report';
            case 'inventory':
                return 'Inventory Report';
            case 'expiry':
                return 'Expiry Report';
            default:
                return 'Financial Report';
        }
    };

    return (
        <div className="lg:col-span-3 space-y-6">
            {/* Report Summary */}
            <ReportSummary summary={reportSummary} isLoading={isLoading} />

            {/* Report Table */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {getReportTitle()}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {totalRecords || 0} records found
                            </p>
                        </div>

                        {/* Date range display */}
                        <div className="text-sm text-gray-500">
                            {filters.dateRange.start} to {filters.dateRange.end}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {filters.format === 'table' ? (
                        <>
                            <ReportTable
                                data={reportData || []}
                                reportType={filters.reportType}
                                isLoading={isLoading}
                            />

                            {/* Pagination Controls */}
                            {!isLoading && totalPages > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={onPageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <ReportChart
                            data={reportData || []}
                            reportType={filters.reportType}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
