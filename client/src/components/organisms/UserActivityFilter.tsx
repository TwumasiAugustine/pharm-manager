import React, { useState, useMemo } from 'react';
import {
    FaFilter,
    FaCheck,
    FaEye,
    FaUser,
    FaCalendarAlt,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaTimes,
} from 'react-icons/fa';
import type { UserActivityFilters } from '../../types/user-activity.types';
import { useDebounceFunction } from '../../hooks/useDebounceFunction';

interface UserActivityFilterProps {
    filters: UserActivityFilters;
    onFilterChange: (filters: Partial<UserActivityFilters>) => void;
    isLoading: boolean;
    className?: string;
    isCollapsible?: boolean;
}

export const UserActivityFilter: React.FC<UserActivityFilterProps> = ({
    filters,
    onFilterChange,
    isLoading,
    className = '',
    isCollapsible = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(!isCollapsible);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Fixed debounced handlers for text inputs
    const debouncedTextChange = useDebounceFunction(
        (updatedFilters: Partial<UserActivityFilters>) => {
            onFilterChange({
                ...updatedFilters,
                page: 1, // Always reset to page 1 when filtering
            });
        },
        500
    );

    // Memoized active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.userId) count++;
        if (filters.sessionId) count++;
        if (filters.activityType) count++;
        if (filters.resource) count++;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        if (filters.userRole) count++;
        if (filters.ipAddress) count++;
        if (filters.isActive !== undefined) count++;
        return count;
    }, [filters]);

    // Quick filter presets
    const quickFilters = [
        {
            label: 'Today',
            filters: {
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
            },
        },
        {
            label: 'Last 7 Days',
            filters: {
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
            },
        },
        {
            label: 'Login Activities',
            filters: { activityType: 'LOGIN' as const },
        },
        {
            label: 'User Management',
            filters: { resource: 'USER' as const },
        },
        {
            label: 'Sale Activities',
            filters: { resource: 'SALE' as const },
        },
    ];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        // Convert empty strings to undefined for enum properties
        const processedValue =
            (name === 'activityType' || name === 'resource' || name === 'userRole') && value === ''
                ? undefined
                : value;

        // Use debounced handler for text inputs (userId, sessionId, ipAddress)
        if (name === 'userId' || name === 'sessionId' || name === 'ipAddress') {
            debouncedTextChange({ [name]: processedValue, page: 1 });
        } else {
            // Immediate update for select fields
            onFilterChange({
                [name]: processedValue,
                page: 1,
            });
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            [name]: value || undefined,
            page: 1,
        });
    };

    const clearFilters = () => {
        onFilterChange({
            userId: undefined,
            sessionId: undefined,
            activityType: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            ipAddress: undefined,
            userRole: undefined,
            isActive: undefined,
            page: 1,
        });
    };

    const applyQuickFilter = (quickFilterData: (typeof quickFilters)[0]) => {
        // Reset all filters and apply only the quick filter data
        onFilterChange({
            userId: undefined,
            sessionId: undefined,
            activityType: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            ipAddress: undefined,
            userRole: undefined,
            isActive: undefined,
            page: 1,
            ...quickFilterData.filters,
        });
    };

    const hasAnyFilters = activeFilterCount > 0;

    return (
        <div
            className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
        >
            {/* Header */}
            <div
                className={`p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ${
                    isCollapsible ? 'cursor-pointer hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100' : ''
                }`}
                onClick={
                    isCollapsible ? () => setIsExpanded(!isExpanded) : undefined
                }
            >
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaFilter className="text-blue-500 h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Activity Filters
                                </h3>
                                <p className="text-sm text-gray-600 hidden sm:block">
                                    Filter and search user activities
                                </p>
                            </div>
                        </div>
                        {activeFilterCount > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    {activeFilterCount} active
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between lg:justify-end space-x-2">
                        {hasAnyFilters && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFilters();
                                }}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105"
                                title="Clear all filters"
                            >
                                <FaTimes className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        )}
                        {isCollapsible && (
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                {isExpanded ? (
                                    <FaChevronUp className="h-4 w-4" />
                                ) : (
                                    <FaChevronDown className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                    {/* Quick Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                                <FaCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Quick Filters
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {quickFilters.map((quickFilter, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyQuickFilter(quickFilter)}
                                    disabled={isLoading}
                                    className="group relative inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-blue-100 hover:to-blue-50 hover:text-blue-800 transition-all duration-200 border border-gray-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                    <span className="truncate leading-none">{quickFilter.label}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Primary Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <FaFilter className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Main Filters
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {/* Activity Type */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="activityType"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FaEye className="mr-2 h-4 w-4 text-blue-500" />
                                    Activity Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="activityType"
                                        name="activityType"
                                        value={filters.activityType || ''}
                                        onChange={handleInputChange}
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Activities</option>
                                        <option value="LOGIN">🔑 Login</option>
                                        <option value="LOGOUT">🚪 Logout</option>
                                        <option value="CREATE">➕ Create</option>
                                        <option value="UPDATE">📝 Update</option>
                                        <option value="DELETE">🗑️ Delete</option>
                                        <option value="VIEW">👁️ View</option>
                                        <option value="DOWNLOAD">⬇️ Download</option>
                                        <option value="SEARCH">🔍 Search</option>
                                    </select>
                                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Resource */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="resource"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FaSearch className="mr-2 h-4 w-4 text-purple-500" />
                                    Resource Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="resource"
                                        name="resource"
                                        value={filters.resource || ''}
                                        onChange={handleInputChange}
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Resources</option>
                                        <option value="USER">👤 User</option>
                                        <option value="DRUG">💊 Drug</option>
                                        <option value="SALE">💰 Sale</option>
                                        <option value="CUSTOMER">👥 Customer</option>
                                        <option value="BRANCH">🏢 Branch</option>
                                        <option value="REPORT">📊 Report</option>
                                        <option value="EXPIRY">⚠️ Expiry</option>
                                        <option value="SYSTEM">⚙️ System</option>
                                        <option value="DASHBOARD">📈 Dashboard</option>
                                    </select>
                                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* User Role */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="userRole"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FaUser className="mr-2 h-4 w-4 text-indigo-500" />
                                    User Role
                                </label>
                                <div className="relative">
                                    <select
                                        id="userRole"
                                        name="userRole"
                                        value={filters.userRole || ''}
                                        onChange={handleInputChange}
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="super_admin">🔑 Super Admin</option>
                                        <option value="admin">👑 Admin</option>
                                        <option value="pharmacist">💊 Pharmacist</option>
                                        <option value="cashier">💳 Cashier</option>
                                    </select>
                                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                <FaCalendarAlt className="h-4 w-4 text-purple-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Date Range
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="startDate"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FaCalendarAlt className="mr-2 h-4 w-4 text-green-500" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={
                                        filters.startDate
                                            ? filters.startDate.split('T')[0]
                                            : ''
                                    }
                                    onChange={handleDateChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="endDate"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FaCalendarAlt className="mr-2 h-4 w-4 text-red-500" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={
                                        filters.endDate
                                            ? filters.endDate.split('T')[0]
                                            : ''
                                    }
                                    onChange={handleDateChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
                        >
                            <FaSearch className="mr-2 h-4 w-4" />
                            Advanced Filters
                            {showAdvanced ? (
                                <FaChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                                <FaChevronDown className="ml-2 h-4 w-4" />
                            )}
                        </button>

                        {showAdvanced && (
                            <div className="p-4 lg:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <FaSearch className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-800">
                                        Advanced Search
                                    </h4>
                                    <div className="flex-1 border-t border-indigo-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                    {/* User ID */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="userId"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FaUser className="mr-2 h-4 w-4 text-blue-500" />
                                            User ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="userId"
                                                name="userId"
                                                value={filters.userId || ''}
                                                onChange={handleInputChange}
                                                placeholder="Enter user ID..."
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                            />
                                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Session ID */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="sessionId"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FaSearch className="mr-2 h-4 w-4 text-green-500" />
                                            Session ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="sessionId"
                                                name="sessionId"
                                                value={filters.sessionId || ''}
                                                onChange={handleInputChange}
                                                placeholder="Enter session ID..."
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                            />
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* IP Address */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="ipAddress"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FaEye className="mr-2 h-4 w-4 text-purple-500" />
                                            IP Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="ipAddress"
                                                name="ipAddress"
                                                value={filters.ipAddress || ''}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 192.168.1.1"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                            />
                                            <FaEye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Active Sessions */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="isActive"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FaCheck className="mr-2 h-4 w-4 text-indigo-500" />
                                            Session Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="isActive"
                                                name="isActive"
                                                value={
                                                    filters.isActive === undefined
                                                        ? ''
                                                        : filters.isActive.toString()
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value === ''
                                                            ? undefined
                                                            : e.target.value === 'true';
                                                    onFilterChange({
                                                        isActive: value,
                                                        page: 1,
                                                    });
                                                }}
                                                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                            >
                                                <option value="">All Sessions</option>
                                                <option value="true">🟢 Active Sessions</option>
                                                <option value="false">🔴 Inactive Sessions</option>
                                            </select>
                                            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    onClick={clearFilters}
                                    disabled={isLoading || !hasAnyFilters}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-red-300 rounded-xl shadow-sm text-sm font-semibold text-red-700 bg-gradient-to-r from-white to-red-50 hover:from-red-50 hover:to-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                >
                                    <FaTimes className="mr-2 h-4 w-4" />
                                    Clear All Filters
                                </button>

                                {activeFilterCount > 0 && (
                                    <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                        <FaFilter className="mr-2 h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-700">
                                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
