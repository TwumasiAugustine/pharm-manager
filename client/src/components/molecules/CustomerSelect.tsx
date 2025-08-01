import React, { useState } from 'react';
import { useCustomers, useCreateCustomer } from '../../hooks/useCustomers';
import type { Customer } from '../../types/customer.types';

interface CustomerSelectProps {
    onChange: (customerId: string | undefined) => void;
    value?: string;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
    onChange,
    value,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    // Fetch customers with search
    const { data, isLoading } = useCustomers({
        page: 1,
        limit: 10,
    });

    // Mutation for creating new customer
    const createCustomer = useCreateCustomer();

    // Filter customers based on search term
    const filteredCustomers = React.useMemo(() => {
        if (!data?.customers) return [];
        if (!searchTerm) return data.customers;

        return data.customers.filter(
            (customer) =>
                customer.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm),
        );
    }, [data?.customers, searchTerm]);

    const handleSelectCustomer = (customerId: string) => {
        onChange(customerId);
    };

    const handleCreateNewCustomer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCustomer.name || !newCustomer.phone) {
            alert('Name and phone are required');
            return;
        }

        try {
            const createdCustomer = await createCustomer.mutateAsync({
                name: newCustomer.name,
                phone: newCustomer.phone,
                email: newCustomer.email,
                address: newCustomer.address,
            });

            onChange(createdCustomer.id);
            setShowNewCustomerForm(false);
            setNewCustomer({ name: '', phone: '', email: '', address: '' });
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };

    // Find selected customer
    const selectedCustomer = React.useMemo(() => {
        if (!value || !data?.customers) return null;
        return data.customers.find((c) => c.id === value);
    }, [value, data?.customers]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
            </label>

            {showNewCustomerForm ? (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-semibold mb-2">New Customer</h3>
                    <form onSubmit={handleCreateNewCustomer}>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs">Name *</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={(e) =>
                                        setNewCustomer({
                                            ...newCustomer,
                                            name: e.target.value,
                                        })
                                    }
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
                                    className="w-full px-3 py-1 border rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewCustomerForm(false)
                                    }
                                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={createCustomer.isPending}
                                >
                                    {createCustomer.isPending
                                        ? 'Saving...'
                                        : 'Save Customer'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search customers..."
                            className="flex-1 px-3 py-1 border rounded"
                        />
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
                        <div className="max-h-48 overflow-y-auto border rounded-md">
                            {isLoading ? (
                                <div className="p-2 text-center text-gray-500">
                                    Loading customers...
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="p-2 text-center text-gray-500">
                                    No customers found
                                </div>
                            ) : (
                                <ul className="divide-y">
                                    {filteredCustomers.map((customer) => (
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
                    )}
                </div>
            )}
        </div>
    );
};
