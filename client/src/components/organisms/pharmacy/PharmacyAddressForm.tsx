import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FiMapPin } from 'react-icons/fi';
import { Input } from '../../atoms/Input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../molecules/Card';
import type { PharmacyInfo } from '../../../api/pharmacy.api';

interface PharmacyAddressFormProps {
    register: UseFormRegister<PharmacyInfo>;
    errors: FieldErrors<PharmacyInfo>;
}

export const PharmacyAddressForm: React.FC<PharmacyAddressFormProps> = ({
    register,
    errors,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FiMapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Address Information
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    Physical location details
                </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <Input
                    id="street"
                    label="Street Address"
                    placeholder="123 Medical Avenue"
                    {...register('address.street', {
                        required: 'Street address is required',
                    })}
                    error={errors.address?.street?.message}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        id="city"
                        label="City"
                        placeholder="Healthcare City"
                        {...register('address.city', {
                            required: 'City is required',
                        })}
                        error={errors.address?.city?.message}
                    />
                    <Input
                        id="state"
                        label="State"
                        placeholder="HC"
                        {...register('address.state', {
                            required: 'State is required',
                        })}
                        error={errors.address?.state?.message}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        id="postalCode"
                        label="Postal Code"
                        placeholder="12345"
                        {...register('address.postalCode', {
                            required: 'Postal code is required',
                        })}
                        error={errors.address?.postalCode?.message}
                    />
                    <Input
                        id="country"
                        label="Country"
                        placeholder="Ghana"
                        {...register('address.country', {
                            required: 'Country is required',
                        })}
                        error={errors.address?.country?.message}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
