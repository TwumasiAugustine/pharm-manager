import React from 'react';
import { Table } from '../molecules/Table';
import { FaEye, FaUserPlus } from 'react-icons/fa';
import type { IUser } from '../../types/user.types';
import { useBranches } from '../../hooks/useBranches';

interface UserListProps {
    users: IUser[];
    isLoading: boolean;
    onEdit: (user: IUser) => void;
    onDelete: (user: IUser) => void;
    onAssignPermissions?: (user: IUser) => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    isLoading,
    onEdit,
    onDelete,
    onAssignPermissions,
}) => {
    const { data: branches } = useBranches();
    const branchMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        branches?.forEach((b) => {
            map[b.id] = b.name;
        });
        return map;
    }, [branches]);

    // Map userId to branch name if user is a manager
    const managerMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        branches?.forEach((b) => {
            if (b.manager) map[b.manager] = b.name;
        });
        return map;
    }, [branches]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <Table<IUser & { id?: string }>
                data={users.map((u) => ({ ...u, id: u._id }))}
                isLoading={isLoading}
                columns={[
                    { header: 'Name', accessor: 'name' },
                    { header: 'Email', accessor: 'email' },
                    {
                        header: 'Branch',
                        accessor: (row: IUser) => row.branchId,
                        cell: (value: unknown, row?: IUser) => {
                            // First try to use the populated branch data
                            if (row?.branch && typeof row.branch === 'object') {
                                return row.branch.name;
                            }
                            // Fallback to branchId lookup
                            if (
                                typeof value === 'string' &&
                                value &&
                                value !== '[object Object]'
                            ) {
                                return branchMap[value] || value;
                            }
                            return '—';
                        },
                    },
                    {
                        header: 'Manager',
                        accessor: (row: IUser) => row._id,
                        cell: (userId: unknown) => {
                            if (
                                typeof userId === 'string' &&
                                managerMap[userId]
                            ) {
                                return (
                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                        Manager of {managerMap[userId]}
                                    </span>
                                );
                            }
                            return <span className="text-gray-400">—</span>;
                        },
                    },
                    {
                        header: 'Role',
                        accessor: 'role',
                        cell: (value: unknown) =>
                            typeof value === 'string'
                                ? value.charAt(0).toUpperCase() + value.slice(1)
                                : '',
                    },
                    ...(onAssignPermissions
                        ? [
                              {
                                  header: 'Permissions',
                                  accessor: (row: IUser) => row.permissions,
                                  cell: (_: unknown, row?: IUser) =>
                                      row ? (
                                          <button
                                              className="text-xs text-indigo-600 underline hover:text-indigo-900"
                                              onClick={() =>
                                                  onAssignPermissions(row)
                                              }
                                          >
                                              Assign Permissions
                                          </button>
                                      ) : null,
                              },
                          ]
                        : []),
                ]}
                actions={[
                    {
                        label: 'Edit',
                        onClick: onEdit,
                        icon: <FaEye className="text-blue-500" />,
                    },
                    {
                        label: 'Delete',
                        onClick: onDelete,
                        icon: <FaUserPlus className="text-red-500" />,
                        className: 'text-red-600',
                    },
                ]}
                emptyMessage="No users found"
            />
        </div>
    );
};

export default UserList;
