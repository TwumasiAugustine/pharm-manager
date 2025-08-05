import React from 'react';
import { Table } from '../molecules/Table';
import type { TableColumn } from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { ErrorMessage } from '../atoms/ErrorMessage';
import type { UserActivity } from '../../types/user-activity.types';
import { FaEye } from 'react-icons/fa';
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
                <div className="flex flex-col">
                    <span className="font-medium">{item.userId.name}</span>
                    <span className="text-xs text-gray-500">
                        {item.userId.email}
                    </span>
                </div>
            ),
        },
        {
            header: 'Action',
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold">
                        {item.activity.action}
                    </span>
                    <span className="text-xs text-gray-500">
                        {item.activity.type} on {item.activity.resource}
                    </span>
                </div>
            ),
        },
        {
            header: 'Details',
            accessor: (item) => (
                <div className="text-xs max-w-xs truncate">
                    {item.activity.resourceName && (
                        <p>
                            <strong>Name:</strong> {item.activity.resourceName}
                        </p>
                    )}
                    {item.activity.resourceId && (
                        <p>
                            <strong>ID:</strong> {item.activity.resourceId}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Timestamp',
            accessor: (item) => (
                <div className="flex flex-col text-sm">
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
            ),
        },
        {
            header: 'Session',
            accessor: (item) => (
                <div className="flex items-center">
                    <button
                        onClick={() => onViewSession(item.sessionId)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        title="View Session Details"
                    >
                        <FaEye className="mr-1" />
                        View
                    </button>
                </div>
            ),
        },
    ];

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    {/* Table header skeleton */}
                    <div className="grid grid-cols-6 gap-4 pb-2 border-b">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    {/* Table rows skeleton */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="grid grid-cols-6 gap-4 py-3 border-b"
                        >
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <Table columns={columns} data={activities} />
                    {activities.length > 0 && (
                        <div className="mt-4">
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
                    {activities.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">
                            No activities found for the selected filters.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
