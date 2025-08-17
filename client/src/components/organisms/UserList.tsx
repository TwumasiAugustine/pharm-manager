import React from 'react';
import { Table } from '../molecules/Table';
import { FaEye, FaUserPlus } from 'react-icons/fa';
import type { IUser } from '../../types/user.types';

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
}) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <Table<IUser & { id?: string }>
            data={users.map((u) => ({ ...u, id: u._id }))}
            isLoading={isLoading}
            columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                {
                    header: 'Role',
                    accessor: 'role',
                    cell: (value: unknown) =>
                        typeof value === 'string'
                            ? value.charAt(0).toUpperCase() + value.slice(1)
                            : '',
                },
                onAssignPermissions && {
                    header: 'Permissions',
                    accessor: 'permissions',
                    cell: (_: unknown, row?: IUser) =>
                        row ? (
                            <button
                                className="text-xs text-indigo-600 underline hover:text-indigo-900"
                                onClick={() => onAssignPermissions(row)}
                            >
                                Assign Permissions
                            </button>
                        ) : null,
                },
            ].filter(Boolean)}
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

export default UserList;
