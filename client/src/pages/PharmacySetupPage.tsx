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

import { pharmacyApi } from '../api/pharmacy.api';
import { useQueryClient } from '@tanstack/react-query';

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
        } catch (e) {
            alert('Failed to update sale short code setting');
        } finally {
            setToggleLoading(false);
        }
    };

    // Check if user is an admin
    useEffect(() => {
        if (!user || user.role !== UserRole.ADMIN) {
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

    const onSubmit = (data: PharmacyInfo) => {
        updatePharmacy(data, {
            onSuccess: () => {
                navigate('/dashboard');
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Welcome to Your Pharmacy Management System
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please set up your pharmacy information to get started
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* Error State */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-300 rounded-md p-4 text-center">
                                <div className="text-red-500">
                                    {error instanceof Error
                                        ? error.message
                                        : String(error)}
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="space-y-6 animate-pulse">
                                <div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="sm:col-span-6">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-20 bg-gray-200 rounded"></div>
                                    </div>
                                </div>

                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                </div>

                                <div className="h-10 bg-gray-200 rounded w-32 ml-auto"></div>
                            </div>
                        ) : (
                            <form
                                className="space-y-6"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="space-y-8 divide-y divide-gray-200">
                                    {/* Sale Short Code Feature Toggle (Admin Only) */}
                                    {user?.role === UserRole.ADMIN && (
                                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                            <div>
                                                <div className="font-semibold text-blue-900">
                                                    Require Sale Short Code for
                                                    Finalizing/Printing Sales
                                                </div>
                                                <div className="text-xs text-blue-700 mt-1">
                                                    When enabled, a short code
                                                    will be generated for each
                                                    sale. Cashiers must enter
                                                    this code to finalize and
                                                    print the receipt.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className={`ml-4 px-4 py-2 rounded ${
                                                    requireShortCode
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                } font-semibold focus:outline-none`}
                                                onClick={handleToggleShortCode}
                                                disabled={toggleLoading}
                                            >
                                                {requireShortCode
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </button>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Pharmacy Information
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            This information will be displayed
                                            on receipts and throughout the
                                            application.
                                        </p>

                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-4">
                                                <Input
                                                    id="name"
                                                    label="Pharmacy Name"
                                                    placeholder="Enter pharmacy name"
                                                    {...register('name', {
                                                        required:
                                                            'Pharmacy name is required',
                                                    })}
                                                    error={errors.name?.message}
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <Input
                                                    id="slogan"
                                                    label="Slogan"
                                                    placeholder="Your Health, Our Priority"
                                                    {...register('slogan')}
                                                    error={
                                                        errors.slogan?.message
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Address
                                        </h3>

                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-6">
                                                <Input
                                                    id="street"
                                                    label="Street Address"
                                                    placeholder="123 Medical Avenue"
                                                    {...register(
                                                        'address.street',
                                                        {
                                                            required:
                                                                'Street address is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.address?.street
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="city"
                                                    label="City"
                                                    placeholder="Healthcare City"
                                                    {...register(
                                                        'address.city',
                                                        {
                                                            required:
                                                                'City is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.address?.city
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="state"
                                                    label="State / Province"
                                                    placeholder="HC"
                                                    {...register(
                                                        'address.state',
                                                        {
                                                            required:
                                                                'State is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.address?.state
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="postalCode"
                                                    label="ZIP / Postal Code"
                                                    placeholder="12345"
                                                    {...register(
                                                        'address.postalCode',
                                                        {
                                                            required:
                                                                'Postal code is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.address
                                                            ?.postalCode
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="country"
                                                    label="Country"
                                                    placeholder="United States"
                                                    {...register(
                                                        'address.country',
                                                        {
                                                            required:
                                                                'Country is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.address?.country
                                                            ?.message
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Contact Information
                                        </h3>

                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="phone"
                                                    label="Phone Number"
                                                    placeholder="+1 (555) 123-4567"
                                                    {...register(
                                                        'contact.phone',
                                                        {
                                                            required:
                                                                'Phone number is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.contact?.phone
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="email"
                                                    label="Email"
                                                    type="email"
                                                    placeholder="contact@yourpharmacy.com"
                                                    {...register(
                                                        'contact.email',
                                                        {
                                                            required:
                                                                'Email is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.contact?.email
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <Input
                                                    id="website"
                                                    label="Website"
                                                    placeholder="www.yourpharmacy.com"
                                                    {...register(
                                                        'contact.website',
                                                    )}
                                                    error={
                                                        errors.contact?.website
                                                            ?.message
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Business Details
                                        </h3>

                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="registrationNumber"
                                                    label="Registration Number"
                                                    placeholder="PHM-12345-REG"
                                                    {...register(
                                                        'registrationNumber',
                                                        {
                                                            required:
                                                                'Registration number is required',
                                                        },
                                                    )}
                                                    error={
                                                        errors
                                                            .registrationNumber
                                                            ?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Input
                                                    id="taxId"
                                                    label="Tax ID"
                                                    placeholder="TAX-67890-ID"
                                                    {...register('taxId', {
                                                        required:
                                                            'Tax ID is required',
                                                    })}
                                                    error={
                                                        errors.taxId?.message
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <Input
                                                    id="operatingHours"
                                                    label="Operating Hours"
                                                    placeholder="8:00 AM - 8:00 PM, Monday to Saturday"
                                                    {...register(
                                                        'operatingHours',
                                                        {
                                                            required:
                                                                'Operating hours are required',
                                                        },
                                                    )}
                                                    error={
                                                        errors.operatingHours
                                                            ?.message
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-5">
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            isLoading={isPending}
                                            className="ml-3"
                                        >
                                            Save Pharmacy Information
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PharmacySetupPage;
