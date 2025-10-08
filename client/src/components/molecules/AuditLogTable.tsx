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
    FiHome,
    FiMapPin,
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
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="flex space-x-4">
                                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Audit Logs Found
                </h3>
                <p className="text-gray-500">
                    No audit logs match your current filters.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pharmacy/Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Badge
                                            variant={getActionVariant(
                                                log.action,
                                            )}
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            {getActionIcon(log.action)}
                                            <span>{log.action}</span>
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Badge
                                            variant={getResourceVariant(
                                                log.resource,
                                            )}
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            {getResourceIcon(log.resource)}
                                            <span>{log.resource}</span>
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FiUser className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {log.userName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {log.details.userRole}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {log.details.description}
                                    </div>
                                    {log.details.ipAddress && (
                                        <div className="text-xs text-gray-500">
                                            IP: {log.details.ipAddress}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>
                                        {format(
                                            new Date(log.timestamp),
                                            'MMM dd, yyyy',
                                        )}
                                    </div>
                                    <div className="text-xs">
                                        {format(
                                            new Date(log.timestamp),
                                            'hh:mm a',
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {onViewDetails && (
                                        <button
                                            onClick={() => onViewDetails(log)}
                                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                        >
                                            <FiEye className="h-4 w-4 mr-1" />
                                            Details
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
