import React from 'react';

/**
 * Table column definition
 */
export interface TableColumn<T> {
    header: string;
    accessor: keyof T | ((data: T) => React.ReactNode);
    cell?: (value: unknown) => React.ReactNode;
    className?: string;
}

/**
 * Action definition for Table
 */
export interface TableAction<T> {
    label: string;
    onClick: (item: T) => void;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Props for Table component
 */
interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
}

/**
 * Reusable table component for displaying data in a structured format
 */
export function Table<T extends { id?: string | number }>({
    data,
    columns,
    actions,
    isLoading = false,
    onRowClick,
    emptyMessage = 'No data available',
    className = '',
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="overflow-x-auto animate-pulse">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column.className || ''
                                    }`}
                                >
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...Array(5)].map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((_, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap"
                                    >
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </td>
                                ))}
                                {actions && actions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex justify-center items-center py-10 border rounded-lg">
                <div className="text-gray-500">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    column.className || ''
                                }`}
                            >
                                {column.header}
                            </th>
                        ))}
                        {actions && actions.length > 0 && (
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, rowIndex) => (
                        <tr
                            key={item.id || rowIndex}
                            onClick={
                                onRowClick ? () => onRowClick(item) : undefined
                            }
                            className={
                                onRowClick
                                    ? 'cursor-pointer hover:bg-gray-50'
                                    : ''
                            }
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                                        column.className || ''
                                    }`}
                                >
                                    {typeof column.accessor === 'function'
                                        ? column.accessor(item)
                                        : column.cell
                                        ? column.cell(
                                              item[column.accessor] as unknown,
                                              item,
                                          )
                                        : (item[
                                              column.accessor
                                          ] as React.ReactNode)}
                                </td>
                            ))}
                            {actions && actions.length > 0 && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex justify-end space-x-2">
                                        {actions.map((action, actionIndex) => (
                                            <button
                                                key={actionIndex}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    action.onClick(item);
                                                }}
                                                className={`px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 ${
                                                    action.className || ''
                                                }`}
                                            >
                                                {action.icon && (
                                                    <span className="mr-1">
                                                        {action.icon}
                                                    </span>
                                                )}
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
