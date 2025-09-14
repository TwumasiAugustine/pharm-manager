import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useSafeNotify } from '../utils/useSafeNotify';
import { CustomerForm } from '../components/organisms/CustomerForm';
import { CustomerTable } from '../components/organisms/CustomerTable';
import { Pagination } from '../components/molecules/Pagination';
import { SearchBar } from '../components/molecules/SearchBar';
import type { CreateCustomerRequest } from '../types/customer.types';
import DashboardLayout from '../layouts/DashboardLayout';
import { BranchSelect } from '../components/molecules/BranchSelect';
import { useDebounce } from '../hooks/useDebounce';
import { FaUsers, FaUserPlus, FaSync, FaDownload } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import PermissionGuard from '../components/atoms/PermissionGuard';
import { PERMISSION_KEYS } from '../types/permission.types';

const CustomerManagementPage: React.FC = () => {
    const [branchId, setBranchId] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        phone: '',
        email: '',
        address: '',
        branchId: '',
    });
    // const { data: branches } = useBranches();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce for 500ms
    const navigate = useNavigate();

    const {
        data: customers,
        isLoading,
        isError,
        refetch,
        pagination,
    } = useCustomers({ limit: 5, search: debouncedSearchTerm, branchId }); // Set limit to 5 customers per page
    const handleBranchChange = (id: string) => {
        setBranchId(id);
    };

    const createCustomer = useCreateCustomer();

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

    const handleSearch = (query: string) => {
        setSearchTerm(query);
    };

    const handlePageChange = (page: number) => {
        if (pagination) {
            pagination.setPage(page);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            notify.warning('Name and phone are required');
            return;
        }

        try {
            await createCustomer.mutateAsync({
                ...formData,
                branchId: formData.branchId || branchId,
            });
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                branchId: branchId,
            });
            setShowForm(false);
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (isError) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                    <p className="text-red-600">
                        Failed to load customers. Please try again later.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // Loading skeleton component
    const CustomerManagementSkeleton = () => (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-64"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                            <div className="h-10 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>

                    {/* Search bar skeleton */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>

                    {/* Table skeleton */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        {/* Table header */}
                        <div className="grid grid-cols-4 gap-4 pb-3 border-b mb-4">
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                        </div>

                        {/* Table rows */}
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100"
                            >
                                <div className="h-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination skeleton */}
                    <div className="flex justify-center mt-6">
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

    // Show skeleton on initial load
    if (isLoading && !customers) {
        return <CustomerManagementSkeleton />;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <FaUsers className="mr-2 text-blue-500" />
                            Customer Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your customer database and contact
                            information
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                        {/* Desktop view - show all buttons (large screens and above) */}
                        <div className="hidden lg:flex items-center gap-3">
                            <PermissionGuard
                                permission={PERMISSION_KEYS.CREATE_CUSTOMER}
                            >
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <FaUserPlus className="h-4 w-4 mr-2" />
                                    {showForm ? 'Cancel' : 'Add New Customer'}
                                </button>
                            </PermissionGuard>
                        </div>

                        {/* Mobile/Tablet view - Actions dropdown (small to large screens) */}
                        <div
                            className="lg:hidden relative"
                            ref={actionsDropdownRef}
                        >
                            <button
                                onClick={() =>
                                    setShowActionsDropdown(!showActionsDropdown)
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
                                        {/* Add Customer option */}
                                        <PermissionGuard
                                            permission={
                                                PERMISSION_KEYS.CREATE_CUSTOMER
                                            }
                                        >
                                            <button
                                                onClick={() => {
                                                    setShowForm(!showForm);
                                                    setShowActionsDropdown(
                                                        false,
                                                    );
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FaUserPlus className="h-4 w-4 mr-3" />
                                                {showForm
                                                    ? 'Cancel'
                                                    : 'Add New Customer'}
                                            </button>
                                        </PermissionGuard>

                                        {/* Refresh option */}
                                        <button
                                            onClick={() => {
                                                refetch();
                                                setShowActionsDropdown(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <FaSync className="h-4 w-4 mr-3" />
                                            Refresh
                                        </button>

                                        {/* Export option */}
                                        <button
                                            onClick={() => {
                                                // TODO: Implement export functionality
                                                console.log(
                                                    'Export customers clicked',
                                                );
                                                setShowActionsDropdown(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <FaDownload className="h-4 w-4 mr-3" />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <FaUserPlus className="mr-2 text-blue-500" />
                            New Customer
                        </h2>
                        <CustomerForm
                            formData={{
                                ...formData,
                                branchId: formData.branchId || branchId,
                            }}
                            onChange={handleChange}
                            onBranchChange={(id) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    branchId: id,
                                }))
                            }
                            onSubmit={handleSubmit}
                            isPending={createCustomer.isPending}
                        />
                    </div>
                )}

                {/* Improved Search & Filter Card */}
                <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-200">
                    <div className="flex items-center w-full gap-3">
                        <div className="w-full sm:w-56 max-w-xs">
                            <BranchSelect
                                value={branchId}
                                onChange={handleBranchChange}
                            />
                        </div>
                        <div className="hidden sm:block h-8 border-l border-gray-200 mx-2"></div>
                        <div className="flex-1 flex items-center gap-2">
                            <SearchBar
                                placeholder="Search customers..."
                                onSearch={handleSearch}
                                className="w-full md:w-80 focus:ring-2 focus:ring-blue-500 border-gray-300"
                                initialValue={searchTerm}
                            />
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="ml-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    display: searchTerm
                                        ? 'inline-block'
                                        : 'none',
                                }}
                                aria-label="Clear search"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    {debouncedSearchTerm && isLoading && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                            Searching for "{debouncedSearchTerm}"...
                        </div>
                    )}
                </div>

                {/* Customers Table */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <CustomerTable
                        customers={customers?.customers || []}
                        isLoading={isLoading}
                        onView={(customer) =>
                            navigate(`/customers/${customer.id}`)
                        }
                        emptyMessage={
                            debouncedSearchTerm
                                ? `No customers found matching "${debouncedSearchTerm}".`
                                : 'No customers found. Add your first customer to get started.'
                        }
                    />

                    {/* Pagination */}
                    {!isLoading && pagination && pagination.totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                showInfo={true}
                                totalItems={pagination.totalItems}
                                itemsPerPage={pagination.limit}
                                size="md"
                            />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerManagementPage;
