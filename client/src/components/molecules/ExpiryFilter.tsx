import React from 'react';
import type { ExpiryFilters } from '../../types/expiry.types';

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
        <div className={`space-y-4 ${className}`}>
            {/* Days Range Filter */}
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Days Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {daysRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => handleDaysRangeChange(range.value)}
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
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Alert Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {alertLevels.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => handleAlertLevelChange(level.value)}
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
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                </label>
                <input
                    type="text"
                    value={filters.category || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    placeholder="Filter by category..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
            </div>

            {/* Clear Filters */}
            <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
                Clear Filters
            </button>

            {/* Current Filters Display */}
            {(filters.alertLevel ||
                filters.category ||
                filters.daysRange !== 90) && (
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Active Filters:</span>
                        {filters.daysRange !== 90 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                {filters.daysRange} days
                            </span>
                        )}
                        {filters.alertLevel && (
                            <span
                                className={`px-2 py-1 rounded-md ${
                                    filters.alertLevel === 'expired'
                                        ? 'bg-red-100 text-red-800'
                                        : filters.alertLevel === 'critical'
                                        ? 'bg-orange-100 text-orange-800'
                                        : filters.alertLevel === 'warning'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {filters.alertLevel}
                            </span>
                        )}
                        {filters.category && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                                Category: {filters.category}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
