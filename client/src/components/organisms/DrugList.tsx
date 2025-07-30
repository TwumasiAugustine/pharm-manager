import React from 'react';
import { useDrugs, useDeleteDrug } from '../../hooks/useDrugs';
import { Table } from '../molecules/Table';
import type { TableColumn, TableAction } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { SearchBar } from '../molecules/SearchBar';
import type { Drug } from '../../types/drug.types';

/**
 * DrugList component to display and manage the list of drugs.
 */
export const DrugList: React.FC = () => {
    const {
        data: drugs,
        isLoading,
        isError,
        refetch,
        pagination,
        setSearchQuery,
    } = useDrugs();

    const deleteDrug = useDeleteDrug();

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handlePageChange = (page: number) => {
        if (pagination) {
            pagination.setPage(page);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                <p className="text-red-600">
                    Failed to load drugs. Please try again later. If the issue
                    persists, contact support.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!drugs || !pagination) {
        return (
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
        );
    }

    // Handle empty data list
    if (drugs.drugs.length === 0) {
        return (
            <div className="space-y-6">
                <SearchBar onSearch={handleSearch} />
                <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                    <p className="text-gray-500">
                        No drugs found. Try adjusting your search or add a new
                        drug.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SearchBar onSearch={handleSearch} />

            <Table<Drug>
                data={drugs.drugs || []}
                columns={
                    [
                        { header: 'Name', accessor: 'name' as keyof Drug },
                        { header: 'Brand', accessor: 'brand' as keyof Drug },
                        {
                            header: 'Category',
                            accessor: 'category' as keyof Drug,
                        },
                        {
                            header: 'Quantity',
                            accessor: 'quantity' as keyof Drug,
                            cell: (value: number) =>
                                Number(value).toLocaleString(),
                        },
                        {
                            header: 'Price',
                            accessor: 'price' as keyof Drug,
                            cell: (value: number) =>
                                `$${Number(value).toFixed(2)}`,
                        },
                        {
                            header: 'Expiry Date',
                            accessor: 'expiryDate' as keyof Drug,
                            cell: (value: string) =>
                                new Date(value).toLocaleDateString(),
                        },
                    ] as TableColumn<Drug>[]
                }
                actions={
                    [
                        {
                            label: 'Edit',
                            onClick: (drug: Drug) => {
                                // Redirect to edit page or open edit modal
                                window.location.href = `/drugs/edit/${drug.id}`;
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
                                    deleteDrug.mutate(drug.id);
                                }
                            },
                        },
                    ] as TableAction<Drug>[]
                }
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default DrugList;
