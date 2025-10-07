import React from 'react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { ICreatePharmacyRequest } from '../../api/super-admin.api';

interface CreatePharmacyModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: ICreatePharmacyRequest;
    onFormChange: (data: ICreatePharmacyRequest) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
}

const CreatePharmacyModal: React.FC<CreatePharmacyModalProps> = ({
    isOpen,
    onClose,
    formData,
    onFormChange,
    onSubmit,
    isLoading = false,
}) => {
    const updateFormData = (updates: Partial<ICreatePharmacyRequest>) => {
        onFormChange({ ...formData, ...updates });
    };

    const updateAddress = (
        updates: Partial<ICreatePharmacyRequest['address']>,
    ) => {
        onFormChange({
            ...formData,
            address: { ...formData.address, ...updates },
        });
    };

    const updateContact = (
        updates: Partial<ICreatePharmacyRequest['contact']>,
    ) => {
        onFormChange({
            ...formData,
            contact: { ...formData.contact, ...updates },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Pharmacy">
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Pharmacy Name"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFormData({ name: e.target.value })
                        }
                        required
                    />
                    <Input
                        label="Registration Number"
                        value={formData.registrationNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFormData({
                                registrationNumber: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Tax ID"
                        value={formData.taxId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFormData({ taxId: e.target.value })
                        }
                        required
                    />
                    <Input
                        label="Phone"
                        value={formData.contact.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateContact({ phone: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={formData.contact.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateContact({ email: e.target.value })
                        }
                        required
                    />
                    <Input
                        label="Website (Optional)"
                        value={formData.contact.website || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateContact({ website: e.target.value })
                        }
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Address
                    </h3>
                    <Input
                        label="Street"
                        value={formData.address.street}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateAddress({ street: e.target.value })
                        }
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="City"
                            value={formData.address.city}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => updateAddress({ city: e.target.value })}
                            required
                        />
                        <Input
                            label="State"
                            value={formData.address.state}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => updateAddress({ state: e.target.value })}
                            required
                        />
                        <Input
                            label="Postal Code"
                            value={formData.address.postalCode}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => updateAddress({ postalCode: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Country"
                        value={formData.address.country}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateAddress({ country: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Operating Hours"
                        value={formData.operatingHours}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFormData({ operatingHours: e.target.value })
                        }
                        placeholder="e.g., Mon-Fri 9AM-6PM, Sat 9AM-2PM"
                        required
                    />
                    <Input
                        label="Slogan"
                        value={formData.slogan}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFormData({ slogan: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Create Pharmacy
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreatePharmacyModal;
