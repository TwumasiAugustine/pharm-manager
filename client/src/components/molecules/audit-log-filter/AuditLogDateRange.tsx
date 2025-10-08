import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import type { AuditLogFilters } from '../../../types/audit-log.types';

interface AuditLogDateRangeProps {
    filters: AuditLogFilters;
    onFilterChange: (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => void;
}

export const AuditLogDateRange: React.FC<AuditLogDateRangeProps> = ({
    filters,
    onFilterChange,
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                    <FiCalendar className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                    Date Range
                </h4>
                <div className="flex-1 border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                    <label
                        htmlFor="start-date-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiCalendar className="mr-2 h-4 w-4 text-green-500" />
                        Start Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            id="start-date-filter"
                            value={filters.startDate || ''}
                            onChange={(e) =>
                                onFilterChange('startDate', e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        />
                    </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label
                        htmlFor="end-date-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiCalendar className="mr-2 h-4 w-4 text-red-500" />
                        End Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            id="end-date-filter"
                            value={filters.endDate || ''}
                            onChange={(e) =>
                                onFilterChange('endDate', e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
