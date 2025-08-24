import React from 'react';
import {
    FiMoreVertical,
    FiFilter,
    FiRefreshCw,
    FiPlay,
    FiDownload,
    FiBell,
} from 'react-icons/fi';
import { UserRole, type User } from '../../types/auth.types';
import type { ExpiryDrug } from '../../types/expiry.types';

interface ExpiryPageActionsProps {
    user: User | null;
    showActionsDropdown: boolean;
    onToggleActionsDropdown: () => void;
    onToggleFilters: () => void;
    onRefresh: () => void;
    onTriggerNotifications: () => void;
    onExport: () => void;
    onToggleNotifications: () => void;
    isLoading: boolean;
    isTriggering: boolean;
    expiringDrugs: ExpiryDrug[];
    unreadNotifications: number;
    actionsDropdownRef: React.RefObject<HTMLDivElement>;
}

export const ExpiryPageActions: React.FC<ExpiryPageActionsProps> = ({
    user,
    showActionsDropdown,
    onToggleActionsDropdown,
    onToggleFilters,
    onRefresh,
    onTriggerNotifications,
    onExport,
    onToggleNotifications,
    isLoading,
    isTriggering,
    expiringDrugs,
    unreadNotifications,
    actionsDropdownRef,
}) => {
    return (
        <>
            {/* Dropdown for md and below */}
            <div className="lg:hidden relative" ref={actionsDropdownRef}>
                <button
                    onClick={onToggleActionsDropdown}
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
                                    onToggleFilters();
                                    onToggleActionsDropdown();
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
                                    onRefresh();
                                    onToggleActionsDropdown();
                                }}
                                disabled={isLoading}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <FiRefreshCw
                                    className={`h-4 w-4 mr-3 ${
                                        isLoading ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </button>

                            {/* Trigger Expiry Notifications option (Admin only) */}
                            {user?.role === UserRole.ADMIN && (
                                <button
                                    onClick={() => {
                                        onTriggerNotifications();
                                        onToggleActionsDropdown();
                                    }}
                                    disabled={isTriggering}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <FiPlay
                                        className={`h-4 w-4 mr-3 ${
                                            isTriggering ? 'animate-spin' : ''
                                        }`}
                                    />
                                    {isTriggering
                                        ? 'Processing...'
                                        : 'Create Notifications'}
                                </button>
                            )}

                            {/* Export option */}
                            <button
                                onClick={() => {
                                    onExport();
                                    onToggleActionsDropdown();
                                }}
                                disabled={
                                    !expiringDrugs || expiringDrugs.length === 0
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <FiDownload className="h-4 w-4 mr-3" />
                                Export
                            </button>

                            {/* Notifications option */}
                            <button
                                onClick={() => {
                                    onToggleNotifications();
                                    onToggleActionsDropdown();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                            >
                                <FiBell className="h-4 w-4 mr-3" />
                                Notifications
                                {unreadNotifications > 0 && (
                                    <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadNotifications > 9
                                            ? '9+'
                                            : unreadNotifications}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Inline actions for large screens - only icon buttons, compact, no extra text */}
            <div className="hidden lg:flex gap-4">
                <button
                    onClick={onToggleFilters}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                    aria-label="Filter"
                >
                    <FiFilter className="h-5 w-5" />
                </button>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    aria-label="Refresh"
                >
                    <FiRefreshCw
                        className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                    />
                </button>
                {user?.role === UserRole.ADMIN && (
                    <button
                        onClick={onTriggerNotifications}
                        disabled={isTriggering}
                        className="flex items-center px-4 py-2 border border-blue-400 rounded-md bg-white text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
                        aria-label="Create Notifications"
                    >
                        <FiPlay
                            className={`h-5 w-5 ${
                                isTriggering ? 'animate-spin' : ''
                            }`}
                        />
                    </button>
                )}
                <button
                    onClick={onExport}
                    disabled={!expiringDrugs || expiringDrugs.length === 0}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    aria-label="Export"
                >
                    <FiDownload className="h-5 w-5" />
                </button>
                <button
                    onClick={onToggleNotifications}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors relative"
                    aria-label="Notifications"
                >
                    <FiBell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadNotifications > 9
                                ? '9+'
                                : unreadNotifications}
                        </span>
                    )}
                </button>
            </div>
        </>
    );
};

export default ExpiryPageActions;
