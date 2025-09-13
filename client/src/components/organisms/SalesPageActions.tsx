import React from 'react';
import {
    FiMoreVertical,
    FiFilter,
    FiRefreshCw,
    FiPlus,
    FiLayers,
    FiDownload,
} from 'react-icons/fi';
import { UserRole, type User } from '../../types/auth.types';

interface SalesPageActionsProps {
    user: User | null;
    showActionsDropdown: boolean;
    onToggleActionsDropdown: () => void;
    onToggleFilters: () => void;
    onRefresh?: () => void;
    onToggleGrouping: () => void;
    onCreateSale: () => void;
    onExport?: () => void;
    isLoading?: boolean;
    isExporting?: boolean;
    isGrouped: boolean;
    actionsDropdownRef: React.RefObject<HTMLDivElement>;
}

export const SalesPageActions: React.FC<SalesPageActionsProps> = ({
    user,
    showActionsDropdown,
    onToggleActionsDropdown,
    onToggleFilters,
    onRefresh,
    onToggleGrouping,
    onCreateSale,
    onExport,
    isLoading = false,
    isExporting = false,
    isGrouped,
    actionsDropdownRef,
}) => {
    return (
        <>
            {/* Dropdown for md and below */}
            <div className="lg:hidden relative" ref={actionsDropdownRef}>
                <button
                    onClick={onToggleActionsDropdown}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Actions menu"
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
                                    onToggleFilters();
                                    onToggleActionsDropdown();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <FiFilter className="h-4 w-4 mr-3" />
                                Filters
                            </button>

                            {/* Refresh option */}
                            {onRefresh && (
                                <button
                                    onClick={() => {
                                        onRefresh();
                                        onToggleActionsDropdown();
                                    }}
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
                            )}

                            {/* Toggle Grouping option */}
                            <button
                                onClick={() => {
                                    onToggleGrouping();
                                    onToggleActionsDropdown();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <FiLayers className="h-4 w-4 mr-3" />
                                {isGrouped
                                    ? 'Show Individual Sales'
                                    : 'Group by Date'}
                            </button>

                            {/* Export option */}
                            {onExport && (
                                <button
                                    onClick={() => {
                                        onExport();
                                        onToggleActionsDropdown();
                                    }}
                                    disabled={isExporting}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <FiDownload
                                        className={`h-4 w-4 mr-3 ${
                                            isExporting ? 'animate-spin' : ''
                                        }`}
                                    />
                                    Export
                                </button>
                            )}

                            {/* Create Sale option */}
                            <button
                                onClick={() => {
                                    onCreateSale();
                                    onToggleActionsDropdown();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors border-t border-gray-200"
                            >
                                <FiPlus className="h-4 w-4 mr-3" />
                                Create New Sale
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop view - individual buttons (large screens and above) */}
            <div className="hidden lg:flex gap-3">
                <button
                    onClick={onToggleFilters}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle Filters"
                    title="Toggle Filters"
                >
                    <FiFilter className="h-5 w-5" />
                </button>

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Refresh"
                        title="Refresh Data"
                    >
                        <FiRefreshCw
                            className={`h-5 w-5 ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />
                    </button>
                )}

                <button
                    onClick={onToggleGrouping}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={
                        isGrouped ? 'Show Individual Sales' : 'Group by Date'
                    }
                    title={
                        isGrouped ? 'Show Individual Sales' : 'Group by Date'
                    }
                >
                    <FiLayers className="h-5 w-5" />
                </button>

                {onExport && (
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Export"
                        title="Export Data"
                    >
                        <FiDownload
                            className={`h-5 w-5 ${
                                isExporting ? 'animate-spin' : ''
                            }`}
                        />
                    </button>
                )}

                <button
                    onClick={onCreateSale}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Create New Sale"
                    title="Create New Sale"
                >
                    <FiPlus className="h-5 w-5 mr-2" />
                    <span className="hidden xl:inline">Create New Sale</span>
                    <span className="xl:hidden">Create</span>
                </button>
            </div>
        </>
    );
};

export default SalesPageActions;
