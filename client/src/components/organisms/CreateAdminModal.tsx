import React from 'react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { ICreateAdminRequest, IPharmacy } from '../../api/super-admin.api';

interface CreateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: ICreateAdminRequest;
    onFormChange: (data: ICreateAdminRequest) => void;
    onSubmit: (e: React.FormEvent) => void;
    pharmacies: IPharmacy[];
    isLoading?: boolean;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
    isOpen,
    onClose,
    formData,
    onFormChange,
    onSubmit,
    pharmacies,
    isLoading = false,
}) => {
    const updateFormData = (updates: Partial<ICreateAdminRequest>) => {
        onFormChange({ ...formData, ...updates });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Admin">
            <form onSubmit={onSubmit} className="space-y-4">
                <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateFormData({ name: e.target.value })
                    }
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateFormData({ email: e.target.value })
                    }
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateFormData({ password: e.target.value })
                    }
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Pharmacy (Optional)
                    </label>
                    <select
                        value={formData.assignToPharmacy || ''}
                        onChange={(e) =>
                            updateFormData({ assignToPharmacy: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a pharmacy</option>
                        {pharmacies.map((pharmacy) => (
                            <option key={pharmacy._id} value={pharmacy._id}>
                                {pharmacy.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Create Admin
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateAdminModal;
