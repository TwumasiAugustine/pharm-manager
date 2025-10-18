import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrugs, useDeleteDrug } from '../../hooks/useDrugs';
import { Table } from '../molecules/Table';
import type { TableColumn, TableAction } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { SearchBar } from '../molecules/SearchBar';
import { BranchSelect } from '../molecules/BranchSelect';
import { Badge } from '../atoms/Badge';
import type { Drug } from '../../types/drug.types';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/user.types';
import { useURLSearch } from '../../hooks/useURLSearch';

/**
 * DrugList component to display and manage the list of drugs.
 */

interface DrugListProps {
    branchId?: string;
    urlFilters?: {
        branchId: string;
        search: string;
        category: string;
        requiresPrescription?: boolean;
        page: number;
        limit: number;
    };
    onFiltersChange?: (key: string, value: unknown) => void;
}

export const DrugList: React.FC<DrugListProps> = ({
    branchId,
    urlFilters,
    onFiltersChange,
}) => {
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        branchId || '',
    );
    const navigate = useNavigate();

    const { user } = useAuthStore();

    // Use URL-based search if filters are provided, fallback to internal hook
    const { searchQuery, setSearchQuery: setUrlSearchQuery } = useURLSearch({
        paramName: 'search',
        debounceMs: 300,
        onSearchChange: (query) => {
            onFiltersChange?.('search', query);
        },
    });

    // Use search query from URL filters or internal search
    const currentSearchQuery = urlFilters?.search || searchQuery;

    // Only admin can manage (edit/delete) drugs
    const canManageDrugs = user?.role === UserRole.ADMIN;

    const {
        data: drugs,
        isLoading,
        isError,
        refetch,
        pagination,
        setSearchQuery,
    } = useDrugs(
        urlFilters
            ? {
                  branchId:
                      urlFilters.branchId || selectedBranchId || undefined,
                  search: urlFilters.search,
                  category: urlFilters.category,
                  requiresPrescription: urlFilters.requiresPrescription,
                  page: urlFilters.page,
                  limit: urlFilters.limit,
              }
            : {
                  branchId: selectedBranchId || branchId || undefined,
                  search: currentSearchQuery,
              },
    );

    const deleteDrug = useDeleteDrug();

    const handleBranchChange = (branchId: string) => {
        setSelectedBranchId(branchId);
        if (urlFilters && onFiltersChange) {
            onFiltersChange('branchId', branchId);
        }
    };

    const handleSearch = (query: string) => {
        if (urlFilters && onFiltersChange) {
            // Use URL-based search
            onFiltersChange('search', query);
            if (query.trim()) {
                setIsSearching(true);
            } else {
                setIsSearching(false);
            }
        } else {
            // Fallback to internal search
            setUrlSearchQuery(query);
            if (query.trim()) {
                setIsSearching(true);
                setSearchQuery(query);
            } else {
                setIsSearching(false);
                setSearchQuery('');
            }
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        if (!currentSearchQuery.trim()) {
            setIsSearching(false);
        }
    };

    // Reset searching state when data is loaded
    useEffect(() => {
        if (!isLoading) {
            setIsSearching(false);
        }
    }, [isLoading]);

    const handlePageChange = (page: number) => {
        if (urlFilters && onFiltersChange) {
            // Use URL-based pagination
            onFiltersChange('page', page);
        } else if (pagination) {
            // Fallback to internal pagination
            pagination.setPage(page);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                <SearchBar
                    onSearch={handleSearch}
                    initialValue={currentSearchQuery}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                />

                {/* Branch Filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <label className="text-sm font-medium text-gray-700 min-w-fit">
                        Filter by Branch:
                    </label>
                    <div className="w-full sm:w-64">
                        <BranchSelect
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                            required={false}
                            mode="filter"
                            allowEmpty={true}
                            placeholder="All Branches"
                        />
                    </div>
                </div>
            </div>

            {/* Error State */}
            {isError && !isSearching && (
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                    <p className="text-red-600">
                        Failed to load drugs. Please try again later. If the
                        issue persists, contact support.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* No Data State */}
            {(!drugs || !pagination) && !isSearching && !isLoading && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 text-center">
                    <p className="text-yellow-700">
                        No data available. Please refresh the page or try again
                        later.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                        Refresh Page
                    </button>
                </div>
            )}

            {/* Loading skeleton for initial load */}
            {isLoading && !currentSearchQuery ? (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Handle empty data list */}
            {drugs &&
                drugs.drugs &&
                drugs.drugs.length === 0 &&
                !isSearching && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                        <p className="text-gray-500">
                            No drugs found. Try adjusting your search or add a
                            new drug.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                            Refresh Page
                        </button>
                    </div>
                )}

            {isSearching && currentSearchQuery.trim() && isSearchFocused && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                        Searching drugs...
                    </span>
                </div>
            )}

            {(!isSearching || !currentSearchQuery.trim() || !isSearchFocused) &&
                drugs && (
                    <>
                        <Table<Drug>
                            data={drugs.drugs || []}
                            columns={
                                [
                                    { header: 'Name', accessor: 'name' },
                                    { header: 'Brand', accessor: 'brand' },
                                    {
                                        header: 'Category',
                                        accessor: 'category',
                                    },
                                    {
                                        header: 'Branch',
                                        accessor: 'branch',
                                        cell: (_value: unknown, drug: Drug) => {
                                            // Handle multiple branches or single branch
                                            if (
                                                drug.branches &&
                                                drug.branches.length > 0
                                            ) {
                                                if (
                                                    drug.branches.length === 1
                                                ) {
                                                    return drug.branches[0]
                                                        .name;
                                                }
                                                return (
                                                    <div className="flex flex-wrap gap-1">
                                                        {drug.branches
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    branch,
                                                                    index,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            branch.id ||
                                                                            index
                                                                        }
                                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                                    >
                                                                        {
                                                                            branch.name
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        {drug.branches.length >
                                                            2 && (
                                                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                                +
                                                                {drug.branches
                                                                    .length -
                                                                    2}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            // Fallback to single branch or default
                                            if (drug.branch?.name) {
                                                return drug.branch.name;
                                            }
                                            return (
                                                <span className="text-gray-400 text-sm">
                                                    Unknown
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        header: 'Status',
                                        accessor: 'ableToSell',
                                        cell: (value: boolean) => (
                                            <Badge
                                                variant={
                                                    value ? 'success' : 'danger'
                                                }
                                                size="sm"
                                            >
                                                {value
                                                    ? 'Available'
                                                    : 'Not Available'}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        header: 'Quantity',
                                        accessor: 'quantity',
                                    },
                                    {
                                        header: 'Unit Price',
                                        accessor: 'pricePerUnit',
                                        cell: (value: number) =>
                                            `GH₵${value.toLocaleString()}`,
                                    },
                                    {
                                        header: 'Expiry',
                                        accessor: 'expiryDate',
                                        cell: (value: string) => {
                                            const date = new Date(value);
                                            const now = new Date();
                                            const isExpired = date < now;
                                            const isExpiringSoon =
                                                date.getTime() - now.getTime() <
                                                30 * 24 * 60 * 60 * 1000; // 30 days

                                            return (
                                                <span
                                                    className={`text-sm ${
                                                        isExpired
                                                            ? 'text-red-600 font-semibold'
                                                            : isExpiringSoon
                                                            ? 'text-yellow-600 font-medium'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {date.toLocaleDateString()}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        header: 'Prescription',
                                        accessor: 'requiresPrescription',
                                        cell: (value: boolean) => (
                                            <Badge
                                                variant={
                                                    value
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                                size="sm"
                                            >
                                                {value
                                                    ? 'Required'
                                                    : 'Not Required'}
                                            </Badge>
                                        ),
                                    },
                                ] as TableColumn<Drug>[]
                            }
                            actions={
                                canManageDrugs
                                    ? ([
                                          {
                                              label: 'Edit',
                                              onClick: (drug: Drug) => {
                                                  navigate(
                                                      `/drugs/edit/${drug.id}`,
                                                  );
                                              },
                                              className:
                                                  'inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-200',
                                          },
                                          {
                                              label: 'Delete',
                                              onClick: (drug: Drug) => {
                                                  if (
                                                      window.confirm(
                                                          `Are you sure you want to delete "${drug.name}" by ${drug.brand}?\n\nThis action cannot be undone.`,
                                                      )
                                                  ) {
                                                      deleteDrug.mutate(
                                                          drug.id,
                                                          {
                                                              onSuccess: () => {
                                                                  console.log(
                                                                      'Drug deleted successfully',
                                                                  );
                                                              },
                                                              onError: (
                                                                  error,
                                                              ) => {
                                                                  console.error(
                                                                      'Failed to delete drug:',
                                                                      error,
                                                                  );
                                                                  alert(
                                                                      'Failed to delete drug. Please try again.',
                                                                  );
                                                              },
                                                          },
                                                      );
                                                  }
                                              },
                                              className:
                                                  'inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200',
                                          },
                                      ] as TableAction<Drug>[])
                                    : [] // Non-admin users get no actions
                            }
                        />

                        <Pagination
                            currentPage={
                                urlFilters?.page || pagination?.page || 1
                            }
                            totalPages={pagination?.totalPages || 1}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={pagination?.totalItems || 0}
                            itemsPerPage={
                                urlFilters?.limit || pagination?.limit || 10
                            }
                            size="md"
                        />
                    </>
                )}
        </div>
    );
};

export default DrugList;
