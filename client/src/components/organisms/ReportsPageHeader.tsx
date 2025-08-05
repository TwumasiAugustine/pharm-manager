import React from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiCalendar } from 'react-icons/fi';
import { ReportsPageActions } from './ReportsPageActions';
import type { ReportDataItem } from '../../types/report.types';

interface ReportsPageHeaderProps {
    showFilters: boolean;
    showActionsDropdown: boolean;
    isLoading: boolean;
    isGenerating: boolean;
    reportData: ReportDataItem[] | null;
    actionsDropdownRef: React.RefObject<HTMLDivElement>;
    onToggleFilters: () => void;
    onToggleActionsDropdown: () => void;
    onRefresh: () => void;
    onGenerateReport: () => void;
    onExportReport: (format: 'pdf' | 'csv') => void;
}

export const ReportsPageHeader: React.FC<ReportsPageHeaderProps> = ({
    showFilters,
    showActionsDropdown,
    isLoading,
    isGenerating,
    reportData,
    actionsDropdownRef,
    onToggleFilters,
    onToggleActionsDropdown,
    onRefresh,
    onGenerateReport,
    onExportReport,
}) => {
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Reports & Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Generate comprehensive reports and analyze pharmacy
                            performance
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                        {/* Desktop view - show all buttons (large screens and above) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Mobile filter toggle */}
                            <button
                                onClick={onToggleFilters}
                                className="xl:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FiFilter className="h-4 w-4 mr-2" />
                                Filters
                            </button>

                            {/* Refresh button */}
                            <button
                                onClick={onRefresh}
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
                                onClick={onGenerateReport}
                                className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                disabled={isGenerating}
                            >
                                <FiCalendar className="h-4 w-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </button>

                            {/* Export buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onExportReport('csv')}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    disabled={!reportData || isGenerating}
                                >
                                    <FiDownload className="h-4 w-4 mr-2" />
                                    CSV
                                </button>
                                <button
                                    onClick={() => onExportReport('pdf')}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    disabled={!reportData || isGenerating}
                                >
                                    <FiDownload className="h-4 w-4 mr-2" />
                                    PDF
                                </button>
                            </div>
                        </div>

                        {/* Mobile/Tablet view - Actions dropdown (small to large screens) */}
                        <ReportsPageActions
                            showFilters={showFilters}
                            showActionsDropdown={showActionsDropdown}
                            isLoading={isLoading}
                            isGenerating={isGenerating}
                            reportData={reportData}
                            actionsDropdownRef={actionsDropdownRef}
                            onToggleActionsDropdown={onToggleActionsDropdown}
                            onToggleFilters={onToggleFilters}
                            onRefresh={onRefresh}
                            onGenerateReport={onGenerateReport}
                            onExportReport={onExportReport}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
