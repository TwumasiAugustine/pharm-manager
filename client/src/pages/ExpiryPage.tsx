import React, { useState, useRef, useEffect } from 'react';
import {
    FiBell,
    FiRefreshCw,
    FiDownload,
    FiFilter,
    FiMoreVertical
} from 'react-icons/fi';
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
    const [showFilters, setShowFilters] = useState(false); // Changed default to false for mobile-first
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const [filters, setFilters] = useState<ExpiryFilters>({
        daysRange: 30,
        alertLevel: undefined,
        category: '',
    });

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // For desktop filter dropdown
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node) &&
                window.innerWidth >= 640 // Only for desktop (sm breakpoint)
            ) {
                setShowFilters(false);
            }

            // For mobile, close filter when clicking outside any filter-related element
            if (window.innerWidth < 640 && showFilters) {
                const target = event.target as Element;
                const isFilterButton = target.closest('[data-filter-trigger]');
                const isFilterPanel = target.closest('[data-filter-panel]');

                if (!isFilterButton && !isFilterPanel) {
                    setShowFilters(false);
                }
            }

            // For actions dropdown
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        };

        if (showFilters || showActionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters, showActionsDropdown]);

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
            <div className="min-h-full bg-gray-50 -m-4 sm:-m-6">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 sm:px-6 lg:px-8">
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

                            <div className="flex items-center gap-3 flex-wrap justify-end sm:justify-start">
                                {/* Desktop view - show all buttons */}
                                <div className="hidden sm:flex items-center gap-3">
                                    {/* Filter dropdown toggle */}
                                    <div
                                        className="relative"
                                        ref={filterDropdownRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setShowFilters(!showFilters)
                                            }
                                            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                                                showFilters
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <FiFilter className="h-4 w-4 mr-2" />
                                            Filter
                                        </button>

                                        {/* Filter dropdown panel */}
                                        {showFilters && (
                                            /* Dropdown panel */
                                            <div className="absolute top-full right-0 mt-2 w-80 lg:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            Filter Options
                                                        </h3>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowFilters(
                                                                    false,
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                                                        >
                                                            <FiFilter className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Clear Filters
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <ExpiryFilter
                                                        filters={filters}
                                                        onFiltersChange={
                                                            handleFilterChange
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Refresh button */}
                                    <button
                                        onClick={() => refreshData()}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        disabled={drugsLoading}
                                    >
                                        <FiRefreshCw
                                            className={`h-4 w-4 mr-2 ${
                                                drugsLoading
                                                    ? 'animate-spin'
                                                    : ''
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
                                            setShowNotifications(
                                                !showNotifications,
                                            )
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

                                {/* Mobile view - Actions dropdown */}
                                <div
                                    className="sm:hidden relative"
                                    ref={actionsDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setShowActionsDropdown(
                                                !showActionsDropdown,
                                            )
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="mr-2">Actions</span>
                                        <FiMoreVertical className="h-4 w-4" />
                                    </button>

                                    {/* Actions dropdown panel */}
                                    {showActionsDropdown && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                            <div className="py-1">
                                                {/* Filter option */}
                                                <button
                                                    onClick={() => {
                                                        setShowFilters(true);
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    data-filter-trigger
                                                >
                                                    <FiFilter className="h-4 w-4 mr-3" />
                                                    Filters
                                                </button>

                                                {/* Refresh option */}
                                                <button
                                                    onClick={() => {
                                                        refreshData();
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={drugsLoading}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiRefreshCw
                                                        className={`h-4 w-4 mr-3 ${
                                                            drugsLoading
                                                                ? 'animate-spin'
                                                                : ''
                                                        }`}
                                                    />
                                                    Refresh
                                                </button>

                                                {/* Export option */}
                                                <button
                                                    onClick={() => {
                                                        handleExportData();
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={
                                                        !expiringDrugs ||
                                                        expiringDrugs.length ===
                                                            0
                                                    }
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    <FiDownload className="h-4 w-4 mr-3" />
                                                    Export
                                                </button>

                                                {/* Notifications option */}
                                                <button
                                                    onClick={() => {
                                                        setShowNotifications(
                                                            !showNotifications,
                                                        );
                                                        setShowActionsDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                                                >
                                                    <FiBell className="h-4 w-4 mr-3" />
                                                    Notifications
                                                    {unreadNotifications >
                                                        0 && (
                                                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                            {unreadNotifications >
                                                            9
                                                                ? '9+'
                                                                : unreadNotifications}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filter dropdown panel for mobile */}
                                {showFilters && (
                                    <div
                                        className="sm:hidden fixed inset-x-0 top-32 mx-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
                                        data-filter-panel
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    Filter Options
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowFilters(false)
                                                    }
                                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                                                >
                                                    <FiFilter className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Close Filters
                                                    </span>
                                                </button>
                                            </div>
                                            <ExpiryFilter
                                                filters={filters}
                                                onFiltersChange={
                                                    handleFilterChange
                                                }
                                                className=""
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="space-y-6">
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
                            <div className="p-4 lg:p-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Expiring Drugs
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {expiringDrugs?.length || 0} drugs
                                            found
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

                            <div className="p-4 lg:p-6">
                                <ExpiryDrugsList
                                    drugs={expiringDrugs || []}
                                    isLoading={drugsLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Panel */}
                <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    className="fixed top-20 right-4 lg:right-6 w-80 lg:w-96 z-50"
                />
            </div>
        </DashboardLayout>
    );
};

export default ExpiryPage;
