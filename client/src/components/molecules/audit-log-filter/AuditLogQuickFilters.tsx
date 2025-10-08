import React, { useMemo } from 'react';
import {
    FiClock,
    FiCalendar,
    FiUser,
    FiSettings,
    FiCheck,
    FiX,
} from 'react-icons/fi';
import type { AuditLogFilters } from '../../../types/audit-log.types';

interface AuditLogQuickFiltersProps {
    hasActiveFilters: boolean;
    onApplyFilter: (filters: Partial<AuditLogFilters>) => void;
    onClearFilters: () => void;
}

export const AuditLogQuickFilters: React.FC<AuditLogQuickFiltersProps> = ({
    hasActiveFilters,
    onApplyFilter,
    onClearFilters,
}) => {
    const quickFilters = useMemo(
        () => [
            {
                label: 'Today',
                icon: <FiClock className="h-3 w-3" />,
                filters: {
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Last 7 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Last 30 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Login Activities',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    action: 'LOGIN' as const,
                },
            },
            {
                label: 'User Management',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    resource: 'USER' as const,
                },
            },
            {
                label: 'Sales Activities',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SALE' as const,
                },
            },
            {
                label: 'System Changes',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SYSTEM' as const,
                },
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                    <FiCheck className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                    Quick Filters
                </h4>
                <div className="flex-1 border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-2 sm:gap-3">
                {quickFilters.map((quickFilter, index) => (
                    <button
                        key={index}
                        onClick={() => onApplyFilter(quickFilter.filters)}
                        className="group relative inline-flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-blue-100 hover:to-blue-50 hover:text-blue-800 transition-all duration-200 border border-gray-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center space-x-1 sm:space-x-1.5">
                            {quickFilter.icon}
                            <span className="truncate leading-none">
                                {quickFilter.label}
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                    </button>
                ))}
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="group relative inline-flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs font-medium bg-gradient-to-r from-red-100 to-red-50 text-red-700 hover:from-red-200 hover:to-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center space-x-1 sm:space-x-1.5">
                            <FiX className="h-3 w-3" />
                            <span className="hidden sm:inline leading-none">
                                Clear All
                            </span>
                            <span className="sm:hidden leading-none">Clear</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                    </button>
                )}
            </div>
        </div>
    );
};
