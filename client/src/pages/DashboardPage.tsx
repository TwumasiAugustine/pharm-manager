import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDrugs, useExpiringDrugs } from '../hooks/useDrugs';
import { useSales } from '../hooks/useSales';
import { useCustomers } from '../hooks/useCustomers';
import { Link, useNavigate } from 'react-router-dom';
import { FaPills, FaArrowRight, FaShoppingCart, FaUsers } from 'react-icons/fa';

const DashboardPage = () => {
    const { data: drugsData } = useDrugs({ limit: 1 });
    const { data: expiringDrugs } = useExpiringDrugs(30);
    const { data: salesData } = useSales({ limit: 1 });
    const { data: customersData } = useCustomers({ limit: 1 });
    const [totalProducts, setTotalProducts] = useState(0);
    const [expiringCount, setExpiringCount] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (drugsData?.totalCount !== undefined) {
            setTotalProducts(drugsData.totalCount);
        }
        if (expiringDrugs) {
            setExpiringCount(expiringDrugs.length);
        }
        if (salesData?.pagination?.total !== undefined) {
            setTotalSales(salesData.pagination.total);
        }
        if (customersData?.totalCount !== undefined) {
            setTotalCustomers(customersData.totalCount);
        }
    }, [drugsData, expiringDrugs, salesData, customersData]);

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                    Welcome to Pharmacy Management System
                </h2>
                <p className="mb-6">
                    This dashboard displays key metrics and information about
                    your pharmacy inventory.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Link to="/sales" className="block">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                            <h3 className="font-medium text-blue-700">
                                Total Sales
                            </h3>
                            <p className="text-2xl font-bold">
                                ${totalSales.toFixed(2)}
                            </p>
                        </div>
                    </Link>

                    <Link to="/drugs" className="block">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                            <h3 className="font-medium text-green-700">
                                Products
                            </h3>
                            <p className="text-2xl font-bold">
                                {totalProducts}
                            </p>
                        </div>
                    </Link>

                    <Link to="/customers" className="block">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                            <h3 className="font-medium text-purple-700">
                                Customers
                            </h3>
                            <p className="text-2xl font-bold">
                                {totalCustomers}
                            </p>
                        </div>
                    </Link>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="font-medium text-yellow-700">
                            Expiring Soon
                        </h3>
                        <p className="text-2xl font-bold">{expiringCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium flex items-center">
                                <FaPills className="mr-2 text-blue-500" />
                                Drug Inventory Management
                            </h3>
                            <button
                                onClick={() => navigate('/drugs')}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                            >
                                Manage Inventory{' '}
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                        <p className="text-gray-600">
                            Add, update, or remove drugs from your inventory.
                            Track quantities, expiry dates, and pricing
                            information to ensure your pharmacy is well-stocked.
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium flex items-center">
                                <FaShoppingCart className="mr-2 text-green-500" />
                                Sales & Billing
                            </h3>
                            <button
                                onClick={() => navigate('/sales')}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
                            >
                                Manage Sales <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                        <p className="text-gray-600">
                            Create new sales, view sales history, and generate
                            invoices. Easily manage your pharmacy's financial
                            transactions and track revenue.
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium flex items-center">
                                <FaUsers className="mr-2 text-purple-500" />
                                Customer Management
                            </h3>
                            <button
                                onClick={() => navigate('/customers')}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center"
                            >
                                Manage Customers{' '}
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                        <p className="text-gray-600">
                            Track customer information, purchase history, and
                            preferences. Build stronger relationships with your
                            customers and improve customer retention with
                            personalized service.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
