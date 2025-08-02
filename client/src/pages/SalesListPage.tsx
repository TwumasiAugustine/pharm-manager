import React, { useState, useRef, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import {
    FaEye,
    FaCalendarAlt,
    FaFilter,
    FaEllipsisV,
    FaLayerGroup,
    FaPlus,
} from 'react-icons/fa';
import { Table } from '../components/molecules/Table';
import type { TableColumn, TableAction } from '../components/molecules/Table';
import DashboardLayout from '../layouts/DashboardLayout';
import { format, parseISO, subDays } from 'date-fns';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '../components/molecules/Alert';
import { getErrorMessage } from '../utils/error';
import { Pagination } from '../components/molecules/Pagination';
import type {
    GroupedSales,
    Sale,
    SaleSearchParams,
    SaleItem,
} from '../types/sale.types';
import { Input } from '../components/atoms/Input';

const SalesListPage: React.FC = () => {
    // Pagination and filter state
    const [page, setPage] = useState(1);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<SaleSearchParams>({
        page: 1,
        limit: 10, // Ensure this is a number, not a string
        groupByDate: true,
        sortBy: 'date',
        sortOrder: 'desc',
        // Default to last 30 days
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const { data, isLoading, error } = useSales(filters);

    // Debug log to check data structure
    React.useEffect(() => {
        if (data === undefined) {
            console.error('No data received from sales API.');
            return;
        }
        if (!data || !('data' in data) || !Array.isArray(data.data)) {
            console.error('SalesListPage: Invalid or missing data:', data);
            return;
        }
        console.log('SalesListPage received data:', data);
        console.log(`Data contains ${data.data.length} sales items`);
        if (error) {
            console.error('Error fetching sales:', error);
        }
    }, [data, error]);

    // Handle filter changes
    const handleFilterChange = (
        key: keyof SaleSearchParams,
        value: string | number | boolean,
    ) => {
        // Ensure numeric values are properly typed
        if (key === 'limit' || key === 'page') {
            value = parseInt(String(value), 10);
        }
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    // Apply filters
    const applyFilters = () => {
        // Update filters state with current page
        setFilters((prev) => ({ ...prev, page }));
    };

    // Close dropdown when clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setFilters((prev) => ({
            ...prev,
            page: newPage,
            limit:
                typeof prev.limit === 'string'
                    ? parseInt(prev.limit, 10)
                    : prev.limit,
        }));
    };

    // Handle toggle between grouped and ungrouped view
    const toggleGrouping = () => {
        setFilters((prev) => ({
            ...prev,
            groupByDate: !prev.groupByDate,
            page: 1, // Reset to first page when changing view type
        }));
        setPage(1); // Also reset the page state
    };

    // Grouped sales columns
    const groupedColumns: TableColumn<GroupedSales>[] = [
        {
            header: 'Date',
            accessor: (group) => format(parseISO(group.date), 'PPP'),
            className: 'font-semibold',
        },
        {
            header: 'Sales Count',
            accessor: (group) => group.saleCount,
            className: 'text-center',
        },
        {
            header: 'Items Sold',
            accessor: (group) => group.totalItems,
            className: 'text-center',
        },
        {
            header: 'Total Amount',
            accessor: (group) => `$${group.totalAmount.toFixed(2)}`,
            className: 'text-right font-bold',
        },
    ];

    // Actions for grouped sales
    const groupedActions: TableAction<GroupedSales>[] = [
        {
            label: 'View Details',
            onClick: (group) =>
                setExpandedDate(
                    group.date === expandedDate ? null : group.date,
                ),
            icon: <FaEye className="h-4 w-4" />,
        },
    ];

    // Individual sale columns (for expanded view)
    const saleColumns: TableColumn<Sale>[] = [
        {
            header: 'Sale ID',
            accessor: (sale) => sale._id,
            className: 'font-mono text-xs',
        },
        {
            header: 'Date',
            accessor: (sale) => {
                try {
                    // Format as full date instead of just time
                    return format(new Date(sale.createdAt), 'PPP');
                } catch (e) {
                    const message =
                        e && typeof e === 'object' && 'message' in e
                            ? (e as { message: string }).message
                            : String(e);
                    console.error(
                        'Error formatting date:',
                        sale.createdAt,
                        message,
                    );
                    return 'Invalid date';
                }
            },
        },
        {
            header: 'Sold By',
            accessor: (sale) => {
                if (typeof sale.soldBy === 'object' && sale.soldBy) {
                    return sale.soldBy.name || 'Unknown';
                }
                return 'Unknown';
            },
        },
        {
            header: 'Items Sold',
            accessor: (sale) => {
                if (!sale.items || !Array.isArray(sale.items))
                    return 'No items';
                return sale.items
                    .map((item: SaleItem) => item.name || 'Unknown Item')
                    .join(', ');
            },
        },
        {
            header: 'Total Amount',
            accessor: (sale) => {
                const amount =
                    typeof sale.totalAmount === 'number' ? sale.totalAmount : 0;
                return `$${amount.toFixed(2)}`;
            },
            className: 'text-right',
        },
    ];

    const saleActions: TableAction<Sale>[] = [
        {
            label: 'View',
            onClick: (sale) => navigate(`/sales/${sale._id}`),
            icon: <FaEye className="h-4 w-4" />,
        },
    ];

    // Track which date group is expanded
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Extract the ungrouped sales data
    const salesData = React.useMemo(() => {
        if (!data || !data.data) {
            console.log('No data for ungrouped sales');
            return [];
        }

        try {
            // Transform the sales data if needed
            if (Array.isArray(data.data)) {
                console.log(
                    `Preparing ${data.data.length} individual sales records`,
                );
                return data.data as Sale[];
            }
        } catch (err) {
            console.error('Error processing individual sales data:', err);
        }

        return [];
    }, [data]);

    // Extract the grouped sales data
    const groupedSalesData = React.useMemo(() => {
        if (!data) {
            console.log('No data received in useMemo');
            return [];
        }

        if (!data.data) {
            console.log('data.data is undefined or null');
            return [];
        }

        // Check if data.data is an array
        if (!Array.isArray(data.data)) {
            console.error('data.data is not an array:', data.data);
            return [];
        }

        try {
            // Check if the data is already in grouped format
            const isGroupedData =
                data.data.length > 0 &&
                'sales' in data.data[0] &&
                'totalAmount' in data.data[0] &&
                'saleCount' in data.data[0];

            if (isGroupedData) {
                console.log('Data is already in grouped format');
                // Make sure each group has an id for the Table component
                return (data.data as GroupedSales[]).map((group) => ({
                    ...group,
                    id: group.date, // Use date as the id since it's unique in grouped data
                }));
            }
            // If data is individual sales and we need to group them manually
            else if (data.data.length > 0) {
                console.log('Grouping individual sales by date');
                const salesByDate: Record<string, GroupedSales> = {};

                // Group sales by date
                (data.data as Sale[]).forEach((sale) => {
                    // Use date from sale or extract from createdAt
                    const date =
                        sale.date ||
                        (sale.createdAt
                            ? new Date(sale.createdAt)
                                  .toISOString()
                                  .split('T')[0]
                            : new Date().toISOString().split('T')[0]);

                    if (!salesByDate[date]) {
                        salesByDate[date] = {
                            id: date,
                            date,
                            sales: [],
                            totalAmount: 0,
                            totalItems: 0,
                            saleCount: 0,
                        };
                    }

                    salesByDate[date].sales.push(sale);
                    salesByDate[date].totalAmount +=
                        Number(sale.totalAmount) || 0;
                    salesByDate[date].totalItems += Array.isArray(sale.items)
                        ? sale.items.length
                        : 0;
                    salesByDate[date].saleCount += 1;
                });

                // Convert to array and sort by date
                return Object.values(salesByDate).sort((a, b) =>
                    filters.sortOrder === 'desc'
                        ? new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                        : new Date(a.date).getTime() -
                          new Date(b.date).getTime(),
                );
            }

            console.log('No sales data to display');
            return [];
        } catch (err) {
            console.error('Error processing sales data:', err);
            return [];
        }
    }, [data, filters.sortOrder]);

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Sales History</h2>

                    {/* Desktop view - regular buttons */}
                    <div className="hidden md:flex space-x-2">
                        <Button
                            variant="secondary"
                            onClick={toggleGrouping}
                            className="flex items-center"
                        >
                            {filters.groupByDate
                                ? 'Show Individual Sales'
                                : 'Group by Date'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center"
                        >
                            <FaFilter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Link to="/sales/new">
                            <Button>Create New Sale</Button>
                        </Link>
                    </div>

                    {/* Mobile view - dropdown menu */}
                    <div className="relative md:hidden" ref={dropdownRef}>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowActionsDropdown(!showActionsDropdown)
                            }
                            className="flex items-center"
                            aria-label="Actions menu"
                        >
                            <span className="mr-2">Actions</span>
                            <FaEllipsisV className="h-4 w-4" />
                        </Button>

                        {showActionsDropdown && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div
                                    className="py-1"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="options-menu"
                                >
                                    <button
                                        onClick={() => {
                                            toggleGrouping();
                                            setShowActionsDropdown(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        <FaLayerGroup className="mr-3 h-4 w-4" />
                                        {filters.groupByDate
                                            ? 'Show Individual Sales'
                                            : 'Group by Date'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowFilters(!showFilters);
                                            setShowActionsDropdown(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        <FaFilter className="mr-3 h-4 w-4" />
                                        Filters
                                    </button>
                                    <Link
                                        to="/sales/new"
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        onClick={() =>
                                            setShowActionsDropdown(false)
                                        }
                                    >
                                        <FaPlus className="mr-3 h-4 w-4" />
                                        Create New Sale
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter controls */}
                {showFilters && (
                    <div className="mb-6 p-4 border rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium mb-4">
                            Filter Sales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={filters.startDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'startDate',
                                                e.target.value,
                                            )
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={filters.endDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'endDate',
                                                e.target.value,
                                            )
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={`${filters.sortBy}-${filters.sortOrder}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] =
                                            e.target.value.split('-');
                                        handleFilterChange('sortBy', sortBy);
                                        handleFilterChange(
                                            'sortOrder',
                                            sortOrder,
                                        );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="Sort sales by"
                                >
                                    <option value="date-desc">
                                        Date (Newest First)
                                    </option>
                                    <option value="date-asc">
                                        Date (Oldest First)
                                    </option>
                                    <option value="total-desc">
                                        Amount (High to Low)
                                    </option>
                                    <option value="total-asc">
                                        Amount (Low to High)
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Conditionally show either grouped or individual sales */}
                {filters.groupByDate ? (
                    <>
                        {/* Grouped sales table */}
                        <Table
                            columns={groupedColumns}
                            data={groupedSalesData}
                            actions={groupedActions}
                            isLoading={isLoading}
                            emptyMessage={`No sales recorded yet. ${
                                data?.data
                                    ? `Raw data has ${data.data.length} items`
                                    : ''
                            }`}
                        />

                        {/* Expanded details for a specific date */}
                        {expandedDate && (
                            <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50">
                                <h3 className="text-lg font-medium mb-4">
                                    Sales Details for{' '}
                                    {format(parseISO(expandedDate), 'PPP')}
                                </h3>
                                {groupedSalesData.find(
                                    (group) => group.date === expandedDate,
                                )?.sales && (
                                    <Table
                                        columns={saleColumns}
                                        data={
                                            groupedSalesData.find(
                                                (group) =>
                                                    group.date === expandedDate,
                                            )!.sales
                                        }
                                        actions={saleActions}
                                        isLoading={false}
                                        emptyMessage="No sales for this date."
                                    />
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Individual sales table (ungrouped) */}
                        <Table
                            columns={saleColumns}
                            data={salesData}
                            actions={saleActions}
                            isLoading={isLoading}
                            emptyMessage="No individual sales found."
                        />
                    </>
                )}

                {/* Pagination for both view modes */}
                {data && data.pagination && data.pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={data.pagination.page}
                            totalPages={data.pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SalesListPage;
