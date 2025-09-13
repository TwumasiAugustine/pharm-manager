import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useUpdatePharmacyInfo, usePharmacyInfo } from '../hooks/usePharmacy';
import type { PharmacyInfo } from '../api/pharmacy.api';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/auth.types';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/molecules/Card';
import { Alert, AlertDescription } from '../components/molecules/Alert';
import { pharmacyApi } from '../api/pharmacy.api';
import { useQueryClient } from '@tanstack/react-query';
import {
    FiMapPin,
    FiPhone,
    FiMail,
    FiGlobe,
    FiFileText,
    FiClock,
    FiShield,
    FiSettings,
    FiSave,
    FiCheck,
    FiX,
} from 'react-icons/fi';

const PharmacySetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { mutate: updatePharmacy, isPending } = useUpdatePharmacyInfo();
    const { data: pharmacyData, isLoading, error } = usePharmacyInfo();
    const [defaultValues, setDefaultValues] = useState<PharmacyInfo | null>(
        null,
    );
    const [requireShortCode, setRequireShortCode] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const queryClient = useQueryClient();

    // Fetch current toggle state on mount
    useEffect(() => {
        if (pharmacyData?.pharmacyInfo?.requireSaleShortCode !== undefined) {
            setRequireShortCode(
                !!pharmacyData.pharmacyInfo.requireSaleShortCode,
            );
        }
    }, [pharmacyData]);

    const handleToggleShortCode = async () => {
        setToggleLoading(true);
        try {
            const res = await pharmacyApi.toggleSaleShortCode(
                !requireShortCode,
            );
            setRequireShortCode(res.requireSaleShortCode);
            // Refetch pharmacy info so UI stays in sync
            await queryClient.invalidateQueries({ queryKey: ['pharmacyInfo'] });
        } catch {
            console.error('');
        } finally {
            setToggleLoading(false);
        }
    };

    // Check if user is an admin or super admin
    useEffect(() => {
        if (
            !user ||
            (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
        ) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Set form default values when pharmacy data is loaded
    useEffect(() => {
        if (pharmacyData?.pharmacyInfo) {
            setDefaultValues(pharmacyData.pharmacyInfo);
        }
    }, [pharmacyData]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PharmacyInfo>();

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    const { setPharmacyConfigured } = useAuthStore();

    const onSubmit = async (data: PharmacyInfo) => {
        await updatePharmacy(data);
        // After update, re-check config status and update auth store
        try {
            const isConfigured = await pharmacyApi.checkConfigStatus();
            setPharmacyConfigured(isConfigured);
            if (isConfigured) {
                navigate('/dashboard');
            }
        } catch (e) {
            // fallback: do nothing
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">
                        Pharmacy Setup & Configuration
                    </h1>
                    <p className="text-blue-100">
                        Configure your pharmacy information and system settings
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error instanceof Error
                                ? error.message
                                : String(error)}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* System Settings Card */}
                        {(user?.role === UserRole.ADMIN ||
                            user?.role === UserRole.SUPER_ADMIN) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiSettings className="h-5 w-5 text-blue-600" />
                                        System Settings
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Configure system-wide settings and
                                        features
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FiShield className="h-4 w-4 text-blue-600" />
                                                    <h4 className="font-semibold text-blue-900">
                                                        Sale Short Code Security
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-blue-700">
                                                    When enabled, cashiers must
                                                    enter a generated short code
                                                    to finalize and print sales
                                                    receipts.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleToggleShortCode}
                                                disabled={toggleLoading}
                                                className={`
                                                    ml-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                                                    ${
                                                        requireShortCode
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                            >
                                                {toggleLoading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : requireShortCode ? (
                                                    <>
                                                        <FiCheck className="h-4 w-4" />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiX className="h-4 w-4" />
                                                        Disabled
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Information Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiFileText className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Essential pharmacy details displayed on
                                        receipts
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        id="name"
                                        label="Pharmacy Name"
                                        placeholder="Enter your pharmacy name"
                                        {...register('name', {
                                            required:
                                                'Pharmacy name is required',
                                        })}
                                        error={errors.name?.message}
                                    />
                                    <Input
                                        id="slogan"
                                        label="Slogan (Optional)"
                                        placeholder="Your health, Our priority"
                                        {...register('slogan')}
                                        error={errors.slogan?.message}
                                    />
                                </CardContent>
                            </Card>

                            {/* Address Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiMapPin className="h-5 w-5 text-blue-600" />
                                        Address Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Physical location details
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        id="street"
                                        label="Street Address"
                                        placeholder="123 Medical Avenue"
                                        {...register('address.street', {
                                            required:
                                                'Street address is required',
                                        })}
                                        error={errors.address?.street?.message}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            id="city"
                                            label="City"
                                            placeholder="Healthcare City"
                                            {...register('address.city', {
                                                required: 'City is required',
                                            })}
                                            error={
                                                errors.address?.city?.message
                                            }
                                        />
                                        <Input
                                            id="state"
                                            label="State"
                                            placeholder="HC"
                                            {...register('address.state', {
                                                required: 'State is required',
                                            })}
                                            error={
                                                errors.address?.state?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            id="postalCode"
                                            label="Postal Code"
                                            placeholder="12345"
                                            {...register('address.postalCode', {
                                                required:
                                                    'Postal code is required',
                                            })}
                                            error={
                                                errors.address?.postalCode
                                                    ?.message
                                            }
                                        />
                                        <Input
                                            id="country"
                                            label="Country"
                                            placeholder="Ghana"
                                            {...register('address.country', {
                                                required: 'Country is required',
                                            })}
                                            error={
                                                errors.address?.country?.message
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiPhone className="h-5 w-5 text-blue-600" />
                                        Contact Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
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
                                                required:
                                                    'Phone number is required',
                                            })}
                                            error={
                                                errors.contact?.phone?.message
                                            }
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
                                            error={
                                                errors.contact?.email?.message
                                            }
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
                                            error={
                                                errors.contact?.website?.message
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Business Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FiFileText className="h-5 w-5 text-blue-600" />
                                        Business Details
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Legal and operational information
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        id="registrationNumber"
                                        label="Registration Number"
                                        placeholder="PHM-12345-REG"
                                        {...register('registrationNumber', {
                                            required:
                                                'Registration number is required',
                                        })}
                                        error={
                                            errors.registrationNumber?.message
                                        }
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
                                        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="operatingHours"
                                            label="Operating Hours"
                                            placeholder="8:00 AM - 8:00 PM, Mon-Sat"
                                            className="pl-10"
                                            {...register('operatingHours', {
                                                required:
                                                    'Operating hours are required',
                                            })}
                                            error={
                                                errors.operatingHours?.message
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Submit Button */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Ready to save your pharmacy
                                            information?
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            This information will be used
                                            throughout the system and on printed
                                            receipts.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        {isPending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="h-4 w-4" />
                                                Save Configuration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PharmacySetupPage;
