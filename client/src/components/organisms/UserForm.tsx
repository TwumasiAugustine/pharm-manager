import React from 'react';
import { Button } from '../atoms/Button';
import { FaUserPlus } from 'react-icons/fa';
import type { IUser } from '../../types/user.types';
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
                <input
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
                <input
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
                <input
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
                    <option value={UserRole.PHARMACIST}>Pharmacist</option>
                    <option value={UserRole.CASHIER}>Cashier</option>
                </select>
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
