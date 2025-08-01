import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomers';
import { Table } from '../components/molecules/Table';
import type { TableColumn } from '../components/molecules/Table';
import type { Sale } from '../types/sale.types';

const CustomerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: customer, isLoading, isError } = useCustomer(id || '');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                <p className="text-red-600">
                    Failed to load customer details. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customer Profile</h1>
                <Link
                    to="/customers"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                    Back to Customers
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Customer Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{customer.phone}</p>
                            </div>
                            {customer.email && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {customer.email}
                                    </p>
                                </div>
                            )}
                            {customer.address && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Address
                                    </p>
                                    <p className="font-medium">
                                        {customer.address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Purchase History
                        </h2>
                        {customer.purchases && customer.purchases.length > 0 ? (
                            <Table<Sale>
                                data={customer.purchases}
                                columns={
                                    [
                                        {
                                            header: 'Date',
                                            accessor: 'createdAt',
                                            cell: (value) =>
                                                new Date(
                                                    value,
                                                ).toLocaleDateString(),
                                        },
                                        {
                                            header: 'Total Amount',
                                            accessor: 'totalAmount',
                                            cell: (value) =>
                                                `$${Number(value).toFixed(2)}`,
                                        },
                                        {
                                            header: 'Items',
                                            accessor: 'items',
                                            cell: (value) => value.length,
                                        },
                                        {
                                            header: 'Payment',
                                            accessor: 'paymentMethod',
                                            cell: (value) =>
                                                value.charAt(0).toUpperCase() +
                                                value.slice(1),
                                        },
                                    ] as TableColumn<Sale>[]
                                }
                                actions={[
                                    {
                                        label: 'View Details',
                                        onClick: (sale: Sale) => {
                                            window.location.href = `/sales/receipt/${sale.id}`;
                                        },
                                    },
                                ]}
                            />
                        ) : (
                            <p className="text-gray-500">
                                No purchase history available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsPage;
