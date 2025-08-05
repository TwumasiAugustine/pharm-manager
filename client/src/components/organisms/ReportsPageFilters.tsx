import React from 'react';
import { ReportFilter } from '../molecules/ReportFilter';
import type { ReportFilters } from '../../types/report.types';

interface ReportsPageFiltersProps {
    showFilters: boolean;
    filters: ReportFilters;
    onFiltersChange: (filters: ReportFilters) => void;
}

export const ReportsPageFilters: React.FC<ReportsPageFiltersProps> = ({
    showFilters,
    filters,
    onFiltersChange,
}) => {
    return (
        <div
            className={`lg:col-span-1 ${
                showFilters ? 'block' : 'hidden lg:block'
            }`}
        >
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <ReportFilter
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    className="lg:mb-0 mb-6"
                />
            </div>
        </div>
    );
};
