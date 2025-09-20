import React from 'react';
import {
    FiCalendar,
    FiFilter,
    FiGrid,
    FiPackage,
    FiAlertTriangle,
} from 'react-icons/fi';
import type { ReportFilters } from '../../types/report.types';

interface ReportFilterProps {
    filters: ReportFilters;
    onFiltersChange: (filters: ReportFilters) => void;
    className?: string;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
    filters,
    onFiltersChange,
    className = '',
}) => {
    const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
        console.log(`Date range ${field} changed to:`, value);
        const newFilters = {
            ...filters,
            dateRange: {
                ...filters.dateRange,
                [field]: value,
            },
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    const handleReportTypeChange = (
        reportType: ReportFilters['reportType'],
    ) => {
        console.log('Report type changed to:', reportType);
        const newFilters = {
            ...filters,
            reportType,
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    const handleFormatChange = (format: ReportFilters['format']) => {
        console.log('Format changed to:', format);
        const newFilters = {
            ...filters,
            format,
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    const handleCategoryChange = (category: string) => {
        console.log('Category changed to:', category);
        const newFilters = {
            ...filters,
            category: category || undefined,
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    const handleSaleTypeChange = (saleType: string) => {
        console.log('Sale type changed to:', saleType);
        const newFilters = {
            ...filters,
            saleType: (saleType as ReportFilters['saleType']) || undefined,
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    const handleExpiryStatusChange = (expiryStatus: string) => {
        console.log('Expiry status changed to:', expiryStatus);
        const newFilters = {
            ...filters,
            expiryStatus:
                (expiryStatus as ReportFilters['expiryStatus']) || undefined,
        };
        console.log('Calling onFiltersChange with:', newFilters);
        onFiltersChange(newFilters);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFilter className="mr-2" />
                    Report Filters
                </h3>

                {/* Date Range */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiCalendar className="mr-2" />
                        Date Range
                    </label>
                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="start-date"
                                className="block text-xs text-gray-600 mb-1"
                            >
                                From
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                value={filters.dateRange.start}
                                onChange={(e) =>
                                    handleDateRangeChange(
                                        'start',
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="end-date"
                                className="block text-xs text-gray-600 mb-1"
                            >
                                To
                            </label>
                            <input
                                id="end-date"
                                type="date"
                                value={filters.dateRange.end}
                                onChange={(e) =>
                                    handleDateRangeChange('end', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Report Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Type
                    </label>
                    <div className="space-y-2">
                        {[
                            { value: 'sales', label: 'Sales Report' },
                            { value: 'inventory', label: 'Inventory Report' },
                            { value: 'expiry', label: 'Expiry Report' },
                            { value: 'financial', label: 'Financial Report' },
                        ].map((type) => (
                            <label
                                key={type.value}
                                className="flex items-center"
                            >
                                <input
                                    type="radio"
                                    name="reportType"
                                    value={type.value}
                                    checked={filters.reportType === type.value}
                                    onChange={() =>
                                        handleReportTypeChange(
                                            type.value as ReportFilters['reportType'],
                                        )
                                    }
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                    {type.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Display Format */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiGrid className="mr-2" />
                        Display Format
                    </label>
                    <div className="space-y-2">
                        {[
                            { value: 'table', label: 'Table View' },
                            { value: 'chart', label: 'Chart View' },
                        ].map((format) => (
                            <label
                                key={format.value}
                                className="flex items-center"
                            >
                                <input
                                    type="radio"
                                    name="format"
                                    value={format.value}
                                    checked={filters.format === format.value}
                                    onChange={() =>
                                        handleFormatChange(
                                            format.value as ReportFilters['format'],
                                        )
                                    }
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                    {format.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <label
                        htmlFor="category-select"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Category
                    </label>
                    <select
                        id="category-select"
                        value={filters.category || ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        <option value="antibiotics">Antibiotics</option>
                        <option value="painkillers">Painkillers</option>
                        <option value="vitamins">Vitamins</option>
                        <option value="supplements">Supplements</option>
                        <option value="prescription">Prescription</option>
                        <option value="otc">Over-the-counter</option>
                    </select>
                </div>

                {/* Sale Type Filter - Show only for sales reports */}
                {filters.reportType === 'sales' && (
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FiPackage className="mr-2" />
                            Sale Type
                        </label>
                        <select
                            value={filters.saleType || ''}
                            onChange={(e) =>
                                handleSaleTypeChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Types</option>
                            <option value="unit">Unit Sales</option>
                            <option value="pack">Pack Sales</option>
                            <option value="carton">Carton Sales</option>
                        </select>
                    </div>
                )}

                {/* Expiry Status Filter - Show only for expiry reports */}
                {filters.reportType === 'expiry' && (
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FiAlertTriangle className="mr-2" />
                            Expiry Status
                        </label>
                        <select
                            value={filters.expiryStatus || ''}
                            onChange={(e) =>
                                handleExpiryStatusChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="expired">Expired</option>
                            <option value="critical">Critical (≤7 days)</option>
                            <option value="warning">Warning (≤30 days)</option>
                            <option value="notice">Notice (≤60 days)</option>
                        </select>
                    </div>
                )}

                {/* Quick Date Filters */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Filters
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Today', days: 0 },
                            { label: 'Week', days: 7 },
                            { label: 'Month', days: 30 },
                            { label: 'Quarter', days: 90 },
                        ].map((quick) => (
                            <button
                                key={quick.label}
                                onClick={() => {
                                    const end = new Date()
                                        .toISOString()
                                        .split('T')[0];
                                    const start = new Date(
                                        Date.now() -
                                            quick.days * 24 * 60 * 60 * 1000,
                                    )
                                        .toISOString()
                                        .split('T')[0];
                                    onFiltersChange({
                                        ...filters,
                                        dateRange: { start, end },
                                    });
                                }}
                                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                {quick.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
