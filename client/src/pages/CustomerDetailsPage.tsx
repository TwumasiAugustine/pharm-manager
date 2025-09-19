import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomers';
import DashboardLayout from '../layouts/DashboardLayout';
import type { Sale } from '../types/sale.types';
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaShoppingBag,
    FaArrowLeft,
    FaReceipt,
} from 'react-icons/fa';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';

// Type for purchase that can be either string ID or Sale object
type Purchase = string | Sale;

const CustomerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: customer, isLoading, isError } = useCustomer(id || '');

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.customerDetails,
        title: customer
            ? `${customer.name} - Customer Details`
            : 'Customer Details',
        canonicalPath: `/customers/${id}`,
    });

    if (isError) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                    <p className="text-red-600">
                        Failed to load customer details. Please try again later.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center">
                        <FaUser className="mr-2 text-blue-500" />
                        Customer Profile
                    </h1>
                    <Link
                        to="/customers"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Customers
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Customer Information
                            </h2>
                            {isLoading ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Skeleton for customer info */}
                                    <div className="animate-pulse">
                                        <div className="flex items-center mb-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
                                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="flex items-center mb-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
                                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="h-5 w-28 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="flex items-center mb-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
                                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="h-5 w-40 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="flex items-center mb-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
                                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ) : customer ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <FaUser className="mr-1 text-gray-400" />
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {customer.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <FaPhone className="mr-1 text-gray-400" />
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {customer.phone}
                                        </p>
                                    </div>
                                    {customer.email && (
                                        <div>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <FaEnvelope className="mr-1 text-gray-400" />
                                                Email
                                            </p>
                                            <p className="font-medium">
                                                {customer.email}
                                            </p>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                                Address
                                            </p>
                                            <p className="font-medium">
                                                {customer.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <FaShoppingBag className="mr-2 text-green-500" />
                                Purchase History
                            </h2>
                            {isLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="border rounded p-3 bg-gray-50"
                                        >
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : customer?.purchases &&
                              customer.purchases.length > 0 ? (
                                <div className="space-y-3">
                                    {(customer.purchases as Purchase[]).map(
                                        (purchase, index) => {
                                            // Handle both string IDs and Sale objects
                                            const purchaseId =
                                                typeof purchase === 'string'
                                                    ? purchase
                                                    : purchase._id ||
                                                      purchase.id ||
                                                      `purchase-${index}`;

                                            const saleObject =
                                                typeof purchase !== 'string'
                                                    ? purchase
                                                    : null;
                                            const purchaseDate =
                                                saleObject?.createdAt
                                                    ? new Date(
                                                          saleObject.createdAt,
                                                      ).toLocaleDateString()
                                                    : null;
                                            const totalAmount =
                                                saleObject?.totalAmount
                                                    ? `GH₵${Number(
                                                          saleObject.totalAmount,
                                                      ).toFixed(2)}`
                                                    : null;

                                            return (
                                                <div
                                                    key={purchaseId}
                                                    className="border rounded p-3 bg-gray-50"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                Purchase #
                                                                {index + 1}
                                                            </p>
                                                            <div className="text-sm text-gray-500 space-y-1">
                                                                <p>
                                                                    ID:{' '}
                                                                    {purchaseId}
                                                                </p>
                                                                {purchaseDate && (
                                                                    <p>
                                                                        Date:{' '}
                                                                        {
                                                                            purchaseDate
                                                                        }
                                                                    </p>
                                                                )}
                                                                {totalAmount && (
                                                                    <p>
                                                                        Total:{' '}
                                                                        {
                                                                            totalAmount
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/sales/${purchaseId}`,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                                                        >
                                                            <FaReceipt className="mr-1" />
                                                            View Receipt
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No purchase history available.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerDetailsPage;
