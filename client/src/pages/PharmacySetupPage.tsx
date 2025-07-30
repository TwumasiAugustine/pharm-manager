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

const PharmacySetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { mutate: updatePharmacy, isPending } = useUpdatePharmacyInfo();
    const { data: pharmacyData, isLoading, error } = usePharmacyInfo();
    const [defaultValues, setDefaultValues] = useState<PharmacyInfo | null>(
        null,
    );

    // Check if user is an admin
    useEffect(() => {
        if (!user || user.role !== UserRole.ADMIN) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Set form default values when pharmacy data is loaded
    useEffect(() => {
        if (pharmacyData?.pharmacyInfo) {
            console.log(
                'Setting pharmacy info from React Query:',
                pharmacyData.pharmacyInfo,
            );
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
            // Force reset with the new values
            reset(defaultValues);
            console.log('Form reset with values:', defaultValues);
        }
    }, [defaultValues, reset]);

    const onSubmit = (data: PharmacyInfo) => {
        updatePharmacy(data, {
            onSuccess: () => {
                navigate('/dashboard');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div>Loading...</div>
            </div>
        );
    }

    if(error){
        return(
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error instanceof Error ? error.message : String(error)}</div>
            </div>
        )
    }



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
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-8 divide-y divide-gray-200">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Pharmacy Information
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    This information will be displayed on
                                    receipts and throughout the application.
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
                                            error={errors.slogan?.message}
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
                                            {...register('address.street', {
                                                required:
                                                    'Street address is required',
                                            })}
                                            error={
                                                errors.address?.street?.message
                                            }
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
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
                                    </div>

                                    <div className="sm:col-span-3">
                                        <Input
                                            id="state"
                                            label="State / Province"
                                            placeholder="HC"
                                            {...register('address.state', {
                                                required: 'State is required',
                                            })}
                                            error={
                                                errors.address?.state?.message
                                            }
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <Input
                                            id="postalCode"
                                            label="ZIP / Postal Code"
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
                                    </div>

                                    <div className="sm:col-span-3">
                                        <Input
                                            id="country"
                                            label="Country"
                                            placeholder="United States"
                                            {...register('address.country', {
                                                required: 'Country is required',
                                            })}
                                            error={
                                                errors.address?.country?.message
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
                                            {...register('contact.phone', {
                                                required:
                                                    'Phone number is required',
                                            })}
                                            error={
                                                errors.contact?.phone?.message
                                            }
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <Input
                                            id="email"
                                            label="Email"
                                            type="email"
                                            placeholder="contact@yourpharmacy.com"
                                            {...register('contact.email', {
                                                required: 'Email is required',
                                            })}
                                            error={
                                                errors.contact?.email?.message
                                            }
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <Input
                                            id="website"
                                            label="Website"
                                            placeholder="www.yourpharmacy.com"
                                            {...register('contact.website')}
                                            error={
                                                errors.contact?.website?.message
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
                                            {...register('registrationNumber', {
                                                required:
                                                    'Registration number is required',
                                            })}
                                            error={
                                                errors.registrationNumber
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
                                                required: 'Tax ID is required',
                                            })}
                                            error={errors.taxId?.message}
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <Input
                                            id="operatingHours"
                                            label="Operating Hours"
                                            placeholder="8:00 AM - 8:00 PM, Monday to Saturday"
                                            {...register('operatingHours', {
                                                required:
                                                    'Operating hours are required',
                                            })}
                                            error={
                                                errors.operatingHours?.message
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
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default PharmacySetupPage;
