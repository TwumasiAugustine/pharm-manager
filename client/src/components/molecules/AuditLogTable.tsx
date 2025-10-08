import React from 'react';
import { format } from 'date-fns';
import {
    FiUser,
    FiDatabase,
    FiShoppingCart,
    FiUsers,
    FiFileText,
    FiSettings,
    FiLogIn,
    FiLogOut,
    FiPlus,
    FiEdit,
    FiTrash,
    FiEye,
    FiMapPin,
    FiHome,
    FiClock,
} from 'react-icons/fi';

import type { AuditLogResponse } from '../../types/audit-log.types';
import { Badge } from '../atoms/Badge';

interface AuditLogTableProps {
    data: AuditLogResponse[];
    isLoading?: boolean;
    onViewDetails?: (log: AuditLogResponse) => void;
}

const getResourceIcon = (resource: string) => {
    switch (resource) {
        case 'USER':
            return <FiUser className="h-4 w-4" />;
        case 'DRUG':
            return <FiDatabase className="h-4 w-4" />;
        case 'SALE':
            return <FiShoppingCart className="h-4 w-4" />;
        case 'CUSTOMER':
            return <FiUsers className="h-4 w-4" />;
        case 'REPORT':
            return <FiFileText className="h-4 w-4" />;
        case 'SYSTEM':
            return <FiSettings className="h-4 w-4" />;
        case 'BRANCH':
            return <FiMapPin className="h-4 w-4" />;
        case 'PHARMACY':
            return <FiHome className="h-4 w-4" />;
        default:
            return <FiFileText className="h-4 w-4" />;
    }
};

const getActionIcon = (action: string) => {
    switch (action) {
        case 'LOGIN':
            return <FiLogIn className="h-4 w-4 text-green-600" />;
        case 'LOGOUT':
            return <FiLogOut className="h-4 w-4 text-red-600" />;
        case 'CREATE':
            return <FiPlus className="h-4 w-4 text-blue-600" />;
        case 'UPDATE':
            return <FiEdit className="h-4 w-4 text-yellow-600" />;
        case 'DELETE':
            return <FiTrash className="h-4 w-4 text-red-600" />;
        case 'VIEW':
            return <FiEye className="h-4 w-4 text-gray-600" />;
        default:
            return <FiFileText className="h-4 w-4" />;
    }
};

const getActionVariant = (
    action: string,
): 'success' | 'danger' | 'info' | 'warning' | 'secondary' => {
    switch (action) {
        case 'LOGIN':
            return 'success';
        case 'LOGOUT':
            return 'danger';
        case 'CREATE':
            return 'info';
        case 'UPDATE':
            return 'warning';
        case 'DELETE':
            return 'danger';
        case 'VIEW':
            return 'secondary';
        default:
            return 'secondary';
    }
};

