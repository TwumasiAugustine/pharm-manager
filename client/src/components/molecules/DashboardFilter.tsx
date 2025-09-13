import React from 'react';
import { BranchSelect } from './BranchSelect';
import type { DashboardFilters } from '../../types/dashboard.types';

interface DashboardFilterProps {
    filters: DashboardFilters;
    onFiltersChange: (filters: DashboardFilters) => void;
}

export const DashboardFilter: React.FC<DashboardFilterProps> = ({
    filters,
    onFiltersChange,
}) => {
    const handlePeriodChange = (period: DashboardFilters['period']) => {
        onFiltersChange({
            ...filters,
            period,
            startDate: undefined,
            endDate: undefined,
        });
    };

    const handleDateChange = (
        field: 'startDate' | 'endDate',
        value: string,
    ) => {
        onFiltersChange({
            ...filters,
            [field]: value,
            period: undefined,
        });
    };

    const handleBranchChange = (branchId: string) => {
        onFiltersChange({
            ...filters,
            branchId: branchId || undefined,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            period: 'month',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Period Filter */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">
                            Time Period
                        </label>
                        <div className="flex gap-2">
                            {(['day', 'week', 'month', 'year'] as const).map(
                                (period) => (
                                    <button
                                        key={period}
                                        onClick={() =>
                                            handlePeriodChange(period)
                                        }
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            filters.period === period
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {period.charAt(0).toUpperCase() +
                                            period.slice(1)}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">
                            Custom Date Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) =>
                                    handleDateChange(
                                        'startDate',
                                        e.target.value,
                                    )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) =>
                                    handleDateChange('endDate', e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="End Date"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between space-x-4">
                    {/* Branch Filter */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <div className="w-48">
                            <BranchSelect
                                value={filters.branchId || ''}
                                onChange={handleBranchChange}
                            />
                        </div>
                    </div>
                    {/* Clear Filters */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-2">Clear</label>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
            {/* Current Filter Display */}
            {(filters.startDate ||
                filters.endDate ||
                filters.period ||
                filters.branchId) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                        <span className="font-medium">Current Filter:</span>
                        {filters.period && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                {filters.period.charAt(0).toUpperCase() +
                                    filters.period.slice(1)}
                            </span>
                        )}
                        {filters.startDate && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                                From: {filters.startDate}
                            </span>
                        )}
                        {filters.endDate && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                                To: {filters.endDate}
                            </span>
                        )}
                        {filters.branchId && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                                Branch Selected
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
