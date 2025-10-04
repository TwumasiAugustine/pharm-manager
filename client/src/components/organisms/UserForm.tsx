import React from 'react';
import { Button } from '../atoms/Button';
import { FaUserPlus } from 'react-icons/fa';
import type { IUser } from '../../types/user.types';
import { BranchSelect } from '../molecules/BranchSelect';
import { UserRole } from '../../types/user.types';
import { usePermissions } from '../../hooks/usePermissions';

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
}) => {
    const { canCreateUser } = usePermissions();

    // Get available roles based on current user's permissions
    const getAvailableRoles = () => {
        const roles = [];

        if (canCreateUser(UserRole.ADMIN)) {
            roles.push({ value: UserRole.ADMIN, label: 'Admin' });
        }
        if (canCreateUser(UserRole.PHARMACIST)) {
            roles.push({ value: UserRole.PHARMACIST, label: 'Pharmacist' });
        }
        if (canCreateUser(UserRole.CASHIER)) {
            roles.push({ value: UserRole.CASHIER, label: 'Cashier' });
        }

        return roles;
    };

    const availableRoles = getAvailableRoles();

    // Show branch selection only for operational roles
    const shouldShowBranchSelect =
        formData.role && formData.role !== UserRole.SUPER_ADMIN;

    // Show manager checkbox only for pharmacists
    const shouldShowManagerOption =
        formData.role === UserRole.PHARMACIST && formData.branchId;

    return (
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
                            setFormData((f) => ({
                                ...f,
                                email: e.target.value,
                            }))
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
                            setFormData((f) => ({
                                ...f,
                                password: e.target.value,
                            }))
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
                        value={
                            formData.role ||
                            availableRoles[0]?.value ||
                            UserRole.PHARMACIST
                        }
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                role: e.target.value as UserRole,
                                // Reset branch and manager when role changes
                                branchId:
                                    e.target.value === UserRole.ADMIN
                                        ? ''
                                        : f.branchId,
                                isManager:
                                    e.target.value === UserRole.PHARMACIST
                                        ? f.isManager
                                        : false,
                            }))
                        }
                        className="border rounded px-3 py-2 w-full"
                        required
                    >
                        {availableRoles.length === 0 ? (
                            <option value="">No roles available</option>
                        ) : (
                            availableRoles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))
                        )}
                    </select>

                    {shouldShowBranchSelect && (
                        <BranchSelect
                            value={formData.branchId}
                            onChange={(id) =>
                                setFormData((f) => ({ ...f, branchId: id }))
                            }
                            mode="form"
                            required={formData.role !== UserRole.ADMIN}
                        />
                    )}
                </div>

                {/* Role-specific information */}
                {formData.role === UserRole.ADMIN && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">
                            Admin Role Information
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>
                                • Can create and manage Pharmacist and Cashier
                                users
                            </li>
                            <li>
                                • Can assign permissions to operational staff
                            </li>
                            <li>
                                • Has access to all operational features within
                                their pharmacy
                            </li>
                            <li>• Cannot access system-level administration</li>
                        </ul>
                    </div>
                )}

                {shouldShowManagerOption && (
                    <div className="flex items-center space-x-2">
                        <input
                            id="isManager"
                            type="checkbox"
                            checked={formData.isManager || false}
                            onChange={(e) =>
                                setFormData((f) => ({
                                    ...f,
                                    isManager: e.target.checked,
                                }))
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="isManager"
                            className="text-sm font-medium text-gray-700"
                        >
                            Assign as manager of selected branch
                        </label>
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    <Button type="button" color="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={isLoading}
                        disabled={isLoading || availableRoles.length === 0}
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
};

export default UserForm;
