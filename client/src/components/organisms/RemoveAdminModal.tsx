import React from 'react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import type { AdminUser } from '../../types/admin.types';

interface RemoveAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: AdminUser | null;
    removeFromAllPharmacies: boolean;
    onRemoveFromAllChange: (removeFromAll: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const RemoveAdminModal: React.FC<RemoveAdminModalProps> = ({
    isOpen,
    onClose,
    admin,
    removeFromAllPharmacies,
    onRemoveFromAllChange,
    onConfirm,
    isLoading = false,
}) => {
    if (!admin) return null;

    const handleClose = () => {
        onRemoveFromAllChange(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Remove Admin from Pharmacy"
        >
            <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Confirm Removal
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    You are about to remove{' '}
                                    <strong>{admin.name}</strong>
                                    {admin.pharmacyId &&
                                        !removeFromAllPharmacies && (
                                            <span>
                                                {' '}
                                                from{' '}
                                                <strong>
                                                    {admin.pharmacyId.name}
                                                </strong>
                                            </span>
                                        )}
                                    {removeFromAllPharmacies && (
                                        <span>
                                            {' '}
                                            from{' '}
                                            <strong>
                                                all assigned pharmacies
                                            </strong>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {admin.pharmacyId && (
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="removalType"
                                value="single"
                                checked={!removeFromAllPharmacies}
                                onChange={() => onRemoveFromAllChange(false)}
                                className="mr-2"
                            />
                            <span className="text-sm">
                                Remove from{' '}
                                <strong>{admin.pharmacyId.name}</strong> only
                            </span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="removalType"
                                value="all"
                                checked={removeFromAllPharmacies}
                                onChange={() => onRemoveFromAllChange(true)}
                                className="mr-2"
                            />
                            <span className="text-sm">
                                Remove from all assigned pharmacies (leave with
                                no pharmacy assignment)
                            </span>
                        </label>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                        <strong>This action will:</strong>
                    </p>
                    <ul className="list-disc ml-4 mt-1 text-sm text-blue-700">
                        {removeFromAllPharmacies ? (
                            <>
                                <li>
                                    Remove their access to all assigned
                                    pharmacies
                                </li>
                                <li>Keep their admin role</li>
                                <li>
                                    Allow them to be assigned to pharmacies
                                    later
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    Remove their access to this specific
                                    pharmacy
                                </li>
                                <li>
                                    Keep their admin role and access to other
                                    assigned pharmacies
                                </li>
                                <li>
                                    Allow them to be reassigned to different
                                    pharmacies later
                                </li>
                            </>
                        )}
                    </ul>
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
                        isLoading={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={
                            !admin ||
                            (!admin.pharmacyId && !removeFromAllPharmacies)
                        }
                    >
                        {removeFromAllPharmacies
                            ? 'Remove from All'
                            : 'Remove Admin'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RemoveAdminModal;
