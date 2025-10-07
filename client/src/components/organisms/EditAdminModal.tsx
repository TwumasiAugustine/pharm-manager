import React from 'react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { AdminUser } from '../../types/admin.types';
import type { IPharmacy } from '../../api/super-admin.api';

interface EditAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: AdminUser | null;
    pharmacies: IPharmacy[];
    adminForm: {
        name: string;
        email: string;
        pharmacyId: string;
        isActive: boolean;
    };
    onFormChange: (field: string, value: string | boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
    isOpen,
    onClose,
    admin,
    pharmacies,
    adminForm,
    onFormChange,
    onSubmit,
    isLoading,
}) => {
    if (!admin) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Admin User">
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <Input
                        type="text"
                        value={adminForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onFormChange('name', e.target.value)
                        }
                        placeholder="Enter admin name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <Input
                        type="email"
                        value={adminForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onFormChange('email', e.target.value)
                        }
                        placeholder="Enter email address"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Pharmacy
                    </label>
                    <select
                        value={adminForm.pharmacyId}
                        onChange={(e) =>
                            onFormChange('pharmacyId', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">No Pharmacy Assignment</option>
                        {pharmacies.map((pharmacy) => (
                            <option key={pharmacy._id} value={pharmacy._id}>
                                {pharmacy.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={adminForm.isActive}
                        onChange={(e) =>
                            onFormChange('isActive', e.target.checked)
                        }
                        className="mr-2"
                    />
                    <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700"
                    >
                        Active User
                    </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Changing the pharmacy assignment
                        will update the admin's access rights. Removing pharmacy
                        assignment will limit their access to system-level
                        functions only.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Update Admin
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditAdminModal;
