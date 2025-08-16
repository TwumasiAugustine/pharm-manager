import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';
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
import { UserRole } from '../types/user.types';

const UserManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const [formData, setFormData] = useState<Partial<IUser>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.PHARMACIST,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const { data: users, isLoading } = useUsers({
        limit: 5,
        search: debouncedSearchTerm,
    });

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    // Close actions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        };
        if (showActionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsDropdown]);

    const handleSearch = (query: string) => setSearchTerm(query);
    const handleEdit = (user: IUser) => {
        setEditUserId(user._id);
        setFormData({ ...user, password: '' });
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
        try {
            if (editUserId) {
                await updateUser.mutateAsync({ id: editUserId, ...formData });
                setEditUserId(null);
            } else {
                await createUser.mutateAsync(formData as IUser);
            }
            setFormData({
                name: '',
                email: '',
                password: '',
                role: UserRole.PHARMACIST,
            });
            setShowForm(false);
        } catch {
            notify.error('Error saving user');
        }
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
                        isLoading={createUser.isLoading || updateUser.isLoading}
                    />
                )}
                <UserFilters searchTerm={searchTerm} onSearch={handleSearch} />
                <UserList
                    users={users?.users || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </DashboardLayout>
    );
};

export default UserManagementPage;
