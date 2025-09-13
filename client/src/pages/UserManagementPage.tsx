import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';
import { BranchSelect } from '../components/molecules/BranchSelect';
import UserForm from '../components/organisms/UserForm';
import UserFilters from '../components/organisms/UserFilters';
import UserList from '../components/organisms/UserList';
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
} from '../hooks/useUsers';
import { useSafeNotify } from '../utils/useSafeNotify';
import type { IUser } from '../types/user.types';
import { userApi } from '../api/user.api';
import { UserRole } from '../types/user.types';

const UserManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const notify = useSafeNotify();
    const [formData, setFormData] = useState<Partial<IUser>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.PHARMACIST,
        branchId: '',
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
            });
            setShowForm(false);
        } catch {
            notify.error('Error saving user');
        }
    };

    // Permission assignment state
    const [permissionUserId, setPermissionUserId] = useState<string | null>(
        null,
    );
    const [currentPermissionUser, setCurrentPermissionUser] =
        useState<IUser | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [assigning, setAssigning] = useState(false);

    const handlePermissionChange = (perm: string) => {
        setPermissions((prev) =>
            prev.includes(perm)
                ? prev.filter((p) => p !== perm)
                : [...prev, perm],
        );
    };

    const handleAssignPermissions = async () => {
        if (!permissionUserId) return;
        setAssigning(true);
        try {
            await userApi.assignPermissions(permissionUserId, permissions);
            notify.success('Permissions updated');
            setPermissionUserId(null);
            setCurrentPermissionUser(null);
        } catch {
            notify.error('Failed to update permissions');
        } finally {
            setAssigning(false);
        }
    };

    // Handler to open permission modal for a user
    const openPermissionModal = (user: IUser) => {
        setPermissionUserId(user._id);
        setCurrentPermissionUser(user);
        setPermissions(user.permissions ?? []);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <FaUsers className="mr-2 text-blue-500" />
                            User Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your pharmacy users and permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                        <Button
                            onClick={() => {
                                setShowForm(true);
                                setEditUserId(null);
                            }}
                            color="primary"
                        >
                            <FaUserPlus className="mr-2" /> New User
                        </Button>
                    </div>
                </div>

                {/* Branch Filter */}
                <div className="flex items-center gap-3">
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
                        isLoading={createUser.isPending || updateUser.isPending}
                    />
                )}
                <UserFilters searchTerm={searchTerm} onSearch={handleSearch} />
                <UserList
                    users={users?.users || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAssignPermissions={openPermissionModal}
                />

                {/* Permission Assignment Modal */}
                {permissionUserId && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-bold mb-4">
                                Assign Permissions
                            </h2>
                            <div className="space-y-2 mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(
                                            'FINALIZE_SALE',
                                        )}
                                        onChange={() =>
                                            handlePermissionChange(
                                                'FINALIZE_SALE',
                                            )
                                        }
                                        disabled={
                                            currentPermissionUser?.role ===
                                            UserRole.SUPER_ADMIN
                                        }
                                        className="mr-2"
                                    />
                                    Can finalize/print sales (FINALIZE_SALE)
                                    {currentPermissionUser?.role ===
                                        UserRole.SUPER_ADMIN && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            (Not available for Super Admin)
                                        </span>
                                    )}
                                </label>
                                {/* Add more permissions here as needed */}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    onClick={() => {
                                        setPermissionUserId(null);
                                        setCurrentPermissionUser(null);
                                    }}
                                    color="secondary"
                                    disabled={assigning}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssignPermissions}
                                    color="primary"
                                    isLoading={assigning}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserManagementPage;
