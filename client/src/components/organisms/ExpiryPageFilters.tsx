import React from 'react';
import { FiX } from 'react-icons/fi';
import { ExpiryFilter } from '../molecules/ExpiryFilter';
import type { ExpiryFilters } from '../../types/expiry.types';

interface ExpiryPageFiltersProps {
    showFilters: boolean;
    filters: ExpiryFilters;
    onFiltersChange: (filters: ExpiryFilters) => void;
    onCloseFilters: () => void;
    filterDropdownRef: React.RefObject<HTMLDivElement>;
}

export const ExpiryPageFilters: React.FC<ExpiryPageFiltersProps> = ({
    showFilters,
    filters,
    onFiltersChange,
    onCloseFilters,
    filterDropdownRef,
}) => {
    return (
        <>
            {/* Desktop Filter Dropdown */}
            {showFilters && (
                <div
                    className="hidden sm:block absolute top-full right-4 lg:right-6 xl:right-8 mt-2 w-80 lg:w-[420px] xl:w-[480px] bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-[65vh] overflow-hidden"
                    ref={filterDropdownRef}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                                    Filter Options
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Customize your expiry drug view
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseFilters}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-white/50 transition-colors"
                                aria-label="Close filters"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
                            <ExpiryFilter
                                filters={filters}
                                onFiltersChange={onFiltersChange}
                                className="shadow-none border-none p-0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Filter Panel */}
            {showFilters && (
                <div
                    className="sm:hidden fixed inset-x-0 top-32 mx-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
                    data-filter-panel
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Filter Options
                            </h3>
                            <button
                                type="button"
                                onClick={onCloseFilters}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                                aria-label="Close filters"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>
                        <ExpiryFilter
                            filters={filters}
                            onFiltersChange={onFiltersChange}
                            className=""
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpiryPageFilters;
