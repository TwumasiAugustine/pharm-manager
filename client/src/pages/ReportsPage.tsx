import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiCalendar } from 'react-icons/fi';
import { useReports } from '../hooks/useReports';
import { ReportSummary } from '../components/molecules/ReportSummary';
import { ReportFilter } from '../components/molecules/ReportFilter';
import ReportTable from '../components/molecules/ReportTable';
import DashboardLayout from '../layouts/DashboardLayout';
import type { ReportFilters } from '../types/report.types';

export const ReportsPage: React.FC = () => {
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            end: new Date().toISOString().split('T')[0],
        },
        reportType: 'sales',
        format: 'table',
    });

    const {
        reportData,
        reportSummary,
        isLoading,
        isGenerating,
        generateReport,
        exportReport,
        refreshData,
    } = useReports(filters);

    // Debug logging
    useEffect(() => {
        console.log('ReportsPage - reportData:', reportData);
        console.log('ReportsPage - reportData type:', typeof reportData);
        console.log('ReportsPage - is array:', Array.isArray(reportData));
    }, [reportData]);

    const handleFilterChange = (newFilters: ReportFilters) => {
        setFilters(newFilters);
    };

    const handleExportReport = async (format: 'pdf' | 'csv') => {
        try {
            await exportReport(format, filters);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    const handleGenerateReport = async () => {
        try {
            await generateReport(filters);
        } catch (error) {
            console.error('Report generation failed:', error);
            alert('Failed to generate report. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Reports & Analytics
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Generate comprehensive reports and analyze
                                    pharmacy performance
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FiFilter className="h-4 w-4 mr-2" />
                                    Filters
                                </button>

                                {/* Refresh button */}
                                <button
                                    onClick={() => refreshData()}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    disabled={isLoading}
                                >
                                    <FiRefreshCw
                                        className={`h-4 w-4 mr-2 ${
                                            isLoading ? 'animate-spin' : ''
                                        }`}
                                    />
                                    Refresh
                                </button>

                                {/* Generate Report button */}
                                <button
                                    onClick={handleGenerateReport}
                                    className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                    disabled={isGenerating}
                                >
                                    <FiCalendar className="h-4 w-4 mr-2" />
                                    {isGenerating
                                        ? 'Generating...'
                                        : 'Generate'}
                                </button>

                                {/* Export buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            handleExportReport('csv')
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        disabled={!reportData || isGenerating}
                                    >
                                        <FiDownload className="h-4 w-4 mr-2" />
                                        CSV
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleExportReport('pdf')
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        disabled={!reportData || isGenerating}
                                    >
                                        <FiDownload className="h-4 w-4 mr-2" />
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Filters (Desktop) / Collapsible (Mobile) */}
                        <div
                            className={`lg:col-span-1 ${
                                showFilters ? 'block' : 'hidden sm:block'
                            }`}
                        >
                            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                                <ReportFilter
                                    filters={filters}
                                    onFiltersChange={handleFilterChange}
                                    className="lg:mb-0 mb-6"
                                />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Report Summary */}
                            <ReportSummary
                                summary={reportSummary}
                                isLoading={isLoading}
                            />

                            {/* Report Table */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-4 sm:p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {filters.reportType === 'sales'
                                                    ? 'Sales Report'
                                                    : filters.reportType ===
                                                      'inventory'
                                                    ? 'Inventory Report'
                                                    : filters.reportType ===
                                                      'expiry'
                                                    ? 'Expiry Report'
                                                    : 'Financial Report'}
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {reportData?.length || 0}{' '}
                                                records found
                                            </p>
                                        </div>

                                        {/* Date range display */}
                                        <div className="text-sm text-gray-500">
                                            {filters.dateRange.start} to{' '}
                                            {filters.dateRange.end}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <ReportTable
                                        data={reportData || []}
                                        reportType={filters.reportType}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
