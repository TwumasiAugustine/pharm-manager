import React from 'react';
import type { ExpiryFilters } from '../../types/expiry.types';
import { BranchSelect } from './BranchSelect';
import { Badge } from '../atoms/Badge';

interface ExpiryFilterProps {
    filters: ExpiryFilters;
    onFiltersChange: (filters: ExpiryFilters) => void;
    className?: string;
}

export const ExpiryFilter: React.FC<ExpiryFilterProps> = ({
    filters,
    onFiltersChange,
    className = '',
}) => {
    const handleDaysRangeChange = (daysRange: number) => {
        onFiltersChange({
            ...filters,
            daysRange,
        });
    };

    const handleAlertLevelChange = (
        alertLevel: ExpiryFilters['alertLevel'],
    ) => {
        onFiltersChange({
            ...filters,
            alertLevel:
                alertLevel === filters.alertLevel ? undefined : alertLevel,
        });
    };

    const handleCategoryChange = (category: string) => {
        onFiltersChange({
            ...filters,
            category: category.trim() || undefined,
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
            daysRange: 90,
        });
    };

    const alertLevels = [
        { value: 'expired', label: 'Expired', color: 'red' },
        { value: 'critical', label: 'Critical', color: 'orange' },
        { value: 'warning', label: 'Warning', color: 'yellow' },
        { value: 'notice', label: 'Notice', color: 'blue' },
    ] as const;

    const daysRanges = [
        { value: 7, label: '7 Days' },
        { value: 30, label: '30 Days' },
        { value: 60, label: '60 Days' },
        { value: 90, label: '90 Days' },
        { value: 180, label: '6 Months' },
    ];

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border p-4 sm:p-6 ${className}`}
        >
            {/* Large Screen Optimized Layout */}
            <div className="hidden lg:block">
                <div className="space-y-4">
                    {/* Days Range Filter */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Days Range
                        </label>
                        <div className="grid grid-cols-3 xl:grid-cols-5 gap-1.5">
                            {daysRanges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() =>
                                        handleDaysRangeChange(range.value)
                                    }
                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 border ${
                                        filters.daysRange === range.value
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alert Level Filter */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Alert Level
                        </label>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-1.5">
                            {alertLevels.map((level) => (
                                <button
                                    key={level.value}
                                    onClick={() =>
                                        handleAlertLevelChange(level.value)
                                    }
                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 border ${
                                        filters.alertLevel === level.value
                                            ? `bg-${level.color}-600 text-white border-${level.color}-600 shadow-sm`
                                            : `bg-${level.color}-50 text-${level.color}-700 border-${level.color}-200 hover:border-${level.color}-400 hover:bg-${level.color}-100`
                                    }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Category
                        </label>
                        <input
                            type="text"
                            value={filters.category || ''}
                            onChange={(e) =>
                                handleCategoryChange(e.target.value)
                            }
                            placeholder="Enter category name..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                        />
                    </div>

                    {/* Branch Filter */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Branch
                        </label>
                        <BranchSelect
                            value={filters.branchId || ''}
                            onChange={handleBranchChange}
                        />
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300"
                        >
                            Clear All Filters
                        </button>

                        {/* Current Filters Count */}
                        {(filters.alertLevel ||
                            filters.category ||
                            filters.branchId ||
                            filters.daysRange !== 90) && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-600">
                                    Active:
                                </span>
                                <div className="flex gap-1">
                                    {filters.daysRange !== 90 && (
                                        <Badge variant="primary" size="sm">
                                            {filters.daysRange}d
                                        </Badge>
                                    )}
                                    {filters.alertLevel && (
                                        <Badge
                                            variant={
                                                filters.alertLevel === 'expired'
                                                    ? 'danger'
                                                    : filters.alertLevel ===
                                                      'critical'
                                                    ? 'warning'
                                                    : filters.alertLevel ===
                                                      'warning'
                                                    ? 'warning'
                                                    : 'primary'
                                            }
                                            size="sm"
                                        >
                                            {filters.alertLevel}
                                        </Badge>
                                    )}
                                    {filters.category && (
                                        <Badge variant="success" size="sm">
                                            {filters.category}
                                        </Badge>
                                    )}
                                    {filters.branchId && (
                                        <Badge variant="info" size="sm">
                                            branch
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Small/Medium Screen Layout (Original) */}
            <div className="block lg:hidden">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col gap-4 w-full xl:flex-row xl:w-auto">
                        {/* Days Range Filter */}
                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Days Range
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                                {daysRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() =>
                                            handleDaysRangeChange(range.value)
                                        }
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors w-full ${
                                            filters.daysRange === range.value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alert Level Filter */}
                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Alert Level
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
                                {alertLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() =>
                                            handleAlertLevelChange(level.value)
                                        }
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors w-full ${
                                            filters.alertLevel === level.value
                                                ? `bg-${level.color}-600 text-white`
                                                : `bg-${level.color}-100 text-${level.color}-700 hover:bg-${level.color}-200`
                                        }`}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={filters.category || ''}
                                onChange={(e) =>
                                    handleCategoryChange(e.target.value)
                                }
                                placeholder="Filter by category..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Branch Filter */}
                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Branch
                            </label>
                            <BranchSelect
                                value={filters.branchId || ''}
                                onChange={handleBranchChange}
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="w-full xl:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Current Filters Display */}
                {(filters.alertLevel ||
                    filters.category ||
                    filters.branchId ||
                    filters.daysRange !== 90) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Active Filters:</span>
                            {filters.daysRange !== 90 && (
                                <Badge variant="primary" size="sm">
                                    {filters.daysRange} days
                                </Badge>
                            )}
                            {filters.alertLevel && (
                                <Badge
                                    variant={
                                        filters.alertLevel === 'expired'
                                            ? 'danger'
                                            : filters.alertLevel === 'critical'
                                            ? 'warning'
                                            : filters.alertLevel === 'warning'
                                            ? 'warning'
                                            : 'primary'
                                    }
                                    size="sm"
                                >
                                    {filters.alertLevel}
                                </Badge>
                            )}
                            {filters.category && (
                                <Badge variant="success" size="sm">
                                    Category: {filters.category}
                                </Badge>
                            )}
                            {filters.branchId && (
                                <Badge variant="info" size="sm">
                                    Branch
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
