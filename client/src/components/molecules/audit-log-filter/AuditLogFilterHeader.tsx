import React from 'react';
import {
    FiFilter,
    FiRefreshCw,
    FiTrash2,
    FiChevronUp,
    FiChevronDown,
} from 'react-icons/fi';

interface AuditLogFilterHeaderProps {
    hasActiveFilters: boolean;
    activeFilterCount: number;
    isLoading: boolean;
    isCollapsible: boolean;
    isExpanded: boolean;
    onRefresh: () => void;
    onCleanup?: () => void;
    onToggleExpand: () => void;
}

export const AuditLogFilterHeader: React.FC<AuditLogFilterHeaderProps> = ({
    hasActiveFilters,
    activeFilterCount,
    isLoading,
    isCollapsible,
    isExpanded,
    onRefresh,
    onCleanup,
    onToggleExpand,
}) => {
    return (
        <div
            className={`p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ${
                isCollapsible
                    ? 'cursor-pointer hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100'
                    : ''
            }`}
            onClick={isCollapsible ? onToggleExpand : undefined}
        >
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiFilter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Audit Log Filters
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                                Filter and search audit activities
                            </p>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                {activeFilterCount} active
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between lg:justify-end space-x-2">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRefresh();
                            }}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
                            title="Refresh audit logs"
                        >
                            <FiRefreshCw
                                className={`h-4 w-4 ${
                                    isLoading ? 'animate-spin' : ''
                                } sm:mr-2`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        {onCleanup && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCleanup();
                                }}
                                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-red-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105"
                                title="Cleanup old audit logs"
                            >
                                <FiTrash2 className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Cleanup</span>
                            </button>
                        )}
                    </div>
                    {isCollapsible && (
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            {isExpanded ? (
                                <FiChevronUp className="h-4 w-4" />
                            ) : (
                                <FiChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
