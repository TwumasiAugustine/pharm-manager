import React from 'react';
import {
    FiDownload,
    FiRefreshCw,
    FiFilter,
    FiCalendar,
    FiMoreVertical,
} from 'react-icons/fi';
import type { ReportDataItem } from '../../types/report.types';

interface ReportsPageActionsProps {
    showFilters: boolean;
    showActionsDropdown: boolean;
    isLoading: boolean;
    isGenerating: boolean;
    reportData: ReportDataItem[] | null;
    actionsDropdownRef: React.RefObject<HTMLDivElement>;
    onToggleActionsDropdown: () => void;
    onToggleFilters: () => void;
    onRefresh: () => void;
    onGenerateReport: () => void;
    onExportReport: (format: 'pdf' | 'csv') => void;
}

export const ReportsPageActions: React.FC<ReportsPageActionsProps> = ({
    showFilters,
    showActionsDropdown,
    isLoading,
    isGenerating,
    reportData,
    actionsDropdownRef,
    onToggleActionsDropdown,
    onToggleFilters,
    onRefresh,
    onGenerateReport,
    onExportReport,
}) => {
    const handleToggleFilters = () => {
        onToggleFilters();
        onToggleActionsDropdown();
    };

    const handleRefresh = () => {
        onRefresh();
        onToggleActionsDropdown();
    };

    const handleGenerateReport = () => {
        onGenerateReport();
        onToggleActionsDropdown();
    };

    const handleExportReport = (format: 'pdf' | 'csv') => {
        onExportReport(format);
        onToggleActionsDropdown();
    };

    return (
        <div className="lg:hidden relative" ref={actionsDropdownRef}>
            <button
                onClick={onToggleActionsDropdown}
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
                            onClick={handleToggleFilters}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <FiFilter className="h-4 w-4 mr-3" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>

                        {/* Refresh option */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <FiRefreshCw
                                className={`h-4 w-4 mr-3 ${
                                    isLoading ? 'animate-spin' : ''
                                }`}
                            />
                            Refresh
                        </button>

                        {/* Generate Report option */}
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <FiCalendar className="h-4 w-4 mr-3" />
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Export CSV option */}
                        <button
                            onClick={() => handleExportReport('csv')}
                            disabled={!reportData || isGenerating}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <FiDownload className="h-4 w-4 mr-3" />
                            Export CSV
                        </button>

                        {/* Export PDF option */}
                        <button
                            onClick={() => handleExportReport('pdf')}
                            disabled={!reportData || isGenerating}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <FiDownload className="h-4 w-4 mr-3" />
                            Export PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
