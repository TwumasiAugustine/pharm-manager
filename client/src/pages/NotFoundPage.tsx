import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaHome } from 'react-icons/fa';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';

const NotFoundPage: React.FC = () => {
    // Generate SEO metadata for the 404 page
    const seoData = useSEO({
        ...SEO_PRESETS.notFound,
        structuredDataType: 'WebApplication',
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            {/* Header with PharmCare branding */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                PharmCare
                            </h1>
                            <span className="ml-2 text-sm text-gray-600">
                                Modern Pharmacy Management System
                            </span>
                        </div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                            <FaHome className="mr-1" /> Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-md mx-auto">
                    <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 mb-8">
                        <FaExclamationCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">
                        404
                    </h1>
                    <h2 className="text-2xl font-medium text-gray-700 mb-6">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        We're sorry, but the page you are looking for doesn't
                        exist or has been moved.
                    </p>
                    <div className="space-y-4">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <FaHome className="mr-2" /> Back to Dashboard
                        </Link>
                        <div className="text-sm text-gray-500">
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Sign in
                            </Link>
                            {' • '}
                            <Link
                                to="/"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">
                            Secure • Reliable • Efficient
                        </p>
                        <p className="text-xs text-gray-400">
                            © 2025 PharmCare. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NotFoundPage;
