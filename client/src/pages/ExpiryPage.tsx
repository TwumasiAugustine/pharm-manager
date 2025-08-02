import React, { useState } from 'react';
import { FiBell, FiRefreshCw, FiDownload, FiFilter } from 'react-icons/fi';
import { useExpiry } from '../hooks/useExpiry';
import { useSafeNotify } from '../utils/useSafeNotify';
import { ExpiryStatsCards } from '../components/molecules/ExpiryStatsCards';
import { ExpiryFilter } from '../components/molecules/ExpiryFilter';
import { ExpiryDrugsList } from '../components/molecules/ExpiryDrugsList';
import { NotificationPanel } from '../components/molecules/NotificationPanel';
import DashboardLayout from '../layouts/DashboardLayout';
import type { ExpiryFilters } from '../types/expiry.types';

export const ExpiryPage: React.FC = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const notify = useSafeNotify();
    const [filters, setFilters] = useState<ExpiryFilters>({
        daysRange: 30,
        alertLevel: undefined,
        category: '',
    });

    const {
        expiringDrugs,
        expiryStats,
        notifications,
        isLoading: drugsLoading,
        isStatsLoading,
        refreshData,
    } = useExpiry(filters);

    // Defensive programming: ensure notifications is an array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadNotifications = safeNotifications.filter(
        (n) => !n.isRead,
    ).length;

    const handleFilterChange = (newFilters: ExpiryFilters) => {
        setFilters(newFilters);
    };

    const handleExportData = () => {
        if (!expiringDrugs || expiringDrugs.length === 0) {
            notify.warning('No data to export');
            return;
        }

        // Create CSV content
        const headers = [
            'Drug Name',
            'Brand',
            'Category',
            'Batch Number',
            'Expiry Date',
            'Days Until Expiry',
            'Quantity',
            'Price',
            'Total Value',
            'Alert Level',
        ];

        const csvContent = [
            headers.join(','),
            ...expiringDrugs.map((drug) =>
                [
                    `"${drug.drugName}"`,
                    `"${drug.brand}"`,
                    `"${drug.category}"`,
                    `"${drug.batchNumber}"`,
                    `"${drug.expiryDate}"`,
                    drug.daysUntilExpiry,
                    drug.quantity,
                    drug.price,
                    (drug.quantity * drug.price).toFixed(2),
                    `"${drug.alertLevel}"`,
                ].join(','),
            ),
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expiry-report-${
            new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Expiry Tracker
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Monitor drug expiration dates and manage
                                    inventory alerts
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FiFilter className="h-4 w-4 mr-2" />
                                    Filters
                                </button>

                                {/* Refresh button */}
                                <button
                                    onClick={() => refreshData()}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    disabled={drugsLoading}
                                >
                                    <FiRefreshCw
                                        className={`h-4 w-4 mr-2 ${
                                            drugsLoading ? 'animate-spin' : ''
                                        }`}
                                    />
                                    Refresh
                                </button>

                                {/* Export button */}
                                <button
                                    onClick={handleExportData}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    disabled={
                                        !expiringDrugs ||
                                        expiringDrugs.length === 0
                                    }
                                >
                                    <FiDownload className="h-4 w-4 mr-2" />
                                    Export
                                </button>

                                {/* Notifications button */}
                                <button
                                    onClick={() =>
                                        setShowNotifications(!showNotifications)
                                    }
                                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <FiBell className="h-4 w-4 mr-2" />
                                    Notifications
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadNotifications > 9
                                                ? '9+'
                                                : unreadNotifications}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Filters (Desktop) / Collapsible (Mobile) */}
                        <div
                            className={`lg:col-span-1 ${
                                showFilters ? 'block' : 'hidden sm:block'
                            }`}
                        >
                            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                                <ExpiryFilter
                                    filters={filters}
                                    onFiltersChange={handleFilterChange}
                                    className="lg:mb-0 mb-6"
                                />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Stats Cards */}
                            <ExpiryStatsCards
                                stats={
                                    expiryStats || {
                                        totalExpiredDrugs: 0,
                                        totalCriticalDrugs: 0,
                                        totalWarningDrugs: 0,
                                        totalNoticeDrugs: 0,
                                        totalValue: 0,
                                        expiredValue: 0,
                                        criticalValue: 0,
                                        upcomingExpiries: {
                                            next7Days: 0,
                                            next30Days: 0,
                                            next60Days: 0,
                                            next90Days: 0,
                                        },
                                    }
                                }
                                isLoading={isStatsLoading}
                            />

                            {/* Drugs List */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-4 sm:p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Expiring Drugs
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {expiringDrugs?.length || 0}{' '}
                                                drugs found
                                                {filters.alertLevel && (
                                                    <span className="ml-1">
                                                        ({filters.alertLevel}{' '}
                                                        alerts)
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Results summary */}
                                        <div className="text-sm text-gray-500">
                                            Showing results for next{' '}
                                            {filters.daysRange || 30} days
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <ExpiryDrugsList
                                        drugs={expiringDrugs || []}
                                        isLoading={drugsLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Panel */}
                <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    className="lg:fixed lg:top-20 lg:right-6 lg:w-96 lg:z-40"
                />
            </div>
        </DashboardLayout>
    );
};

export default ExpiryPage;
