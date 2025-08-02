import React, { useState, useEffect } from 'react';
import { useCustomers, useCreateCustomer } from '../../hooks/useCustomers';
import type { Customer } from '../../types/customer.types';
import { useDebounce } from '../../hooks/useDebounce';
import { useSafeNotify } from '../../utils/useSafeNotify';
import { SearchBar } from './SearchBar';
import { FaUserPlus, FaUser } from 'react-icons/fa';

/**
 * Props for the CustomerSelect component
 */
interface CustomerSelectProps {
    /** Function to call when customer selection changes */
    onChange: (customerId: string | undefined) => void;
    /** Currently selected customer ID */
    value?: string;
}

/**
 * Customer selection component with search and creation functionality
 * Allows users to search for existing customers or create new ones
 */
export const CustomerSelect: React.FC<CustomerSelectProps> = ({
    onChange,
    value,
}) => {
    const notify = useSafeNotify();
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [recentlyCreatedCustomer, setRecentlyCreatedCustomer] =
        useState<Customer | null>(null);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    // Debounce search term to reduce API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // Fetch customers with search
    const { data, isLoading } = useCustomers({
        page: 1,
        limit: 10,
        search: debouncedSearchTerm,
    });

    // Mutation for creating new customer
    const createCustomer = useCreateCustomer();

    // Get customers from the API response
    const customers = data?.customers || [];

    // Clear recently created customer when search term changes
    useEffect(() => {
        if (searchTerm) {
            setRecentlyCreatedCustomer(null);
        }
    }, [searchTerm]);

    /**
     * Handle selecting a customer from the list
     * Sets the selected customer ID and clears the search term
     * @param customerId - The ID of the customer to select
     */
    const handleSelectCustomer = (customerId: string) => {
        onChange(customerId);
        setSearchTerm(''); // Clear search when customer is selected
    };

    // Clear recently created customer when selected customer changes
    useEffect(() => {
        if (value && value !== recentlyCreatedCustomer?.id) {
            setRecentlyCreatedCustomer(null);
        }
    }, [value, recentlyCreatedCustomer]);

    /**
     * Handle creating a new customer
     * Validates required fields, creates the customer, selects it, and resets form
     */
    const handleCreateNewCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            notify.warning('Name and phone are required');
            return;
        }

        try {
            const createdCustomer = await createCustomer.mutateAsync({
                name: newCustomer.name,
                phone: newCustomer.phone,
                email: newCustomer.email,
                address: newCustomer.address,
            });

            // Store the created customer to display it exclusively
            setRecentlyCreatedCustomer({
                id: createdCustomer.id,
                name: newCustomer.name,
                phone: newCustomer.phone,
                email: newCustomer.email || '',
                address: newCustomer.address || '',
                purchases: [], // Add empty purchases array
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            onChange(createdCustomer.id);
            setShowNewCustomerForm(false);
            setNewCustomer({ name: '', phone: '', email: '', address: '' });
            setSearchTerm(''); // Clear search term
        } catch (error) {
            console.error('Error creating customer:', error);
            notify.error('Failed to create customer. Please try again.');
        }
    };

    /**
     * Find the currently selected customer from the customers list
     * Returns null if no customer is selected or customers aren't loaded
     */
    const selectedCustomer = React.useMemo(() => {
        if (!value || !data?.customers) return null;
        return data.customers.find((c) => c.id === value);
    }, [value, data?.customers]);

    return (
        <div className="mb-4">
            {showNewCustomerForm ? (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <FaUserPlus className="mr-1 text-blue-500" />
                        New Customer
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-xs flex items-center">
                                <FaUser className="mr-1 text-gray-400" />
                                Name *
                            </label>
                            <input
                                type="text"
                                value={newCustomer.name}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Customer name"
                                title="Customer name"
                                className="w-full px-3 py-1 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Phone *</label>
                            <input
                                type="text"
                                value={newCustomer.phone}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="Customer phone number"
                                title="Customer phone number"
                                className="w-full px-3 py-1 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Email</label>
                            <input
                                type="email"
                                value={newCustomer.email}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Customer email address"
                                title="Customer email address"
                                className="w-full px-3 py-1 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Address</label>
                            <input
                                type="text"
                                value={newCustomer.address}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        address: e.target.value,
                                    })
                                }
                                placeholder="Customer address"
                                title="Customer address"
                                className="w-full px-3 py-1 border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowNewCustomerForm(false)}
                                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateNewCustomer}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={createCustomer.isPending}
                            >
                                {createCustomer.isPending
                                    ? 'Saving...'
                                    : 'Save Customer'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex space-x-2 mb-2">
                        <div className="flex-1">
                            <SearchBar
                                onSearch={setSearchTerm}
                                placeholder="Search customers..."
                                initialValue={searchTerm}
                                className="w-full"
                            />
                        </div>
                        <button
                            onClick={() => setShowNewCustomerForm(true)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                        >
                            + New
                        </button>
                    </div>

                    {selectedCustomer && (
                        <div className="bg-blue-50 p-2 rounded-md mb-2 flex justify-between items-center">
                            <div>
                                <div className="font-semibold">
                                    {selectedCustomer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {selectedCustomer.phone}
                                </div>
                            </div>
                            <button
                                onClick={() => onChange(undefined)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {!selectedCustomer && (
                        <>
                            <div className="text-xs text-blue-600 mb-2">
                                <span role="img" aria-label="info">
                                    ℹ️
                                </span>{' '}
                                Select a customer to add to this sale or create
                                a new one
                            </div>
                            <div className="max-h-48 overflow-y-auto border rounded-md">
                                {isLoading ? (
                                    <div className="p-2 text-center text-gray-500">
                                        {debouncedSearchTerm
                                            ? `Searching for "${debouncedSearchTerm}"...`
                                            : 'Loading customers...'}
                                    </div>
                                ) : searchTerm && debouncedSearchTerm ? (
                                    // When actively searching, show search results
                                    customers.length === 0 ? (
                                        <div className="p-2 text-center text-gray-500">
                                            No customers found for "
                                            {debouncedSearchTerm}"
                                        </div>
                                    ) : (
                                        <ul className="divide-y">
                                            {customers.map((customer) => (
                                                <li
                                                    key={customer.id}
                                                    onClick={() =>
                                                        handleSelectCustomer(
                                                            customer.id,
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <div className="font-medium">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {customer.phone}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                ) : recentlyCreatedCustomer && !searchTerm ? (
                                    // Show only recently created customer if exists and no search term
                                    <ul className="divide-y">
                                        <li
                                            key={recentlyCreatedCustomer.id}
                                            onClick={() =>
                                                handleSelectCustomer(
                                                    recentlyCreatedCustomer.id,
                                                )
                                            }
                                            className="p-2 hover:bg-gray-100 cursor-pointer bg-green-50"
                                        >
                                            <div className="font-medium">
                                                {recentlyCreatedCustomer.name}
                                                <span className="ml-2 text-xs text-green-600">
                                                    New
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {recentlyCreatedCustomer.phone}
                                            </div>
                                        </li>
                                    </ul>
                                ) : customers.length === 0 ? (
                                    <div className="p-2 text-center text-gray-500">
                                        {searchTerm
                                            ? `No customers found for "${searchTerm}"`
                                            : 'No customers found'}
                                    </div>
                                ) : (
                                    <ul className="divide-y">
                                        {customers
                                            .slice(0, 10)
                                            .map((customer) => (
                                                <li
                                                    key={customer.id}
                                                    onClick={() =>
                                                        handleSelectCustomer(
                                                            customer.id,
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <div className="font-medium">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {customer.phone}
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
