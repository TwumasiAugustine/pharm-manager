import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FiFileText, FiClock } from 'react-icons/fi';
import { Input } from '../../atoms/Input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../molecules/Card';
import type { PharmacyInfo } from '../../../api/pharmacy.api';

interface PharmacyBusinessDetailsFormProps {
    register: UseFormRegister<PharmacyInfo>;
    errors: FieldErrors<PharmacyInfo>;
}

export const PharmacyBusinessDetailsForm: React.FC<
    PharmacyBusinessDetailsFormProps
> = ({ register, errors }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FiFileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Business Details
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    Legal and operational information
                </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <Input
                    id="registrationNumber"
                    label="Registration Number"
                    placeholder="PHM-12345-REG"
                    {...register('registrationNumber', {
                        required: 'Registration number is required',
                    })}
                    error={errors.registrationNumber?.message}
                />
                <Input
                    id="taxId"
                    label="Tax ID"
                    placeholder="TAX-67890-ID"
                    {...register('taxId', {
                        required: 'Tax ID is required',
                    })}
                    error={errors.taxId?.message}
                />
                <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                        id="operatingHours"
                        label="Operating Hours"
                        placeholder="8:00 AM - 8:00 PM, Mon-Sat"
                        className="pl-8 sm:pl-10"
                        {...register('operatingHours', {
                            required: 'Operating hours are required',
                        })}
                        error={errors.operatingHours?.message}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
