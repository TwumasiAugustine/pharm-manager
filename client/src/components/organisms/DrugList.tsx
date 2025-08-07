import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrugs, useDeleteDrug } from '../../hooks/useDrugs';
import { Table } from '../molecules/Table';
import type { TableColumn, TableAction } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { SearchBar } from '../molecules/SearchBar';
import { PackagePricingDisplay } from '../molecules/PackagePricingDisplay';
import type { Drug } from '../../types/drug.types';
import { formatGHSDisplayAmount } from '../../utils/currency';
import { FaBox, FaBoxes, FaPills, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

/**
 * DrugList component to display and manage the list of drugs.
 */
export const DrugList: React.FC = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQueryLocal] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const navigate = useNavigate();

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

    const handleViewPricing = (drug: Drug) => {
        setSelectedDrug(drug);
        setShowPricingModal(true);
    };

    const getPackageTypeIcon = (drug: Drug) => {
        if (!drug.packageInfo?.isPackaged) {
            return <FaPills className="text-gray-400" title="Individual units only" />;
        }
        if (drug.packageInfo.cartonPrice) {
            return <FaBoxes className="text-purple-500" title="Available in cartons" />;
        }
        return <FaBox className="text-green-500" title="Available in packs" />;
    };

    const getPackageTypeText = (drug: Drug) => {
        if (!drug.packageInfo?.isPackaged) {
            return 'Individual';
        }
        if (drug.packageInfo.cartonPrice) {
            return 'Carton';
        }
        return 'Pack';
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
            {isLoading && !isSearching ? (
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

            {/* Drug Table */}
            {!isLoading &&
                drugs && (
                    <>
                        <Table<Drug>
                            data={drugs.drugs || []}
                            columns={
                                [
                                    {
                                        header: 'Drug Information',
                                        accessor: 'name' as keyof Drug,
                                        cell: (value: string, drug: Drug) => (
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900">{drug.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {drug.generic} • {drug.brand}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {drug.category} • {drug.type} • {drug.dosageForm}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: 'Stock & Pricing',
                                        accessor: 'quantity' as keyof Drug,
                                        cell: (value: number, drug: Drug) => (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {Number(value).toLocaleString()} units
                                                    </span>
                                                    {getPackageTypeIcon(drug)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {formatGHSDisplayAmount(drug.price)} per unit
                                                </div>
                                                {drug.packageInfo?.isPackaged && (
                                                    <div className="text-xs text-blue-600">
                                                        {getPackageTypeText(drug)} pricing available
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        header: 'Package Info',
                                        accessor: 'packageInfo' as keyof Drug,
                                        cell: (value: any, drug: Drug) => (
                                            <div className="space-y-1">
                                                {drug.packageInfo?.isPackaged ? (
                                                    <>
                                                        <div className="text-sm text-gray-900">
                                                            {drug.packageInfo.unitsPerPack} units/pack
                                                        </div>
                                                        {drug.packageInfo.packsPerCarton && (
                                                            <div className="text-sm text-gray-600">
                                                                {drug.packageInfo.packsPerCarton} packs/carton
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-green-600">
                                                            Bulk pricing available
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-gray-500">
                                                        Individual units only
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        header: 'Status',
                                        accessor: 'expiryDate' as keyof Drug,
                                        cell: (value: string, drug: Drug) => {
                                            const expiryDate = new Date(value);
                                            const today = new Date();
                                            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                            
                                            let statusColor = 'text-green-600';
                                            let statusText = 'Good';
                                            
                                            if (daysUntilExpiry < 0) {
                                                statusColor = 'text-red-600';
                                                statusText = 'Expired';
                                            } else if (daysUntilExpiry <= 30) {
                                                statusColor = 'text-orange-600';
                                                statusText = 'Expiring Soon';
                                            } else if (daysUntilExpiry <= 90) {
                                                statusColor = 'text-yellow-600';
                                                statusText = 'Warning';
                                            }
                                            
                                            return (
                                                <div className="space-y-1">
                                                    <div className={`text-sm font-medium ${statusColor}`}>
                                                        {statusText}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Expires: {expiryDate.toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : `${Math.abs(daysUntilExpiry)} days expired`}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    },
                                ] as TableColumn<Drug>[]
                            }
                            actions={
                                [
                                    {
                                        label: 'View Pricing',
                                        onClick: (drug: Drug) => handleViewPricing(drug),
                                        icon: <FaEye className="h-4 w-4" />,
                                    },
                                    {
                                        label: 'Edit',
                                        onClick: (drug: Drug) => {
                                            navigate(`/drugs/edit/${drug.id}`);
                                        },
                                        icon: <FaEdit className="h-4 w-4" />,
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
                                        icon: <FaTrash className="h-4 w-4" />,
                                    },
                                ] as TableAction<Drug>[]
                            }
                        />

                        <Pagination
                            currentPage={pagination?.page || 1}
                            totalPages={pagination?.totalPages || 1}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={pagination?.total || 0}
                            itemsPerPage={pagination?.limit || 10}
                            size="md"
                        />
                    </>
                )}

            {/* Pricing Modal */}
            {showPricingModal && selectedDrug && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">
                                Package Pricing - {selectedDrug.name}
                            </h3>
                            <button
                                onClick={() => setShowPricingModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <span className="sr-only">Close modal</span>
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Drug Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <span className="ml-2 font-medium">{selectedDrug.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Generic:</span>
                                        <span className="ml-2 font-medium">{selectedDrug.generic}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Brand:</span>
                                        <span className="ml-2 font-medium">{selectedDrug.brand}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Stock:</span>
                                        <span className="ml-2 font-medium">{selectedDrug.quantity} units</span>
                                    </div>
                                </div>
                            </div>

                            <PackagePricingDisplay 
                                drug={selectedDrug} 
                                quantity={10}
                                showBestOption={true}
                            />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowPricingModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrugList;