const getResourceVariant = (
    resource: string,
): 'secondary' | 'success' | 'info' | 'warning' | 'primary' => {
    switch (resource) {
        case 'USER':
            return 'secondary';
        case 'DRUG':
            return 'success';
        case 'SALE':
            return 'info';
        case 'CUSTOMER':
            return 'warning';
        case 'REPORT':
            return 'primary';
        case 'SYSTEM':
            return 'secondary';
        default:
            return 'secondary';
    }
};

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
    data,
    isLoading = false,
    onViewDetails,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                    <div className="animate-pulse space-y-6">
                        {/* Enhanced table header skeleton */}
                        <div className="grid grid-cols-6 gap-4 pb-3 border-b">
                            {[
                                'Action',
                                'Resource',
                                'User',
                                'Pharmacy/Branch',
                                'Description',
                                'Timestamp',
                            ].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-2"
                                >
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                        {/* Enhanced table rows skeleton */}
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-14 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="space-y-1">
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    <div className="h-2 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FiFileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Audit Logs Found
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    No audit logs match your current filters. Try adjusting your
                    search criteria or clearing filters to see more results.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                        <FiUser className="h-4 w-4 mr-1" />
                        User activities
                    </div>
                    <div className="flex items-center">
                        <FiHome className="h-4 w-4 mr-1" />
                        System events
                    </div>
                    <div className="flex items-center">
                        <FiSettings className="h-4 w-4 mr-1" />
                        Security logs
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Mobile-friendly table wrapper */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiLogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Action</span>
                                    <span className="sm:hidden">Act</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiDatabase className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Resource</span>
                                    <span className="sm:hidden">Res</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiUser className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>User</span>
                                </div>
                            </th>
                            <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiHome className="h-4 w-4" />
                                    <span>Pharmacy/Branch</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiFileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Description</span>
                                    <span className="sm:hidden">Desc</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiClock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Timestamp</span>
                                    <span className="sm:hidden">Time</span>
                                </div>
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="sr-only sm:not-sr-only">Actions</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Badge
                                            variant={getActionVariant(
                                                log.action,
                                            )}
                                            size="sm"
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {getActionIcon(log.action)}
                                            <span className="hidden sm:inline">{log.action}</span>
                                            <span className="sm:hidden text-[10px]">{log.action.slice(0, 3)}</span>
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Badge
                                            variant={getResourceVariant(
                                                log.resource,
                                            )}
                                            size="sm"
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {getResourceIcon(log.resource)}
                                            <span className="hidden sm:inline">{log.resource}</span>
                                            <span className="sm:hidden text-[10px]">{log.resource.slice(0, 3)}</span>
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FiUser className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                                        </div>
                                        <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                {log.userName}
                                            </div>
                                            <div className="text-[10px] sm:text-sm text-gray-500 truncate">
                                                {log.details.userRole}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden lg:table-cell px-6 py-4">
                                    <div className="space-y-1">
                                        {/* Pharmacy Information */}
                                        {(log.pharmacyName ||
                                            log.details.pharmacyName) && (
                                            <div className="flex items-center text-sm text-gray-900">
                                                <FiHome className="h-4 w-4 mr-2 text-blue-600" />
                                                <span className="font-medium truncate">
                                                    {log.pharmacyName ||
                                                        log.details
                                                            .pharmacyName}
                                                </span>
                                            </div>
                                        )}
                                        {/* Branch Information */}
                                        {(log.branchName ||
                                            log.details.branchName) && (
                                            <div className="flex items-center text-sm text-gray-700">
                                                <FiMapPin className="h-4 w-4 mr-2 text-green-600" />
                                                <span className="truncate">
                                                    {log.branchName ||
                                                        log.details.branchName}
                                                </span>
                                            </div>
                                        )}
                                        {/* Fallback when no pharmacy/branch info */}
                                        {!log.pharmacyName &&
                                            !log.details.pharmacyName &&
                                            !log.branchName &&
                                            !log.details.branchName && (
                                                <div className="text-sm text-gray-400 italic">
                                                    No location info
                                                </div>
                                            )}
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="text-xs sm:text-sm text-gray-900">
                                        <div className="font-medium mb-1 line-clamp-2 sm:line-clamp-3">
                                            {log.details.description}
                                        </div>
                                        {log.details.ipAddress && (
                                            <div className="text-[10px] sm:text-xs text-gray-500 flex items-center mt-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800">
                                                    IP: {log.details.ipAddress}
                                                </span>
                                            </div>
                                        )}
                                        {/* Mobile: Show pharmacy/branch info here */}
                                        <div className="lg:hidden mt-2 space-y-1">
                                            {(log.pharmacyName || log.details.pharmacyName) && (
                                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                                    <FiHome className="h-3 w-3" />
                                                    <span className="truncate">{log.pharmacyName || log.details.pharmacyName}</span>
                                                </div>
                                            )}
                                            {(log.branchName || log.details.branchName) && (
                                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                                    <FiMapPin className="h-3 w-3" />
                                                    <span className="truncate">{log.branchName || log.details.branchName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {format(
                                                new Date(log.timestamp),
                                                'MMM dd, yyyy',
                                            )}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-gray-400">
                                            {format(
                                                new Date(log.timestamp),
                                                'hh:mm a',
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {onViewDetails && (
                                        <button
                                            onClick={() => onViewDetails(log)}
                                            className="inline-flex items-center p-1 sm:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                                            title="View details"
                                        >
                                            <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="sr-only sm:not-sr-only ml-1">Details</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogTable;
