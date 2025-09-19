import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { DrugList } from '../components/organisms/DrugList';
import { BranchSelect } from '../components/molecules/BranchSelect';
import { DrugForm } from '../components/organisms/DrugForm';
import { useCreateDrug } from '../hooks/useDrugs';
import PermissionGuard from '../components/atoms/PermissionGuard';
import { PERMISSION_KEYS } from '../types/permission.types';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { useURLFilters } from '../hooks/useURLSearch';
import {
    FiPlus,
    FiMoreVertical,
    FiRefreshCw,
    FiDownload,
    FiArrowLeft,
} from 'react-icons/fi';
import type { DrugFormValues } from '../validations/drug.validation';
import type { CreateDrugRequest } from '../types/drug.types';

/**
 * DrugsPage component - handles listing and management of drugs
 */
const DrugsPage: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const createDrug = useCreateDrug();

    // URL-based filters for drugs page
    const { filters, setFilter } = useURLFilters(
        {
            branchId: '',
            search: '',
            category: '',
            requiresPrescription: undefined as boolean | undefined,
            page: 1,
            limit: 10,
        },
        {
            debounceMs: 300,
            onFiltersChange: (newFilters) => {
                // Optional: Log filter changes for analytics
                console.log('Drug filters changed:', newFilters);
            },
        },
    );

    // Generate SEO metadata for the inventory page
    const seoData = useSEO({
        ...SEO_PRESETS.inventory,
        structuredDataType: 'WebApplication',
    });

    // Close actions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        };

        if (showActionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsDropdown]);

    const handleAddDrug = (data: DrugFormValues): void => {
        createDrug.mutate(data as CreateDrugRequest, {
            onSuccess: () => {
                setShowAddForm(false);
            },
        });
    };

    return (
        <DashboardLayout>
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            <PermissionGuard
                permission={PERMISSION_KEYS.VIEW_DRUGS}
                fallback={
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                You don't have permission to view the drug
                                inventory.
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Drug Inventory
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your pharmacy's drug inventory and stock
                                levels
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <BranchSelect
                                value={filters.branchId}
                                onChange={(branchId) =>
                                    setFilter('branchId', branchId)
                                }
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap justify-end sm:justify-start">
                            {/* Desktop view - show all buttons */}
                            <div className="hidden md:flex items-center gap-3">
                                <PermissionGuard
                                    permission={PERMISSION_KEYS.CREATE_DRUG}
                                >
                                    <button
                                        onClick={() =>
                                            setShowAddForm((prev) => !prev)
                                        }
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    >
                                        {showAddForm ? (
                                            <FiArrowLeft className="h-4 w-4 mr-2" />
                                        ) : (
                                            <FiPlus className="h-4 w-4 mr-2" />
                                        )}
                                        {showAddForm
                                            ? 'Back to List'
                                            : 'New Drug'}
                                    </button>
                                </PermissionGuard>
                            </div>

                            {/* Mobile view - Actions dropdown */}
                            <div
                                className="md:hidden relative"
                                ref={actionsDropdownRef}
                            >
                                <button
                                    onClick={() =>
                                        setShowActionsDropdown(
                                            !showActionsDropdown,
                                        )
                                    }
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="mr-2">Actions</span>
                                    <FiMoreVertical className="h-4 w-4" />
                                </button>

                                {/* Actions dropdown panel */}
                                {showActionsDropdown && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                        <div className="py-1">
                                            {/* Add Drug option - protected by permission */}
                                            <PermissionGuard
                                                permission={
                                                    PERMISSION_KEYS.CREATE_DRUG
                                                }
                                            >
                                                <button
                                                    onClick={() => {
                                                        setShowAddForm(
                                                            (prev) => !prev,
                                                        );
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <FiPlus className="h-4 w-4 mr-3" />
                                                    {showAddForm
                                                        ? 'Back to List'
                                                        : 'New Drug'}
                                                </button>
                                            </PermissionGuard>

                                            {/* Refresh option */}
                                            <button
                                                onClick={() => {
                                                    window.location.reload();
                                                    setShowActionsDropdown(
                                                        false,
                                                    );
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiRefreshCw className="h-4 w-4 mr-3" />
                                                Refresh
                                            </button>

                                            {/* Export option */}
                                            <button
                                                onClick={() => {
                                                    console.log(
                                                        'Export clicked',
                                                    );
                                                    setShowActionsDropdown(
                                                        false,
                                                    );
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiDownload className="h-4 w-4 mr-3" />
                                                Export
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {showAddForm ? (
                        <PermissionGuard
                            permission={PERMISSION_KEYS.CREATE_DRUG}
                        >
                            <DrugForm
                                onSubmit={handleAddDrug}
                                isSubmitting={createDrug.isPending}
                            />
                        </PermissionGuard>
                    ) : (
                        <DrugList
                            branchId={filters.branchId}
                            urlFilters={filters}
                            onFiltersChange={(key, value) =>
                                setFilter(
                                    key as keyof typeof filters,
                                    value as (typeof filters)[keyof typeof filters],
                                )
                            }
                        />
                    )}
                </div>
            </PermissionGuard>
        </DashboardLayout>
    );
};

export default DrugsPage;
