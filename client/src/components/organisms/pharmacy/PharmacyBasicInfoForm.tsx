import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FiFileText } from 'react-icons/fi';
import { Input } from '../../atoms/Input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../molecules/Card';
import type { PharmacyInfo } from '../../../api/pharmacy.api';

interface PharmacyBasicInfoFormProps {
    register: UseFormRegister<PharmacyInfo>;
    errors: FieldErrors<PharmacyInfo>;
    canUpdateName: boolean;
}

export const PharmacyBasicInfoForm: React.FC<PharmacyBasicInfoFormProps> = ({
    register,
    errors,
    canUpdateName,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FiFileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Basic Information
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    Essential pharmacy details displayed on receipts
                </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <Input
                    id="name"
                    label="Pharmacy Name"
                    placeholder="Enter your pharmacy name"
                    disabled={!canUpdateName}
                    {...register('name', {
                        required: 'Pharmacy name is required',
                    })}
                    error={errors.name?.message}
                />
                {!canUpdateName && (
                    <p className="text-xs text-gray-500 mt-1">
                        Only Super Admin can change the pharmacy name
                    </p>
                )}
                <Input
                    id="slogan"
                    label="Slogan (Optional)"
                    placeholder="Your health, Our priority"
                    {...register('slogan')}
                    error={errors.slogan?.message}
                />
            </CardContent>
        </Card>
    );
};
