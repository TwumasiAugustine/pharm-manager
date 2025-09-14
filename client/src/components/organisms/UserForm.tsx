import React from 'react';
import { Button } from '../atoms/Button';
import { FaUserPlus } from 'react-icons/fa';
import type { IUser } from '../../types/user.types';
import { BranchSelect } from '../molecules/BranchSelect';
import { UserRole } from '../../types/user.types';

interface UserFormProps {
    formData: Partial<IUser>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<IUser>>>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editUserId: string | null;
    isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    editUserId,
    isLoading = false,
}) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaUserPlus className="mr-2 text-blue-500" />
            {editUserId ? 'Edit User' : 'New User'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label htmlFor="name" className="sr-only">
                    Full Name
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, name: e.target.value }))
                    }
                    className="border rounded px-3 py-2 w-full"
                    required
                />
                <label htmlFor="email" className="sr-only">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    className="border rounded px-3 py-2 w-full"
                    required
                />
                <label htmlFor="password" className="sr-only">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder={
                        editUserId
                            ? 'New Password (leave blank to keep current)'
                            : 'Password'
                    }
                    value={formData.password || ''}
                    onChange={(e) =>
                        setFormData((f) => ({ ...f, password: e.target.value }))
                    }
                    className="border rounded px-3 py-2 w-full"
                    required={!editUserId}
                />
                <label htmlFor="role" className="sr-only">
                    Role
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role || UserRole.PHARMACIST}
                    onChange={(e) =>
                        setFormData((f) => ({
                            ...f,
                            role: e.target.value as UserRole,
                        }))
                    }
                    className="border rounded px-3 py-2 w-full"
                    required
                >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.SUPER_ADMIN}>Cashier</option>
                    <option value={UserRole.PHARMACIST}>Pharmacist</option>
                    <option value={UserRole.CASHIER}>Cashier</option>
                </select>
                <BranchSelect
                    value={formData.branchId}
                    onChange={(id) =>
                        setFormData((f) => ({ ...f, branchId: id }))
                    }
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading
                        ? editUserId
                            ? 'Updating...'
                            : 'Creating...'
                        : editUserId
                        ? 'Update User'
                        : 'Create User'}
                </Button>
            </div>
        </form>
    </div>
);

export default UserForm;
