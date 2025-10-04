import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';
import { BranchSelect } from '../components/molecules/BranchSelect';
import UserForm from '../components/organisms/UserForm';
import UserFilters from '../components/organisms/UserFilters';
import UserList from '../components/organisms/UserList';
import PermissionManager from '../components/organisms/PermissionManager';
import PermissionGuard from '../components/atoms/PermissionGuard';
import { PERMISSION_KEYS } from '../types/permission.types';
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
} from '../hooks/useUsers';
import { useSafeNotify } from '../utils/useSafeNotify';
import type { IUser } from '../types/user.types';
import { UserRole } from '../types/user.types';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';

const UserManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const notify = useSafeNotify();

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.users,
        canonicalPath: '/users',
    });

    const [formData, setFormData] = useState<Partial<IUser>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.PHARMACIST,
        branchId: '',
        isManager: false,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [branchId, setBranchId] = useState<string>('');
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const { data: users, isLoading } = useUsers({
        limit: 5,
        search: debouncedSearchTerm,
        branchId: branchId,
    });

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const handleSearch = (query: string) => setSearchTerm(query);
    const handleEdit = (user: IUser) => {
        setEditUserId(user._id);
        setFormData({
            ...user,
            password: '',
            branchId: user.branchId || '', // Ensure branchId is included
        });
        setShowForm(true);
    };
    const handleDelete = async (user: IUser) => {
        if (
            window.confirm(`Are you sure you want to delete user ${user.name}?`)
        ) {
            try {
                await deleteUser.mutateAsync(user._id);
                notify.success('User deleted');
            } catch {
                notify.error('Failed to delete user');
            }
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.name ||
            !formData.email ||
            (!editUserId && !formData.password)
        ) {
            notify.warning('Name, email, and password are required');
            return;
        }
        // Normalize email
        const normalizedEmail = formData.email.trim().toLowerCase();
        // Check for duplicate email in current users (client-side quick check)
        if (
            !editUserId &&
            users?.users.some((u) => u.email.toLowerCase() === normalizedEmail)
        ) {
            notify.error('A user with this email already exists.');
            return;
        }
        try {
            if (editUserId) {
                const updateData = { ...formData, email: normalizedEmail };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await updateUser.mutateAsync({ id: editUserId, ...updateData });
                setEditUserId(null);
            } else {
                await createUser.mutateAsync({
                    ...formData,
                    email: normalizedEmail,
                } as IUser);
            }
            setFormData({
                name: '',
                email: '',
                password: '',
                role: UserRole.PHARMACIST,
                branchId: '',
                isManager: false,
            });
            setShowForm(false);
        } catch {
            notify.error('Error saving user');
        }
    };

    // Permission management state
    const [permissionUserId, setPermissionUserId] = useState<string | null>(
        null,
    );

    // Handler to open permission modal for a user
    const openPermissionModal = (user: IUser) => {
        setPermissionUserId(user._id);
    };

    const closePermissionModal = () => {
        setPermissionUserId(null);
    };

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaUsers className="text-blue-600" />
                            User Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage users and their permissions
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                        <PermissionGuard
                            permission={PERMISSION_KEYS.CREATE_USER}
                        >
                            <Button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditUserId(null);
                                }}
                                color="primary"
                            >
                                <FaUserPlus className="mr-2" /> New User
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Branch Filter */}
                <div className="flex items-center gap-3 mb-4">
                    <BranchSelect value={branchId} onChange={setBranchId} />
                </div>

                {showForm && (
                    <UserForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditUserId(null);
                        }}
                        editUserId={editUserId}
                    />
                )}

                <UserFilters searchTerm={searchTerm} onSearch={handleSearch} />

                <PermissionGuard permission={PERMISSION_KEYS.VIEW_USERS}>
                    <UserList
                        users={users?.users || []}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAssignPermissions={openPermissionModal}
                    />
                </PermissionGuard>

                {/* Permission Management Modal */}
                {permissionUserId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                            <PermissionManager
                                userId={permissionUserId}
                                onClose={closePermissionModal}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserManagementPage;
