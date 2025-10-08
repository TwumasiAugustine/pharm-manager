import React from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FiPhone, FiMail, FiGlobe } from 'react-icons/fi';
import { Input } from '../../atoms/Input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../molecules/Card';
import type { PharmacyInfo } from '../../../api/pharmacy.api';

interface PharmacyContactInfoProps {
    register: UseFormRegister<PharmacyInfo>;
    errors: FieldErrors<PharmacyInfo>;
}

export const PharmacyContactInfo: React.FC<PharmacyContactInfoProps> = ({
    register,
    errors,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Contact Information
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    How customers can reach you
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="phone"
                        label="Phone Number"
                        placeholder="+233 XX XXX XXXX"
                        className="pl-10"
                        {...register('contact.phone', {
                            required: 'Phone number is required',
                        })}
                        error={errors.contact?.phone?.message}
                    />
                </div>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="contact@yourpharmacy.com"
                        className="pl-10"
                        {...register('contact.email', {
                            required: 'Email is required',
                        })}
                        error={errors.contact?.email?.message}
                    />
                </div>
                <div className="relative">
                    <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="website"
                        label="Website (Optional)"
                        placeholder="www.yourpharmacy.com"
                        className="pl-10"
                        {...register('contact.website')}
                        error={errors.contact?.website?.message}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
