import React from 'react';
import { DataTable } from '../../components/molecules/DataTable';
import type { IPharmacy } from '../../api/super-admin.api';

interface PharmacyTableProps {
    pharmacies: IPharmacy[];
    loading?: boolean;
    onDelete: (p: IPharmacy) => void;
    onAssign: (p: IPharmacy) => void;
    pagination?:
        | {
              current: number;
              total: number;
              onPageChange: (page: number) => void;
          }
        | undefined;
}

const PharmacyTable: React.FC<PharmacyTableProps> = ({
    pharmacies,
    loading = false,
    onDelete,
    onAssign,
    pagination,
}) => {
    const columns = [
        {
            key: 'name',
            header: 'Pharmacy Name',
            render: (pharmacy: IPharmacy) => (
                <div>
                    <div className="font-semibold">{pharmacy.name}</div>
                    <div className="text-sm text-gray-500">
                        {pharmacy.address.city}, {pharmacy.address.state}
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact',
            render: (pharmacy: IPharmacy) => (
                <div>
                    <div className="text-sm">{pharmacy.contact.email}</div>
                    <div className="text-sm text-gray-500">
                        {pharmacy.contact.phone}
                    </div>
                </div>
            ),
        },
        {
            key: 'stats',
            header: 'Stats',
            render: (pharmacy: IPharmacy) => (
                <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {pharmacy.branchCount || 0} Branches
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {pharmacy.userCount || 0} Users
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (pharmacy: IPharmacy) => (
                <span
                    className={`px-2 py-1 rounded text-xs ${
                        pharmacy.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {pharmacy.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (pharmacy: IPharmacy) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => onAssign(pharmacy)}
                        className="px-3 py-1 bg-gray-100 rounded"
                    >
                        Assign Admin
                    </button>
                    <button
                        onClick={() => onDelete(pharmacy)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={pharmacies}
            columns={columns}
            loading={loading}
            pagination={pagination}
        />
    );
};

export default PharmacyTable;
