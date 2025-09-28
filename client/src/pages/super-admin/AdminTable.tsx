import React from 'react';
import { DataTable } from '../../components/molecules/DataTable';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    pharmacyId?: { _id: string; name: string } | null;
}

interface AdminTableProps {
    admins: AdminUser[];
    loading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({ admins, loading = false }) => {
    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (admin: AdminUser) => (
                <div>
                    <div className="font-semibold">{admin.name}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                </div>
            ),
        },
        {
            key: 'pharmacy',
            header: 'Assigned Pharmacy',
            render: (admin: AdminUser) => (
                <div>
                    {admin.pharmacyId ? (
                        <span className="text-green-600">
                            {admin.pharmacyId.name}
                        </span>
                    ) : (
                        <span className="text-gray-400">Not assigned</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (admin: AdminUser) => (
                <span
                    className={`px-2 py-1 rounded text-xs ${
                        admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {admin.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    return <DataTable data={admins} columns={columns} loading={loading} />;
};

export default AdminTable;
