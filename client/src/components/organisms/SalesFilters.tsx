import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { Input } from '../atoms/Input';
import type { SaleSearchParams } from '../../types/sale.types';

interface SalesFiltersProps {
    filters: SaleSearchParams;
    onFilterChange: (
        key: keyof SaleSearchParams,
        value: string | number | boolean,
    ) => void;
    onApply: () => void;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
    filters,
    onFilterChange,
    onApply,
}) => {
    return (
        <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
                Filter Sales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) =>
                                onFilterChange('startDate', e.target.value)
                            }
                            className="pl-10 w-full"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) =>
                                onFilterChange('endDate', e.target.value)
                            }
                            className="pl-10 w-full"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                    </label>
                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            onFilterChange('sortBy', sortBy);
                            onFilterChange('sortOrder', sortOrder);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        aria-label="Sort sales by"
                    >
                        <option value="date-desc">Date (Newest First)</option>
                        <option value="date-asc">Date (Oldest First)</option>
                        <option value="total-desc">Amount (High to Low)</option>
                        <option value="total-asc">Amount (Low to High)</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={onApply}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};
