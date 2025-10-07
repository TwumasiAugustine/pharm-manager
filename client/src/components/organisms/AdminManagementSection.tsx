import React from 'react';
import { FaUserTie, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import AdminTable from '../../pages/super-admin/AdminTable';
import type { AdminUser } from '../../types/admin.types';

interface AdminManagementSectionProps {
    admins: AdminUser[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClearSearch: () => void;
    onCreateAdmin: () => void;
    onEditAdmin: (admin: AdminUser) => void;
    onRemoveAdmin: (admin: AdminUser) => void;
    onRemoveAdminFromAll: (admin: AdminUser) => void;
}

const AdminManagementSection: React.FC<AdminManagementSectionProps> = ({
    admins,
    loading,
    searchQuery,
    onSearchChange,
    onClearSearch,
    onCreateAdmin,
    onEditAdmin,
    onRemoveAdmin,
    onRemoveAdminFromAll,
}) => {
    const filteredAdmins = admins.filter((admin: AdminUser) =>
        searchQuery
            ? admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              admin.email.toLowerCase().includes(searchQuery.toLowerCase())
            : true,
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaUserTie className="text-green-600" />
                        Admin Management
                    </h2>
                    <Button onClick={onCreateAdmin}>
                        <FaPlus className="mr-2" /> Create Admin
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search admins..."
                            value={searchQuery}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => onSearchChange(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={onClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                <AdminTable
                    admins={filteredAdmins}
                    loading={loading}
                    onEdit={onEditAdmin}
                    onRemove={onRemoveAdmin}
                    onRemoveFromAll={onRemoveAdminFromAll}
                />
            </CardContent>
        </Card>
    );
};

export default AdminManagementSection;
