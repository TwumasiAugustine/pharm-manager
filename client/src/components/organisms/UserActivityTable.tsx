import React
from 'react';
import { Table } from '../molecules/Table';
import type { TableColumn } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { ErrorMessage } from '../atoms/ErrorMessage';
import type { UserActivity } from '../../types/user-activity.types';
import {
    FaEye,
    FaUserShield,
    FaUser,
    FaPills,
    FaCashRegister,
    FaUsers,
    FaBuilding,
    FaChartBar,
    FaExclamationTriangle,
    FaCog,
    FaTachometerAlt,
    FaSignInAlt,
    FaSignOutAlt,
    FaPlus,
    FaEdit,
    FaTrash,
    FaDownload,
    FaSearch,
    FaCrown,
    FaUserMd,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface UserActivityTableProps {
    activities: UserActivity[];
    pagination: {
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    isLoading: boolean;
    error: Error | null;
    onPageChange: (page: number) => void;
    onViewSession: (sessionId: string) => void;
}

// Helper functions for icons and styling
const getActivityTypeIcon = (type: string) => {
    switch (type) {
        case 'LOGIN':
            return <FaSignInAlt className="text-green-500" />;
        case 'LOGOUT':
            return <FaSignOutAlt className="text-orange-500" />;
        case 'CREATE':
            return <FaPlus className="text-blue-500" />;
        case 'UPDATE':
            return <FaEdit className="text-yellow-500" />;
        case 'DELETE':
            return <FaTrash className="text-red-500" />;
        case 'VIEW':
            return <FaEye className="text-gray-500" />;
        case 'DOWNLOAD':
            return <FaDownload className="text-purple-500" />;
        case 'SEARCH':
            return <FaSearch className="text-indigo-500" />;
        default:
            return <FaCog className="text-gray-400" />;
    }
};

const getResourceIcon = (resource: string) => {
    switch (resource) {
        case 'USER':
            return <FaUser className="text-blue-500" />;
        case 'DRUG':
            return <FaPills className="text-green-500" />;
        case 'SALE':
            return <FaCashRegister className="text-emerald-500" />;
        case 'CUSTOMER':
            return <FaUsers className="text-purple-500" />;
        case 'BRANCH':
            return <FaBuilding className="text-indigo-500" />;
        case 'REPORT':
            return <FaChartBar className="text-orange-500" />;
        case 'EXPIRY':
            return <FaExclamationTriangle className="text-red-500" />;
        case 'SYSTEM':
            return <FaCog className="text-gray-500" />;
        case 'DASHBOARD':
            return <FaTachometerAlt className="text-blue-600" />;
        default:
            return <FaCog className="text-gray-400" />;
    }
};

const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
        case 'super_admin':
            return <FaCrown className="text-yellow-500" />;
        case 'admin':
            return <FaUserShield className="text-red-500" />;
        case 'pharmacist':
            return <FaUserMd className="text-blue-500" />;
        case 'cashier':
            return <FaCashRegister className="text-green-500" />;
        default:
            return <FaUser className="text-gray-500" />;
    }
};

const getActivityTypeColor = (type: string) => {
    switch (type) {
        case 'LOGIN':
            return 'bg-green-100 text-green-800';
        case 'LOGOUT':
            return 'bg-orange-100 text-orange-800';
        case 'CREATE':
            return 'bg-blue-100 text-blue-800';
        case 'UPDATE':
            return 'bg-yellow-100 text-yellow-800';
        case 'DELETE':
            return 'bg-red-100 text-red-800';
        case 'VIEW':
            return 'bg-gray-100 text-gray-800';
        case 'DOWNLOAD':
            return 'bg-purple-100 text-purple-800';
        case 'SEARCH':
            return 'bg-indigo-100 text-indigo-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const UserActivityTable: React.FC<UserActivityTableProps> = ({
    activities,
    pagination,
    isLoading,
    error,
    onPageChange,
    onViewSession,
}) => {
    const columns: TableColumn<UserActivity>[] = [
        {
            header: 'User',
            accessor: (item) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {getRoleIcon(item.userId.role)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {item.userId.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {item.userId.email}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                            {item.userId.role}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Activity',
            accessor: (item) => (
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {getActivityTypeIcon(item.activity.type)}
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(
                                item.activity.type,
                            )}`}
                        >
                            {item.activity.type}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getResourceIcon(item.activity.resource)}
                        <span className="text-sm text-gray-700">
                            {item.activity.resource}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        {item.activity.action}
                    </span>
                </div>
            ),
        },
        {
            header: 'Resource Details',
            accessor: (item) => (
                <div className="text-sm max-w-xs">
                    {item.activity.resourceName && (
                        <div className="truncate">
                            <span className="font-medium">Name:</span>{' '}
                            {item.activity.resourceName}
                        </div>
                    )}
                    {item.activity.resourceId && (
                        <div className="text-xs text-gray-500 truncate">
                            <span className="font-medium">ID:</span>{' '}
                            {item.activity.resourceId}
                        </div>
                    )}
                    {item.activity.metadata &&
                        Object.keys(item.activity.metadata).length > 0 && (
                            <div className="mt-1">
                                <details className="text-xs">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                        View metadata
                                    </summary>
                                    <pre className="mt-1 bg-gray-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                                        {JSON.stringify(
                                            item.activity.metadata,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </details>
                            </div>
                        )}
                </div>
            ),
        },
        {
            header: 'Timestamp',
            accessor: (item) => (
                <div className="flex flex-col text-sm">
                    <span className="text-gray-900">
                        {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
            ),
        },
        {
            header: 'Session Info',
            accessor: (item) => (
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => onViewSession(item.sessionId)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                        title="View Session Details"
                    >
                        <FaEye className="mr-1" />
                        View Session
                    </button>
                    {item.session?.ipAddress && (
                        <span className="text-xs text-gray-500">
                            IP: {item.session.ipAddress}
                        </span>
                    )}
                    {item.session?.isActive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 Active
                        </span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
                <div className="p-4">
                    <div className="space-y-4 animate-pulse">
                        {/* Enhanced table header skeleton */}
                        <div className="grid grid-cols-5 gap-4 pb-3 border-b">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                        {/* Enhanced table rows skeleton */}
                        {[...Array(6)].map((i) => (
                            <div
                                key={i}
                                className="grid grid-cols-5 gap-4 py-4 border-b border-gray-100"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        <div className="h-2 bg-gray-200 rounded w-32"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                                    <div className="h-2 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    <div className="h-2 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="p-6">
                    <ErrorMessage message={error.message} />
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No activities found
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        No user activities match your current filters. Try
                        adjusting your search criteria or clearing filters to
                        see more results.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={activities} />
                    </div>
                    {activities.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={onPageChange}
                                showInfo={true}
                                totalItems={activities.length}
                                itemsPerPage={10}
                                size="md"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
