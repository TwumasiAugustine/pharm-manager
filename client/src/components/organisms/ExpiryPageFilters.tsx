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
                    className="hidden sm:block absolute top-full right-0 mt-2 w-80 lg:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto"
                    ref={filterDropdownRef}
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
