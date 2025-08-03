import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useSafeNotify } from '../utils/useSafeNotify';
import { Table } from '../components/molecules/Table';
import type { TableColumn } from '../components/molecules/Table';
import { Pagination } from '../components/molecules/Pagination';
import { SearchBar } from '../components/molecules/SearchBar';
import type { Customer, CreateCustomerRequest } from '../types/customer.types';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDebounce } from '../hooks/useDebounce';
import { FaUsers, FaUserPlus, FaEye, FaSync, FaDownload } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';

const CustomerManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce for 500ms
    const navigate = useNavigate();

    const {
        data: customers,
        isLoading,
        isError,
        refetch,
        pagination,
        setSearchQuery,
    } = useCustomers();

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

    // Apply the debounced search term to the actual search query
    useEffect(() => {
        setSearchQuery(debouncedSearchTerm);
    }, [debouncedSearchTerm, setSearchQuery]);

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
            await createCustomer.mutateAsync(formData);
            setFormData({ name: '', phone: '', email: '', address: '' });
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

                    <div className="flex items-center gap-3 flex-wrap justify-end sm:justify-start">
                        {/* Desktop view - show all buttons */}
                        <div className="hidden sm:flex items-center gap-3">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                <FaUserPlus className="h-4 w-4 mr-2" />
                                {showForm ? 'Cancel' : 'Add New Customer'}
                            </button>
                        </div>

                        {/* Mobile view - Actions dropdown */}
                        <div
                            className="sm:hidden relative"
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
                                        <button
                                            onClick={() => {
                                                setShowForm(!showForm);
                                                setShowActionsDropdown(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <FaUserPlus className="h-4 w-4 mr-3" />
                                            {showForm
                                                ? 'Cancel'
                                                : 'Add New Customer'}
                                        </button>

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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Phone *
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Address
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={createCustomer.isPending}
                                >
                                    {createCustomer.isPending
                                        ? 'Saving...'
                                        : 'Save Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <SearchBar
                        placeholder="Search customers..."
                        onSearch={handleSearch}
                        className="w-full md:w-80"
                        initialValue={searchTerm}
                    />
                    {debouncedSearchTerm && isLoading && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                            Searching for "{debouncedSearchTerm}"...
                        </div>
                    )}
                </div>

                {/* Customers Table */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Table<Customer>
                        data={customers?.customers || []}
                        isLoading={isLoading}
                        columns={
                            [
                                {
                                    header: 'Name',
                                    accessor: 'name',
                                },
                                {
                                    header: 'Phone',
                                    accessor: 'phone',
                                },
                                {
                                    header: 'Email',
                                    accessor: 'email',
                                    cell: (value) => value || '-',
                                },
                            ] as TableColumn<Customer>[]
                        }
                        actions={[
                            {
                                label: 'View Details',
                                icon: <FaEye />,
                                onClick: (customer) => {
                                    navigate(`/customers/${customer.id}`);
                                },
                            },
                        ]}
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
                            />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerManagementPage;
