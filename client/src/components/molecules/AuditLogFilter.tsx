import React, { useState, useMemo } from 'react';
import {
    FiCalendar,
    FiFilter,
    FiRefreshCw,
    FiTrash2,
    FiChevronDown,
    FiChevronUp,
    FiUser,
    FiHome,
    FiMapPin,
    FiCheck,
    FiSearch,
    FiX,
    FiClock,
    FiSettings,
} from 'react-icons/fi';
import type { AuditLogFilters } from '../../types/audit-log.types';
import { useDebounceFunction } from '../../hooks/useDebounceFunction';
import { useBranches } from '../../hooks/useBranches';
interface AuditLogFilterProps {
    filters: AuditLogFilters;
    onFiltersChange: (filters: AuditLogFilters) => void;
    onRefresh: () => void;
    onCleanup?: () => void;
    isLoading?: boolean;
    className?: string;
    isCollapsible?: boolean;
}

export const AuditLogFilter: React.FC<AuditLogFilterProps> = ({
    filters,
    onFiltersChange,
    onRefresh,
    onCleanup,
    isLoading = false,
    className = '',
    isCollapsible = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get pharmacy and branch data for filters
    const { data: branches } = useBranches();

    // Debounced filter changes - fix the function to properly handle updates
    const debouncedFilterChange = useDebounceFunction(
        (updatedFilters: Partial<AuditLogFilters>) => {
            onFiltersChange({
                ...filters,
                ...updatedFilters,
                page: 1, // Reset to first page when filters change
            });
        },
        300,
    );

    const handleFilterChange = (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => {
        // Convert empty strings to undefined
        const processedValue = value === '' ? undefined : value;

        // For immediate UI feedback, update filters directly for certain fields
        if (
            key === 'action' ||
            key === 'resource' ||
            key === 'userRole' ||
            key === 'pharmacyId' ||
            key === 'branchId' ||
            key === 'startDate' ||
            key === 'endDate'
        ) {
            onFiltersChange({
                ...filters,
                [key]: processedValue,
                page: 1,
            });
        } else {
            // Use debounced function for text inputs
            debouncedFilterChange({ [key]: processedValue });
        }
    };

    // Enhanced quick filter presets
    const quickFilters = useMemo(
        () => [
            {
                label: 'Today',
                icon: <FiClock className="h-3 w-3" />,
                filters: {
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Last 7 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Last 30 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                },
            },
            {
                label: 'Login Activities',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    action: 'LOGIN' as const,
                },
            },
            {
                label: 'User Management',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    resource: 'USER' as const,
                },
            },
            {
                label: 'Sales Activities',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SALE' as const,
                },
            },
            {
                label: 'System Changes',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SYSTEM' as const,
                },
            },
        ],
        [],
    );
    const applyQuickFilter = (quickFilterData: Partial<AuditLogFilters>) => {
        // Reset all filters and apply only the quick filter data
        onFiltersChange({
            userId: undefined,
            pharmacyId: undefined,
            branchId: undefined,
            action: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            userRole: undefined,
            page: 1,
            limit: filters.limit || 20,
            ...quickFilterData,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            userId: undefined,
            pharmacyId: undefined,
            branchId: undefined,
            action: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            userRole: undefined,
            page: 1,
            limit: filters.limit || 20,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.userId ||
            filters.pharmacyId ||
            filters.branchId ||
            filters.action ||
            filters.resource ||
            filters.startDate ||
            filters.endDate ||
            filters.userRole
        );
    }, [filters]);

    const activeFilterCount = useMemo(() => {
        return Object.entries(filters).filter(
            ([key, value]) => value && key !== 'page' && key !== 'limit',
        ).length;
    }, [filters]);

    return (
        <div
            className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
        >
            {/* Enhanced Header */}
            <div
                className={`p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ${
                    isCollapsible ? 'cursor-pointer hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100' : ''
                }`}
                onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FiFilter className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Audit Log Filters
                                </h3>
                                <p className="text-sm text-gray-600 hidden sm:block">
                                    Filter and search audit activities
                                </p>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    {activeFilterCount} active
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between lg:justify-end space-x-2">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRefresh();
                                }}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
                                title="Refresh audit logs"
                            >
                                <FiRefreshCw
                                    className={`h-4 w-4 ${
                                        isLoading ? 'animate-spin' : ''
                                    } sm:mr-2`}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            {onCleanup && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCleanup();
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105"
                                    title="Cleanup old audit logs"
                                >
                                    <FiTrash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Cleanup</span>
                                </button>
                            )}
                        </div>
                        {isCollapsible && (
                            <button
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isExpanded ? (
                                    <FiChevronUp className="h-4 w-4" />
                                ) : (
                                    <FiChevronDown className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Filter Content */}
            {isExpanded && (
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                    {/* Quick Filters Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                                <FiCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Quick Filters
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
                            {quickFilters.map((quickFilter, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        applyQuickFilter(quickFilter.filters)
                                    }
                                    className="group relative inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-blue-100 hover:to-blue-50 hover:text-blue-800 transition-all duration-200 border border-gray-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center space-x-1.5">
                                        {quickFilter.icon}
                                        <span className="truncate leading-none">
                                            {quickFilter.label}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                                </button>
                            ))}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="group relative inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-medium bg-gradient-to-r from-red-100 to-red-50 text-red-700 hover:from-red-200 hover:to-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center space-x-1.5">
                                        <FiX className="h-3 w-3" />
                                        <span className="hidden sm:inline leading-none">Clear All</span>
                                        <span className="sm:hidden leading-none">Clear</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Filters Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <FiFilter className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Main Filters
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {/* Action Filter */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="action-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiSettings className="mr-2 h-4 w-4 text-blue-500" />
                                    Action Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="action-filter"
                                        value={filters.action || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'action',
                                                e.target.value || undefined,
                                            )
                                        }
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Actions</option>
                                        <option value="LOGIN">Login</option>
                                        <option value="LOGOUT">Logout</option>
                                        <option value="CREATE">Create</option>
                                        <option value="UPDATE">Update</option>
                                        <option value="DELETE">Delete</option>
                                        <option value="VIEW">View</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Resource Filter */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="resource-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiSettings className="mr-2 h-4 w-4 text-purple-500" />
                                    Resource Type
                                </label>
                                <div className="relative">
                                    <select
                                        id="resource-filter"
                                        value={filters.resource || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'resource',
                                                e.target.value || undefined,
                                            )
                                        }
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Resources</option>
                                        <option value="USER">User</option>
                                        <option value="DRUG">Drug</option>
                                        <option value="SALE">Sale</option>
                                        <option value="CUSTOMER">Customer</option>
                                        <option value="REPORT">Report</option>
                                        <option value="SYSTEM">System</option>
                                        <option value="BRANCH">Branch</option>
                                        <option value="PHARMACY">Pharmacy</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Branch Filter */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="branch-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiMapPin className="mr-2 h-4 w-4 text-green-500" />
                                    Branch
                                </label>
                                <div className="relative">
                                    <select
                                        id="branch-filter"
                                        value={filters.branchId || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'branchId',
                                                e.target.value || undefined,
                                            )
                                        }
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Branches</option>
                                        {branches?.map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* User Role Filter */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="user-role-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiUser className="mr-2 h-4 w-4 text-indigo-500" />
                                    User Role
                                </label>
                                <div className="relative">
                                    <select
                                        id="user-role-filter"
                                        value={filters.userRole || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'userRole',
                                                e.target.value || undefined,
                                            )
                                        }
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="super_admin">
                                            Super Admin
                                        </option>
                                        <option value="admin">Admin</option>
                                        <option value="pharmacist">
                                            Pharmacist
                                        </option>
                                        <option value="cashier">Cashier</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                <FiCalendar className="h-4 w-4 text-purple-600" />
                            </div>
                            <h4 className="text-base font-bold text-gray-800">
                                Date Range
                            </h4>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="start-date-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiCalendar className="mr-2 h-4 w-4 text-green-500" />
                                    Start Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="start-date-filter"
                                        value={filters.startDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'startDate',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="end-date-filter"
                                    className="flex items-center text-sm font-semibold text-gray-700"
                                >
                                    <FiCalendar className="mr-2 h-4 w-4 text-red-500" />
                                    End Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="end-date-filter"
                                        value={filters.endDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'endDate',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
                        >
                            <FiSettings className="mr-2 h-4 w-4" />
                            Advanced Filters
                            {showAdvanced ? (
                                <FiChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                                <FiChevronDown className="ml-2 h-4 w-4" />
                            )}
                        </button>

                        {/* Advanced Filters Section */}
                        {showAdvanced && (
                            <div className="mt-6 p-4 lg:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <FiSearch className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-800">
                                        Advanced Search
                                    </h4>
                                    <div className="flex-1 border-t border-indigo-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                    {/* User ID Search */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="user-id-filter"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FiUser className="mr-2 h-4 w-4 text-blue-500" />
                                            User ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="user-id-filter"
                                                placeholder="Search by user ID..."
                                                value={filters.userId || ''}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'userId',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                            />
                                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Pharmacy ID Search */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="pharmacy-id-filter"
                                            className="flex items-center text-sm font-semibold text-gray-700"
                                        >
                                            <FiHome className="mr-2 h-4 w-4 text-green-500" />
                                            Pharmacy
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="pharmacy-id-filter"
                                                placeholder="Search by pharmacy..."
                                                value={filters.pharmacyId || ''}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'pharmacyId',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm placeholder-gray-400"
                                            />
                                            <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogFilter;
