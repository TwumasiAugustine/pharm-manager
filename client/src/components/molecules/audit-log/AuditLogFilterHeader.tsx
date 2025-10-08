import React from 'react';
import {
    FiFilter,
    FiRefreshCw,
    FiTrash2,
    FiChevronDown,
    FiChevronUp,
} from 'react-icons/fi';

interface AuditLogFilterHeaderProps {
    activeFilterCount: number;
    hasActiveFilters: boolean;
    isExpanded: boolean;
    isCollapsible: boolean;
    isLoading: boolean;
    onToggleExpand?: () => void;
    onRefresh: () => void;
    onClearFilters: () => void;
    onCleanup?: () => void;
}

export const AuditLogFilterHeader: React.FC<AuditLogFilterHeaderProps> = ({
    activeFilterCount,
    hasActiveFilters,
    isExpanded,
    isCollapsible,
    isLoading,
    onToggleExpand,
    onRefresh,
    onClearFilters,
    onCleanup,
}) => {
    return (
        <div
            className={`p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ${
                isCollapsible
                    ? 'cursor-pointer hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100'
                    : ''
            }`}
            onClick={
                isCollapsible && onToggleExpand ? onToggleExpand : undefined
            }
        >
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <FiFilter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <span>Filter Audit Logs</span>
                            {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Narrow down audit logs by various criteria
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClearFilters();
                            }}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
                        >
                            <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                                Clear Filters
                            </span>
                            <span className="sm:hidden">Clear</span>
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRefresh();
                        }}
                        disabled={isLoading}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                        <FiRefreshCw
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    {onCleanup && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCleanup();
                            }}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
                        >
                            <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Cleanup</span>
                        </button>
                    )}

                    {isCollapsible && (
                        <button
                            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand?.();
                            }}
                        >
                            {isExpanded ? (
                                <FiChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                                <FiChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
