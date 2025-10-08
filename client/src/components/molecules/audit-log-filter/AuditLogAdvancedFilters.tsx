import React from 'react';
import {
    FiSearch,
    FiUser,
    FiHome,
    FiSettings,
    FiChevronUp,
    FiChevronDown,
} from 'react-icons/fi';
import type { AuditLogFilters } from '../../../types/audit-log.types';

interface AuditLogAdvancedFiltersProps {
    filters: AuditLogFilters;
    showAdvanced: boolean;
    onToggleAdvanced: () => void;
    onFilterChange: (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => void;
}

export const AuditLogAdvancedFilters: React.FC<
    AuditLogAdvancedFiltersProps
> = ({ filters, showAdvanced, onToggleAdvanced, onFilterChange }) => {
    return (
        <div className="space-y-4">
            <button
                onClick={onToggleAdvanced}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-gray-700 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
            >
                <FiSettings className="mr-2 h-4 w-4" />
                Advanced Filters
                {showAdvanced ? (
                    <FiChevronUp className="ml-2 h-4 w-4" />
                ) : (
                    <FiChevronDown className="ml-2 h-4 w-4" />
                )}
            </button>

            {/* Advanced Filters Section */}
            {showAdvanced && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <FiSearch className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-gray-800">
                            Advanced Search
                        </h4>
                        <div className="flex-1 border-t border-indigo-200"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                        {/* User ID Search */}
                        <div className="space-y-2">
                            <label
                                htmlFor="user-id-filter"
                                className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                            >
                                <FiUser className="mr-2 h-4 w-4 text-blue-500" />
                                User ID
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="user-id-filter"
                                    placeholder="Search by user ID..."
                                    value={filters.userId || ''}
                                    onChange={(e) =>
                                        onFilterChange('userId', e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-10 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Pharmacy ID Search */}
                        <div className="space-y-2">
                            <label
                                htmlFor="pharmacy-id-filter"
                                className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                            >
                                <FiHome className="mr-2 h-4 w-4 text-green-500" />
                                Pharmacy
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="pharmacy-id-filter"
                                    placeholder="Search by pharmacy..."
                                    value={filters.pharmacyId || ''}
                                    onChange={(e) =>
                                        onFilterChange(
                                            'pharmacyId',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-10 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                />
                                <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
