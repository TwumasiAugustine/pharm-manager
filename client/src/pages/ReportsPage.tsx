import React, { useState, useRef, useEffect } from 'react';
import {
    FiDownload,
    FiRefreshCw,
    FiFilter,
    FiCalendar,
    FiMoreVertical,
} from 'react-icons/fi';
import { useReports } from '../hooks/useReports';
import { useSafeNotify } from '../utils/useSafeNotify';
import { ReportSummary } from '../components/molecules/ReportSummary';
import { ReportFilter } from '../components/molecules/ReportFilter';
import ReportTable from '../components/molecules/ReportTable';
import ReportChart from '../components/molecules/ReportChart';
import { Pagination } from '../components/molecules/Pagination';
import DashboardLayout from '../layouts/DashboardLayout';
import type { ReportFilters } from '../types/report.types';

export const ReportsPage: React.FC = () => {
    const [showFilters, setShowFilters] = useState(true);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            end: new Date().toISOString().split('T')[0],
        },
        reportType: 'sales',
        format: 'table',
        page: 1,
        limit: 5, // Set limit to 5 for screen display
    });

    // Close actions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        };

        if (showActionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsDropdown]);

    const {
        reportData,
        reportSummary,
        totalRecords,
        currentPage,
        totalPages,
        isLoading,
        isGenerating,
        generateReport,
        exportReport,
        refreshData,
    } = useReports(filters);

    const handleFilterChange = (newFilters: ReportFilters) => {
        setFilters({ ...newFilters, page: 1 }); // Reset to first page when filters change
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleExportReport = async (format: 'pdf' | 'csv') => {
        try {
            // Create export filters without pagination to get all data
            const exportFilters = {
                ...filters,
                page: undefined,
                limit: undefined,
            };
            await exportReport(format, exportFilters);
        } catch (error) {
            console.error('Export failed:', error);
            notify.error('Failed to export report. Please try again.');
        }
    };

    const handleGenerateReport = async () => {
        try {
            await generateReport(filters);
        } catch (error) {
            console.error('Report generation failed:', error);
            notify.error('Failed to generate report. Please try again.');
        }
    };

    // Loading skeleton component for initial load
    const ReportsPageSkeleton = () => (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                                <div>
                                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content skeleton */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Sidebar skeleton */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content skeleton */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Summary skeleton */}
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Table skeleton */}
                                <div className="bg-white rounded-lg shadow-sm border">
                                    <div className="p-6 border-b">
                                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="p-6">
                                        {/* Table header */}
                                        <div className="grid grid-cols-7 gap-4 pb-3 border-b mb-4">
                                            {[...Array(7)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-5 bg-gray-200 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                        {/* Table rows */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="grid grid-cols-7 gap-4 py-3 border-b border-gray-100"
                                            >
                                                {[...Array(7)].map((_, j) => (
                                                    <div
                                                        key={j}
                                                        className="h-5 bg-gray-200 rounded"
                                                    ></div>
                                                ))}
                                            </div>
                                        ))}
                                        {/* Pagination skeleton */}
                                        <div className="mt-6 flex justify-center">
                                            <div className="flex space-x-2">
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    // Show skeleton on initial load
    if (isLoading && !reportData?.length) {
        return <ReportsPageSkeleton />;
    }

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

                            <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                                {/* Desktop view - show all buttons (large screens and above) */}
                                <div className="hidden lg:flex items-center gap-3">
                                    {/* Mobile filter toggle */}
                                    <button
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                        className="xl:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
                                            disabled={
                                                !reportData || isGenerating
                                            }
                                        >
                                            <FiDownload className="h-4 w-4 mr-2" />
                                            CSV
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleExportReport('pdf')
                                            }
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            disabled={
                                                !reportData || isGenerating
                                            }
                                        >
                                            <FiDownload className="h-4 w-4 mr-2" />
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile/Tablet view - Actions dropdown (small to large screens) */}
                                <div
                                    className="lg:hidden relative"
                                    ref={actionsDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setShowActionsDropdown(
                                                !showActionsDropdown,
                                            )
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="mr-2">Actions</span>
                                        <FiMoreVertical className="h-4 w-4" />
                                    </button>

                                    {/* Actions dropdown panel */}
                                    {showActionsDropdown && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                            <div className="py-1">
                                                {/* Filter option */}
                                                <button
                                                    onClick={() => {
                                                        setShowFilters(
                                                            !showFilters,
                                                        );
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <FiFilter className="h-4 w-4 mr-3" />
                                                    {showFilters
                                                        ? 'Hide Filters'
                                                        : 'Show Filters'}
                                                </button>

                                                {/* Refresh option */}
                                                <button
                                                    onClick={() => {
                                                        refreshData();
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={isLoading}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiRefreshCw
                                                        className={`h-4 w-4 mr-3 ${
                                                            isLoading
                                                                ? 'animate-spin'
                                                                : ''
                                                        }`}
                                                    />
                                                    Refresh
                                                </button>

                                                {/* Generate Report option */}
                                                <button
                                                    onClick={() => {
                                                        handleGenerateReport();
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={isGenerating}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiCalendar className="h-4 w-4 mr-3" />
                                                    {isGenerating
                                                        ? 'Generating...'
                                                        : 'Generate Report'}
                                                </button>

                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Export CSV option */}
                                                <button
                                                    onClick={() => {
                                                        handleExportReport(
                                                            'csv',
                                                        );
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={
                                                        !reportData ||
                                                        isGenerating
                                                    }
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiDownload className="h-4 w-4 mr-3" />
                                                    Export CSV
                                                </button>

                                                {/* Export PDF option */}
                                                <button
                                                    onClick={() => {
                                                        handleExportReport(
                                                            'pdf',
                                                        );
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={
                                                        !reportData ||
                                                        isGenerating
                                                    }
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiDownload className="h-4 w-4 mr-3" />
                                                    Export PDF
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Filters (Desktop) / Collapsible (Mobile/Tablet) */}
                        <div
                            className={`lg:col-span-1 ${
                                showFilters ? 'block' : 'hidden lg:block'
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
                                                {totalRecords || 0} records
                                                found
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
                                                        currentPage={
                                                            currentPage
                                                        }
                                                        totalPages={totalPages}
                                                        onPageChange={
                                                            handlePageChange
                                                        }
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
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
