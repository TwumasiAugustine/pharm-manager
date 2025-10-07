import React from 'react';
import { DataTable } from '../../components/molecules/DataTable';
import type { AdminUser } from '../../types/admin.types';

interface AdminTableProps {
    admins: AdminUser[];
    loading?: boolean;
    onEdit?: (admin: AdminUser) => void;
    onRemove?: (admin: AdminUser) => void;
    onRemoveFromAll?: (admin: AdminUser) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({
    admins,
    loading = false,
    onEdit,
    onRemove,
    onRemoveFromAll,
}) => {
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
        ...(onEdit || onRemove || onRemoveFromAll
            ? [
                  {
                      key: 'actions',
                      header: 'Actions',
                      render: (admin: AdminUser) => (
                          <div className="flex gap-2 flex-wrap">
                              {onEdit && (
                                  <button
                                      onClick={() => onEdit(admin)}
                                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
                                  >
                                      Edit
                                  </button>
                              )}
                              {admin.pharmacyId && onRemove && (
                                  <button
                                      onClick={() => onRemove(admin)}
                                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                                  >
                                      Remove from {admin.pharmacyId.name}
                                  </button>
                              )}
                              {admin.pharmacyId && onRemoveFromAll && (
                                  <button
                                      onClick={() => onRemoveFromAll(admin)}
                                      className="px-3 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-xs"
                                  >
                                      Remove from All
                                  </button>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    return <DataTable data={admins} columns={columns} loading={loading} />;
};

export default AdminTable;
