import React from 'react';
import { FaTrash, FaFilter } from 'react-icons/fa';

interface UserActivityHeaderProps {
    canAccessSystemFeatures: boolean;
    cleanupPending: boolean;
    showFilters: boolean;
    onCleanup: () => void;
    onToggleFilters: () => void;
}

export const UserActivityHeader: React.FC<UserActivityHeaderProps> = ({
    canAccessSystemFeatures,
    cleanupPending,
    showFilters,
    onCleanup,
    onToggleFilters,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    User Activity Tracker
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Monitor user actions, sessions, and system performance.
                </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
                {canAccessSystemFeatures && (
                    <button
                        onClick={onCleanup}
                        disabled={cleanupPending}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                        <FaTrash className="mr-2" />
                        {cleanupPending ? 'Cleaning...' : 'Cleanup Old Records'}
                    </button>
                )}
                <button
                    onClick={onToggleFilters}
                    className="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    <FaFilter className="mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>
        </div>
    );
};
