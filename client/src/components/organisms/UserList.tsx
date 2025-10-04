import React from 'react';
import { Table } from '../molecules/Table';
import { FaEye, FaUserPlus, FaUserTie } from 'react-icons/fa';
import { Badge } from '../atoms/Badge';
import type { IUser } from '../../types/user.types';
import { useBranches } from '../../hooks/useBranches';
import { usePermissions } from '../../hooks/usePermissions';

interface UserListProps {
    users: IUser[];
    isLoading: boolean;
    onEdit: (user: IUser) => void;
    onDelete: (user: IUser) => void;
    onAssignPermissions?: (user: IUser) => void;
    onManagerAction?: (user: IUser, action: string) => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    isLoading,
    onEdit,
    onDelete,
    onAssignPermissions,
    onManagerAction,
}) => {
    const { data: branches } = useBranches();
    const { canManageBranchStaff, canViewStaffPerformance } = usePermissions();
    const branchMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        branches?.forEach((b) => {
            map[b.id] = b.name;
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
                        header: 'Manager Status',
                        accessor: (row: IUser) => row.isManager,
                        cell: (value: unknown, row?: IUser) => {
                            if (value === true && row?.branch) {
                                return (
                                    <Badge variant="success" size="sm">
                                        Manager
                                    </Badge>
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
                    // Manager-specific actions
                    ...(canManageBranchStaff() && onManagerAction
                        ? [
                              {
                                  label: 'Manage Performance',
                                  onClick: (user: IUser) => {
                                      if (
                                          user.role === 'pharmacist' ||
                                          user.role === 'cashier'
                                      ) {
                                          onManagerAction(user, 'performance');
                                      }
                                  },
                                  icon: (
                                      <FaUserTie className="text-green-500" />
                                  ),
                                  className: 'text-green-600',
                              },
                          ]
                        : []),
                    ...(canViewStaffPerformance() && onManagerAction
                        ? [
                              {
                                  label: 'View Schedule',
                                  onClick: (user: IUser) => {
                                      if (
                                          user.role === 'pharmacist' ||
                                          user.role === 'cashier'
                                      ) {
                                          onManagerAction(user, 'schedule');
                                      }
                                  },
                                  icon: (
                                      <FaUserTie className="text-purple-500" />
                                  ),
                                  className: 'text-purple-600',
                              },
                          ]
                        : []),
                ]}
                emptyMessage="No users found"
            />
        </div>
    );
};

export default UserList;
