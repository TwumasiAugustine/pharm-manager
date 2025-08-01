import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaHome } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';

const NotFoundPage: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 mb-8">
                        <FaExclamationCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        404
                    </h1>
                    <h2 className="text-2xl font-medium text-gray-700 mb-6">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        We're sorry, but the page you are looking for doesn't
                        exist or has been moved.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaHome className="mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NotFoundPage;
