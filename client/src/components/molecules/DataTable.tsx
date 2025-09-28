import React from 'react';
import { Button } from '../atoms/Button';
import { FaChevronLeft, FaChevronRight} from 'react-icons/fa';

export interface DataTableColumn<T = Record<string, unknown>> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

export interface DataTablePagination {
    current: number;
    total: number;
    onPageChange: (page: number) => void;
}

export interface DataTableProps<T = Record<string, unknown>> {
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;
    pagination?: DataTablePagination;
    className?: string;
    emptyMessage?: string;
}

export function DataTable<T = Record<string, unknown>>({
    data,
    columns,
    loading = false,
    pagination,
    className = '',
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column, i) => (
                                    <th
                                        key={i}
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                            column.className || ''
                                        }`}
                                    >
                                        <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from({ length: 5 }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                            <div className="flex items-center space-x-2">
                                <div className="h-8 bg-gray-200 animate-pulse rounded w-8"></div>
                                <div className="h-8 bg-gray-200 animate-pulse rounded w-8"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow ${className}`}>
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column.className || ''
                                    }`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap ${
                                            column.className || ''
                                        }`}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String(
                                                  (
                                                      item as Record<
                                                          string,
                                                          unknown
                                                      >
                                                  )[column.key] || '',
                                              )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.total > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {pagination.current} of {pagination.total}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="secondary"
                                disabled={pagination.current === 1}
                                onClick={() =>
                                    pagination.onPageChange(
                                        pagination.current - 1,
                                    )
                                }
                            >
                                <FaChevronLeft />
                            </Button>
                            <Button
                                variant="secondary"
                                disabled={
                                    pagination.current === pagination.total
                                }
                                onClick={() =>
                                    pagination.onPageChange(
                                        pagination.current + 1,
                                    )
                                }
                            >
                                <FaChevronRight />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
