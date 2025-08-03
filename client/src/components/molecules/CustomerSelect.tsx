import React, { useState, useEffect } from 'react';
import {
    useCustomers,
    useCreateCustomer,
    useCustomer,
} from '../../hooks/useCustomers';
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
    const [recentlyCreatedCustomerId, setRecentlyCreatedCustomerId] = useState<
        string | null
    >(null);
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
        limit: 20, // Increased limit to ensure we get enough data for sorting
        search: debouncedSearchTerm,
    });

    // Mutation for creating new customer
    const createCustomer = useCreateCustomer();

    // Get customers from the API response and sort them
    const customers = React.useMemo(() => {
        const allCustomers = (data?.customers || []).filter(
            (customer) => customer.id,
        ); // Filter out customers without IDs

        console.log(
            'All customers:',
            allCustomers.map((c) => c.name),
        );
        console.log('Recently created customer ID:', recentlyCreatedCustomerId);
        console.log(
            'Recently created customer object:',
            recentlyCreatedCustomer,
        );

        // If there's a recently created customer, put it at the top
        if (recentlyCreatedCustomer && recentlyCreatedCustomer.id) {
            console.log(
                'Processing recently created customer for top placement',
            );
            // First filter out the recently created customer from the API list (if it exists there)
            const otherCustomers = allCustomers.filter(
                (c) => c.id !== recentlyCreatedCustomer.id,
            );

            console.log(
                'Other customers after filtering out recent:',
                otherCustomers.map((c) => c.name),
            );

            const sortedCustomers = [
                recentlyCreatedCustomer,
                ...otherCustomers,
            ].slice(0, 5);
            console.log(
                'Final sorted customers with recent at top:',
                sortedCustomers.map((c) => ({ name: c.name, id: c.id })),
            );
            return sortedCustomers;
        }

        const finalCustomers = allCustomers.slice(0, 5);
        console.log(
            'No recent customer, final customers:',
            finalCustomers.map((c) => c.name),
        );
        return finalCustomers;
    }, [data?.customers, recentlyCreatedCustomer, recentlyCreatedCustomerId]);

    // Fetch selected customer details if not found in current list
    const { data: selectedCustomerData } = useCustomer(value || '', {
        enabled: !!value && !customers.find((c) => c.id === value),
    });

    // Clear recently created customer when searching, but not immediately
    useEffect(() => {
        if (searchTerm) {
            // Use a timeout to allow the user to see the newly created customer briefly
            const timer = setTimeout(() => {
                setRecentlyCreatedCustomer(null);
                setRecentlyCreatedCustomerId(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    /**
     * Handle selecting a customer from the list
     * Sets the selected customer ID and clears the search term
     * @param customerId - The ID of the customer to select
     */
    const handleSelectCustomer = (customerId: string) => {
        console.log('Selecting customer with ID:', customerId);
        onChange(customerId);
        setSearchTerm(''); // Clear search when customer is selected

        // If the selected customer is the recently created one, keep it highlighted for a bit longer
        if (customerId === recentlyCreatedCustomerId) {
            console.log('Selected customer is the recently created one');
        }
    };

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

            console.log('Created customer:', createdCustomer);

            // The API should now return a properly formatted customer with id field
            const customerId = createdCustomer.id;
            console.log('Customer ID:', customerId);

            // Store the customer object directly for immediate display
            const customerObject: Customer = {
                id: customerId,
                name: newCustomer.name,
                phone: newCustomer.phone,
                email: newCustomer.email || '',
                address: newCustomer.address || '',
                purchases: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setRecentlyCreatedCustomer(customerObject);
            setRecentlyCreatedCustomerId(customerId);
            console.log('Set recently created customer:', customerObject);
            console.log('Set recently created customer ID:', customerId);

            onChange(customerId);
            setShowNewCustomerForm(false);
            setNewCustomer({ name: '', phone: '', email: '', address: '' });
            setSearchTerm(''); // Clear search term

            // Auto-clear the "new" status after 30 seconds (increased for usability)
            setTimeout(() => {
                console.log('Clearing recently created customer status');
                setRecentlyCreatedCustomer(null);
                setRecentlyCreatedCustomerId(null);
            }, 30000);
        } catch (error) {
            console.error('Error creating customer:', error);
            notify.error('Failed to create customer. Please try again.');
        }
    };

    /**
     * Find the currently selected customer from the customers list or fetched data
     * Returns null if no customer is selected or customers aren't loaded
     */
    const selectedCustomer = React.useMemo(() => {
        if (!value) return null;
        // First try to find in current customer list
        const customerInList = customers.find((c) => c.id === value);
        if (customerInList) return customerInList;
        // If not found in list, use the individually fetched customer data
        return selectedCustomerData || null;
    }, [value, customers, selectedCustomerData]);

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
                                Search and select a customer or create a new
                                one. Newly created customers appear at the top.
                            </div>
                            <div className="max-h-48 overflow-y-auto border rounded-md">
                                {isLoading ? (
                                    <div className="p-2 text-center text-gray-500">
                                        {debouncedSearchTerm
                                            ? `Searching for "${debouncedSearchTerm}"...`
                                            : 'Loading customers...'}
                                    </div>
                                ) : customers.length === 0 ? (
                                    <div className="p-2 text-center text-gray-500">
                                        {searchTerm
                                            ? `No customers found for "${searchTerm}"`
                                            : 'No customers found'}
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
                                                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                                    customer.id ===
                                                    recentlyCreatedCustomerId
                                                        ? 'bg-green-50 border-l-4 border-green-500'
                                                        : ''
                                                }`}
                                            >
                                                <div className="font-medium flex items-center">
                                                    {customer.name}
                                                    {customer.id ===
                                                        recentlyCreatedCustomerId && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {customer.phone}
                                                </div>
                                            </li>
                                        ))}
                                        {data?.customers &&
                                            data.customers.length > 5 && (
                                                <li className="p-2 text-center text-sm text-gray-500 italic">
                                                    {data.customers.length - 5}{' '}
                                                    more customers available -
                                                    refine your search
                                                </li>
                                            )}
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
