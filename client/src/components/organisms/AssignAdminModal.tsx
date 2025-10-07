import React from 'react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import type { IPharmacy } from '../../api/super-admin.api';
import type { AdminUser } from '../../types/admin.types';

interface AssignAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    pharmacy: IPharmacy | null;
    admins: AdminUser[];
    selectedAdminId: string;
    onAdminSelect: (adminId: string) => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const AssignAdminModal: React.FC<AssignAdminModalProps> = ({
    isOpen,
    onClose,
    pharmacy,
    admins,
    selectedAdminId,
    onAdminSelect,
    onConfirm,
    isLoading = false,
}) => {
    if (!pharmacy) return null;

    const handleClose = () => {
        onAdminSelect('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Assign Admin to ${pharmacy.name}`}
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Admins can be assigned to
                        multiple pharmacies. This will add the pharmacy to their
                        list of managed pharmacies while preserving their
                        primary assignment.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Admin
                    </label>
                    <select
                        value={selectedAdminId}
                        onChange={(e) => onAdminSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select an admin</option>
                        {admins
                            .filter((admin: AdminUser) => admin.isActive)
                            .map((admin: AdminUser) => (
                                <option key={admin._id} value={admin._id}>
                                    {admin.name} ({admin.email})
                                    {admin.pharmacyId &&
                                        ` - Currently at ${admin.pharmacyId.name}`}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={!selectedAdminId}
                        isLoading={isLoading}
                    >
                        Assign Admin
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignAdminModal;
