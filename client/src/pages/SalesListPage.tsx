import React, { useState, useRef, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/molecules/Table';
import DashboardLayout from '../layouts/DashboardLayout';
import PermissionGuard from '../components/atoms/PermissionGuard';
import { PERMISSION_KEYS } from '../types/permission.types';
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
import { SalesHeader } from '../components/organisms/SalesHeader';
import { SalesFilters } from '../components/organisms/SalesFilters';
import { useSalesTableConfig } from '../components/organisms/useSalesTableConfig';
import { useURLFilters } from '../hooks/useURLSearch';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { DataLoadingScreen } from '../components/atoms/LoadingScreen';
import { useDataLoading } from '../hooks/useNavigationLoading';

const SalesListPage: React.FC = () => {
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showFilters, setShowFilters] = useState(false);

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.sales,
        canonicalPath: '/sales',
    });

    // URL-based filters for sales page
    const { filters, setFilter } = useURLFilters(
        {
            branchId: '',
            page: 1,
            limit: 10,
            groupByDate: true,
            sortBy: 'date' as 'date' | 'total',
            sortOrder: 'desc' as 'asc' | 'desc',
            startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
            search: '',
            userId: '',
        },
        {
            debounceMs: 300,
            onFiltersChange: (newFilters) => {
                console.log('Sales filters changed:', newFilters);
            },
        },
    );

    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useSales({
        ...filters,
        branchId: filters.branchId,
    });

    const showDataLoadingScreen = useDataLoading(isLoading, !data);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    
    const { groupedColumns, groupedActions, saleColumns, saleActions } =
        useSalesTableConfig({
            onViewDetails: (group) =>
                setExpandedDate(
                    group.date === expandedDate ? null : group.date,
                ),
        });
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
        setFilter(key, value);
    };

    // Handle branch change
    const handleBranchChange = (branchId: string) => {
        setFilter('branchId', branchId);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setFilter('page', page);
    };

    // Apply filters (mainly for manual refresh)
    const applyFilters = () => {
        refetch();
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

    const toggleGrouping = () => {
        setFilter('groupByDate', !filters.groupByDate);
        setFilter('page', 1);
    };

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

                // Process each sale to ensure all required fields are present
                return (data.data as Sale[]).map((sale) => {
                    return {
                        ...sale,
                        // Ensure items are properly structured with correct drug information
                        items: Array.isArray(sale.items)
                            ? sale.items.map(
                                  (item) =>
                                      ({
                                          ...item,
                                          // Preserve the drug object as is
                                          drug: item.drug || undefined,
                                          name:
                                              (item.drug && item.drug.name) ||
                                              item.name ||
                                              'Unknown Item',
                                          brand:
                                              (item.drug && item.drug.brand) ||
                                              item.brand ||
                                              '-',
                                          quantity: item.quantity || 0,
                                          priceAtSale: item.priceAtSale || 0,
                                      } as SaleItem),
                              )
                            : [],
                        // Ensure customer data is properly structured if present
                        customer: sale.customer
                            ? {
                                  id:
                                      sale.customer.id ||
                                      sale.customer._id ||
                                      '',
                                  _id:
                                      sale.customer._id ||
                                      sale.customer.id ||
                                      '',
                                  name:
                                      sale.customer.name || 'Unknown Customer',
                                  phone: sale.customer.phone || '',
                              }
                            : undefined,
                    };
                });
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
                    // Count the actual number of items (quantities), not just the number of different drugs
                    salesByDate[date].totalItems += Array.isArray(sale.items)
                        ? sale.items.reduce(
                              (total, item) => total + (item.quantity || 0),
                              0,
                          )
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

    const SalesListSkeleton = () => (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div className="h-8 bg-gray-200 rounded w-32 sm:w-48"></div>
                        <div className="hidden sm:flex space-x-2">
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                            <div className="h-10 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="sm:hidden h-10 bg-gray-200 rounded w-16"></div>
                    </div>

                    <div className="space-y-4">
                        <div className="hidden sm:grid sm:grid-cols-4 gap-4 pb-3 border-b">
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                        </div>

                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-3 border-b border-gray-100"
                            >
                                <div className="h-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded col-span-2 hidden sm:block"></div>
                                <div className="h-5 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                            <div className="h-10 bg-gray-200 rounded w-10"></div>
                            <div className="h-10 bg-gray-200 rounded w-10"></div>
                            <div className="h-10 bg-gray-200 rounded w-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
        );
    }

    // Show data loading screen for initial page load
    if (showDataLoadingScreen) {
        return <DataLoadingScreen />;
    }

    // Show skeleton for filter changes (when data exists but loading)
    if (isLoading && !data) {
        return <SalesListSkeleton />;
    }

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <PermissionGuard
                permission={PERMISSION_KEYS.VIEW_SALES}
                fallback={
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                You don't have permission to view sales data.
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <SalesHeader
                        branchId={filters.branchId}
                        showActionsDropdown={showActionsDropdown}
                        isLoading={isLoading}
                        isGrouped={!!filters.groupByDate}
                        actionsDropdownRef={dropdownRef}
                        onBranchChange={handleBranchChange}
                        onToggleActionsDropdown={() =>
                            setShowActionsDropdown(!showActionsDropdown)
                        }
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onRefresh={() => refetch()}
                        onToggleGrouping={toggleGrouping}
                        onCreateSale={() => navigate('/sales/new')}
                    />

                    {showFilters && (
                        <SalesFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onApply={applyFilters}
                        />
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
                                                        group.date ===
                                                        expandedDate,
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
                    {data &&
                        data.pagination &&
                        data.pagination.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={data.pagination.page}
                                    totalPages={data.pagination.totalPages}
                                    onPageChange={handlePageChange}
                                    showInfo={true}
                                    totalItems={data.pagination.total}
                                    itemsPerPage={data.pagination.limit}
                                    size="md"
                                />
                            </div>
                        )}
                </div>
            </PermissionGuard>
        </DashboardLayout>
    );
};

export default SalesListPage;
