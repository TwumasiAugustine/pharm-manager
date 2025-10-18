import React from 'react';
import type { AuditLogFilters } from '../../../types/audit-log.types';

interface QuickFilter {
    label: string;
    icon: React.ReactNode;
    filters: Partial<AuditLogFilters>;
}

interface AuditLogQuickFiltersProps {
    quickFilters: QuickFilter[];
    onApplyFilter: (filters: Partial<AuditLogFilters>) => void;
}

export const AuditLogQuickFilters: React.FC<AuditLogQuickFiltersProps> = ({
    quickFilters,
    onApplyFilter,
}) => {
    return (
        <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Filters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {quickFilters.map((quickFilter) => (
                    <button
                        key={quickFilter.label}
                        onClick={() => onApplyFilter(quickFilter.filters)}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md group"
                    >
                        <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                            {quickFilter.icon}
                        </span>
                        <span className="truncate">{quickFilter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
