import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import {
    useUpdatePharmacyInfo,
    usePharmacyInfo,
    useUpdateShortCodeSettings,
} from '../hooks/usePharmacy';
import type { PharmacyInfo } from '../api/pharmacy.api';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user.types';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSION_KEYS } from '../types/permission.types';
import DashboardLayout from '../layouts/DashboardLayout';
import { Alert, AlertDescription } from '../components/molecules/Alert';
import { ExpiredSaleStatsCard } from '../components/molecules/ExpiredSaleStatsCard';
import { PharmacySetupHeader } from '../components/organisms/pharmacy/PharmacySetupHeader';
import { PharmacySystemSettings } from '../components/organisms/pharmacy/PharmacySystemSettings';
import { PharmacyBasicInfoForm } from '../components/organisms/pharmacy/PharmacyBasicInfoForm';
import { PharmacyAddressForm } from '../components/organisms/pharmacy/PharmacyAddressForm';
import { PharmacyContactForm } from '../components/organisms/pharmacy/PharmacyContactForm';
import { PharmacyBusinessDetailsForm } from '../components/organisms/pharmacy/PharmacyBusinessDetailsForm';
import { PharmacySubmitButton } from '../components/organisms/pharmacy/PharmacySubmitButton';
import { pharmacyApi } from '../api/pharmacy.api';
import { useQueryClient } from '@tanstack/react-query';

const PharmacySetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { hasPermission } = usePermissions();
    const { mutate: updatePharmacy, isPending } = useUpdatePharmacyInfo();
    const { mutate: updateShortCodeSettings, isPending: isUpdatingSettings } =
        useUpdateShortCodeSettings();
    const { data: pharmacyData, isLoading, error } = usePharmacyInfo();
    const [defaultValues, setDefaultValues] = useState<PharmacyInfo | null>(
        null,
    );
    const [requireShortCode, setRequireShortCode] = useState(false);

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.pharmacySetup,
        canonicalPath: '/pharmacy-setup',
    });
    const [shortCodeExpiryMinutes, setShortCodeExpiryMinutes] = useState(15);
    const [toggleLoading, setToggleLoading] = useState(false);
    const queryClient = useQueryClient();

    // Fetch current toggle state on mount
    useEffect(() => {
        if (pharmacyData?.pharmacyInfo?.requireSaleShortCode !== undefined) {
            setRequireShortCode(
                !!pharmacyData.pharmacyInfo.requireSaleShortCode,
            );
        }
        if (pharmacyData?.pharmacyInfo?.shortCodeExpiryMinutes !== undefined) {
            setShortCodeExpiryMinutes(
                pharmacyData.pharmacyInfo.shortCodeExpiryMinutes,
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

    const handleUpdateExpiryMinutes = (minutes: number) => {
        if (minutes < 1 || minutes > 1440) {
            // 1 minute to 24 hours
            return;
        }
        setShortCodeExpiryMinutes(minutes);
        updateShortCodeSettings({
            shortCodeExpiryMinutes: minutes,
        });
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
        } catch {
            // fallback: do nothing
        }
    };

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
                <PharmacySetupHeader />

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error instanceof Error
                                ? error.message
                                : String(error)}
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 animate-pulse"
                            >
                                <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="h-8 sm:h-10 bg-gray-200 rounded"></div>
                                    <div className="h-8 sm:h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 sm:space-y-6"
                    >
                        {(user?.role === UserRole.ADMIN ||
                            user?.role === UserRole.SUPER_ADMIN) && (
                            <PharmacySystemSettings
                                requireShortCode={requireShortCode}
                                shortCodeExpiryMinutes={shortCodeExpiryMinutes}
                                toggleLoading={toggleLoading}
                                isUpdatingSettings={isUpdatingSettings}
                                onToggleShortCode={handleToggleShortCode}
                                onUpdateExpiryMinutes={
                                    handleUpdateExpiryMinutes
                                }
                            />
                        )}

                        {requireShortCode &&
                            (user?.role === UserRole.ADMIN ||
                                user?.role === UserRole.SUPER_ADMIN) && (
                                <ExpiredSaleStatsCard />
                            )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <PharmacyBasicInfoForm
                                register={register}
                                errors={errors}
                                canUpdateName={hasPermission(
                                    PERMISSION_KEYS.UPDATE_PHARMACY_NAME,
                                )}
                            />
                            <PharmacyAddressForm
                                register={register}
                                errors={errors}
                            />
                            <PharmacyContactForm
                                register={register}
                                errors={errors}
                            />
                            <PharmacyBusinessDetailsForm
                                register={register}
                                errors={errors}
                            />
                        </div>

                        <PharmacySubmitButton isPending={isPending} />
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PharmacySetupPage;
