import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrugs, useDeleteDrug } from '../../hooks/useDrugs';
import { Table } from '../molecules/Table';
import type { TableColumn, TableAction } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { SearchBar } from '../molecules/SearchBar';
import type { Drug } from '../../types/drug.types';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/user.types';

/**
 * DrugList component to display and manage the list of drugs.
 */

interface DrugListProps {
    branchId?: string;
}

export const DrugList: React.FC<DrugListProps> = ({ branchId }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQueryLocal] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const navigate = useNavigate();

    const { user } = useAuthStore();

    // Only super admin can manage (edit/delete) drugs
    const canManageDrugs = user?.role === UserRole.SUPER_ADMIN;

    const {
        data: drugs,
        isLoading,
        isError,
        refetch,
        pagination,
        setSearchQuery,
    } = useDrugs(branchId ? { branchId } : {});

    const deleteDrug = useDeleteDrug();

    const handleSearch = (query: string) => {
        setSearchQueryLocal(query);

        if (query.trim()) {
            setIsSearching(true);
            setSearchQuery(query);
        } else {
            setIsSearching(false);
            setSearchQuery('');
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        if (!searchQuery.trim()) {
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
        if (pagination) {
            pagination.setPage(page);
        }
    };

    return (
        <div className="space-y-6">
            <SearchBar
                onSearch={handleSearch}
                initialValue={searchQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
            />

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
            {isLoading && !searchQuery ? (
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

            {isSearching && searchQuery.trim() && isSearchFocused && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                        Searching drugs...
                    </span>
                </div>
            )}

            {(!isSearching || !searchQuery.trim() || !isSearchFocused) &&
                drugs && (
                    <>
                        <Table<Drug>
                            data={drugs.drugs || []}
                            columns={
                                [
                                    { header: 'ID', accessor: 'id' },
                                    { header: 'Name', accessor: 'name' },
                                    { header: 'Brand', accessor: 'brand' },
                                    {
                                        header: 'Category',
                                        accessor: 'category',
                                    },
                                    {
                                        header: 'Dosage Form',
                                        accessor: 'dosageForm',
                                    },
                                    {
                                        header: 'Able To Sell',
                                        accessor: 'ableToSell',
                                        cell: (value: boolean) =>
                                            value ? 'Yes' : 'No',
                                    },
                                    {
                                        header: 'Drugs In Carton',
                                        accessor: 'drugsInCarton',
                                    },
                                    {
                                        header: 'Units Per Carton',
                                        accessor: 'unitsPerCarton',
                                    },
                                    {
                                        header: 'Packs Per Carton',
                                        accessor: 'packsPerCarton',
                                    },
                                    {
                                        header: 'Quantity',
                                        accessor: 'quantity',
                                    },
                                    {
                                        header: 'Price Per Unit',
                                        accessor: 'pricePerUnit',
                                    },
                                    {
                                        header: 'Price Per Pack',
                                        accessor: 'pricePerPack',
                                    },
                                    {
                                        header: 'Price Per Carton',
                                        accessor: 'pricePerCarton',
                                    },
                                    {
                                        header: 'Cost Price',
                                        accessor: 'costPrice',
                                    },
                                    {
                                        header: 'Expiry Date',
                                        accessor: 'expiryDate',
                                        cell: (value: string) =>
                                            value
                                                ? new Date(
                                                      value,
                                                  ).toLocaleDateString()
                                                : '',
                                    },
                                    {
                                        header: 'Batch Number',
                                        accessor: 'batchNumber',
                                    },
                                    {
                                        header: 'Requires Prescription',
                                        accessor: 'requiresPrescription',
                                    },
                                    {
                                        header: 'Created At',
                                        accessor: 'createdAt',
                                        cell: (value: string) =>
                                            value
                                                ? new Date(
                                                      value,
                                                  ).toLocaleDateString()
                                                : '',
                                    },
                                    {
                                        header: 'Updated At',
                                        accessor: 'updatedAt',
                                        cell: (value: string) =>
                                            value
                                                ? new Date(
                                                      value,
                                                  ).toLocaleDateString()
                                                : '',
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
                                          },
                                          {
                                              label: 'Delete',
                                              onClick: (drug: Drug) => {
                                                  if (
                                                      window.confirm(
                                                          `Are you sure you want to delete ${drug.name}?`,
                                                      )
                                                  ) {
                                                      deleteDrug.mutate(
                                                          drug.id,
                                                      );
                                                  }
                                              },
                                          },
                                      ] as TableAction<Drug>[])
                                    : []
                            }
                        />

                        <Pagination
                            currentPage={pagination?.page || 1}
                            totalPages={pagination?.totalPages || 1}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={pagination?.totalItems || 0}
                            itemsPerPage={pagination?.limit || 10}
                            size="md"
                        />
                    </>
                )}
        </div>
    );
};

export default DrugList;
