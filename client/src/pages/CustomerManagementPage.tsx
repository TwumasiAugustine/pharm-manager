import React, { useState, useEffect } from 'react';
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
import { FaUsers, FaUserPlus, FaEye } from 'react-icons/fa';

const CustomerManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
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

    // Only show full-page loading on initial load, not during search
    if (isLoading && !debouncedSearchTerm) {
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
                    Failed to load customers. Please try again later.
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center">
                        <FaUsers className="mr-2 text-blue-500" />
                        Customer Management
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                        {showForm ? (
                            'Cancel'
                        ) : (
                            <>
                                <FaUserPlus className="mr-2" />
                                Add New Customer
                            </>
                        )}
                    </button>
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
                    {debouncedSearchTerm && isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-8 w-8 mb-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                                <p className="text-gray-500">
                                    Loading search results...
                                </p>
                            </div>
                        </div>
                    ) : customers?.customers &&
                      customers.customers.length > 0 ? (
                        <>
                            <Table<Customer>
                                data={customers.customers}
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
                                            navigate(
                                                `/customers/${customer.id}`,
                                            );
                                        },
                                    },
                                ]}
                            />

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500 my-8">
                            {debouncedSearchTerm
                                ? `No customers found matching "${debouncedSearchTerm}".`
                                : 'No customers found. Add your first customer to get started.'}
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerManagementPage;
