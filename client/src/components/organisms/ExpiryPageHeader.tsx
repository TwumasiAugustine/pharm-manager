import React from 'react';
import {
    FiRefreshCw,
    FiDownload,
    FiFilter,
    FiBell,
    FiPlay,
} from 'react-icons/fi';
import { UserRole, type User } from '../../types/auth.types';
import type { ExpiryDrug } from '../../types/expiry.types';

interface ExpiryPageHeaderProps {
    user: User | null;
    onRefresh: () => void;
    onExport: () => void;
    onToggleFilters: () => void;
    onToggleNotifications: () => void;
    onTriggerNotifications: () => void;
    showFilters: boolean;
    isLoading: boolean;
    isTriggering: boolean;
    unreadNotifications: number;
    expiringDrugs: ExpiryDrug[];
    notificationsDropdownRef: React.RefObject<HTMLDivElement>;
}

export const ExpiryPageHeader: React.FC<ExpiryPageHeaderProps> = ({
    user,
    onRefresh,
    onExport,
    onToggleFilters,
    onToggleNotifications,
    onTriggerNotifications,
    showFilters,
    isLoading,
    isTriggering,
    unreadNotifications,
    expiringDrugs,
    notificationsDropdownRef,
}) => {
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Expiry Tracker
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Monitor drug expiration dates and manage inventory
                            alerts
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-end sm:justify-start">
                        {/* Desktop view - show all buttons */}
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Filter button */}
                            <button
                                onClick={onToggleFilters}
                                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                                    showFilters
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FiFilter className="h-4 w-4 mr-2" />
                                Filter
                            </button>

                            {/* Refresh button */}
                            <button
                                onClick={onRefresh}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                disabled={isLoading}
                            >
                                <FiRefreshCw
                                    className={`h-4 w-4 mr-2 ${
                                        isLoading ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </button>

                            {/* Trigger Expiry Notifications button (Admin only) */}
                            {user?.role === UserRole.ADMIN && (
                                <button
                                    onClick={onTriggerNotifications}
                                    disabled={isTriggering}
                                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiPlay
                                        className={`h-4 w-4 mr-2 ${
                                            isTriggering ? 'animate-spin' : ''
                                        }`}
                                    />
                                    {isTriggering
                                        ? 'Processing...'
                                        : 'Create Notifications'}
                                </button>
                            )}

                            {/* Export button */}
                            <button
                                onClick={onExport}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                disabled={
                                    !expiringDrugs || expiringDrugs.length === 0
                                }
                            >
                                <FiDownload className="h-4 w-4 mr-2" />
                                Export
                            </button>

                            {/* Notifications button with dropdown */}
                            <div
                                className="relative"
                                ref={notificationsDropdownRef}
                            >
                                <button
                                    onClick={onToggleNotifications}
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
            </div>
        </div>
    );
};

export default ExpiryPageHeader;
