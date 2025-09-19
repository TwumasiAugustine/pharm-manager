// Type guard for API errors
function isApiError(
    err: unknown,
): err is { response: { status?: number; data?: { message?: string } } } {
    return (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object'
    );
}
// Local type for sale response with optional requireShortCode
type SaleWithShortCode = Sale & { requireShortCode?: boolean };
import React, { useState } from 'react';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { useAuthStore } from '../store/auth.store';
import CashierShortCodeInput from '../components/organisms/CashierShortCodeInput';
import FinalizedSaleDisplay from '../components/organisms/FinalizedSaleDisplay';
import PharmacistShortCodeDisplay from '../components/organisms/PharmacistShortCodeDisplay';
import CreateSaleForm from '../components/organisms/CreateSaleForm';
import PermissionGuard from '../components/atoms/PermissionGuard';
import { PERMISSION_KEYS } from '../types/permission.types';
import { CustomerSelect } from '../components/molecules/CustomerSelect';
import saleApi from '../api/sale.api';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCreateSale } from '../hooks/useSales';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import { useDrugs } from '../hooks/useDrugs';
import type { Drug } from '../types/drug.types';
import type { Sale } from '../types/sale.types';
import type { CreateSaleFormValues } from '../validations/sale.validation';

const SalesNewPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [shortCode, setShortCode] = useState<string | null>(null);
    const [shortCodeError, setShortCodeError] = useState<string>('');
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalizedSale, setFinalizedSale] = useState<Sale | null>(null);

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.createSale,
        canonicalPath: '/sales/new',
    });

    // Fetch pharmacy info to determine if short code is required
    const { data: pharmacyData } = usePharmacyInfo();
    const requireShortCode = pharmacyData?.pharmacyInfo?.requireSaleShortCode;
    const isPharmacist = user?.role === 'pharmacist';
    const isCashier = user?.role === 'cashier';

    // Drug search and sale form state
    const { data: drugData, isLoading: drugsLoading } = useDrugs({
        search: searchTerm,
        limit: 10,
    });

    // Track if requireShortCode should be overridden by backend response
    const [effectiveRequireShortCode, setEffectiveRequireShortCode] = useState<
        boolean | undefined
    >(requireShortCode);
    // Keep effectiveRequireShortCode in sync with latest pharmacy info
    React.useEffect(() => {
        setEffectiveRequireShortCode(requireShortCode);
    }, [requireShortCode]);

    // Sale item type for form now imported from types/sale.types.ts
    const form = useForm<CreateSaleFormValues>({
        defaultValues: { items: [], paymentMethod: '' },
    });
    // Customer selection state (for CustomerSelect)
    const selectedCustomerId = form.watch('customerId');
    const handleCustomerChange = (customerId: string | undefined) => {
        form.setValue('customerId', customerId);
    };
    const { fields, append, remove } = useFieldArray<
        CreateSaleFormValues,
        'items',
        'id'
    >({
        control: form.control,
        name: 'items',
    });
    const { errors } = form.formState;

    // Calculate total amount: sum of price * quantity for each item
    const items = form.watch('items');
    const totalAmount = Array.isArray(items)
        ? items.reduce((sum: number, item) => {
              const drugInfo = (drugData?.drugs || []).find(
                  (d) => d.id === item.drugId,
              );
              let price = 0;
              if (drugInfo) {
                  if (item.saleType === 'unit') price = drugInfo.pricePerUnit;
                  else if (item.saleType === 'pack')
                      price = drugInfo.pricePerPack;
                  else if (item.saleType === 'carton')
                      price = drugInfo.pricePerCarton;
              }
              return sum + price * (item.quantity || 0);
          }, 0)
        : 0;

    // Add drug to sale
    const handleAddDrug = (drug: Drug) => {
        if (!fields.some((item) => item.drugId === drug.id)) {
            append({
                drugId: drug.id,
                drugName: drug.name,
                quantity: 1,
                priceAtSale: drug.pricePerUnit || 0,
                maxQuantity: drug.quantity || 0,
                saleType: 'unit', // default, user can change in form
            });
        }
        setSearchTerm('');
    };

    // Sale mutation
    const mutation = useCreateSale();

    // Sale form submit handler
    const onSubmit = (data: CreateSaleFormValues) => {
        const payload = {
            items: data.items.map(({ drugId, quantity, saleType }) => ({
                drugId,
                quantity,
                saleType,
            })),
            totalAmount,
            paymentMethod: data.paymentMethod as 'cash' | 'card' | 'mobile',
            customerId: data.customerId,
            transactionId: data.transactionId,
            notes: data.notes,
        };
        mutation.mutate(payload, {
            onSuccess: (sale: Sale) => {
                // Debug: log sale object and relevant flags
                console.log('Sale response:', sale, {
                    requireShortCode,
                    isPharmacist,
                    shortCode: sale.shortCode,
                });
                const saleWithShortCode = sale as SaleWithShortCode;
                const backendRequireShortCode =
                    typeof saleWithShortCode.requireShortCode !== 'undefined'
                        ? saleWithShortCode.requireShortCode
                        : requireShortCode;
                setEffectiveRequireShortCode(backendRequireShortCode);
                // If short code is required and user is pharmacist, always show code and never redirect
                if (backendRequireShortCode && isPharmacist && sale.shortCode) {
                    setShortCode(sale.shortCode);
                    return;
                }
                // Otherwise, redirect to receipt
                navigate(`/sales/${sale._id}`);
            },
        });
    };

    // Cashier: finalize sale by short code
    const handleFinalizeByShortCode = async (code: string) => {
        setShortCodeError('');
        setIsFinalizing(true);
        try {
            // Replace with actual API call
            const sale = await saleApi.finalizeSaleByShortCode(code);
            setFinalizedSale(sale);
            setShortCodeError('');
        } catch (err: unknown) {
            if (isApiError(err) && err.response?.status === 401) {
                setShortCodeError(
                    'You are not authorized to finalize sales. Please contact your administrator.',
                );
                return;
            }
            if (
                isApiError(err) &&
                typeof err.response?.data?.message === 'string' &&
                err.response.data.message.includes('already finalized')
            ) {
                try {
                    const sale = await saleApi.getSaleByShortCode(code);
                    setFinalizedSale(sale);
                    setShortCodeError('');
                    return;
                } catch (err2) {
                    setShortCodeError(
                        `${err2}, Could not fetch finalized sale.`,
                    );
                    return;
                }
            }
            let errorMsg = 'Invalid or expired code.';
            if (
                isApiError(err) &&
                typeof err.response?.data?.message === 'string'
            ) {
                errorMsg = err.response.data.message;
            }
            setShortCodeError(errorMsg);
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                {/* Cashier: Always show code input if short code is required */}
                {effectiveRequireShortCode && isCashier && (
                    <PermissionGuard
                        permission={PERMISSION_KEYS.FINALIZE_SALE}
                        fallback={
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    You don't have permission to finalize sales.
                                </p>
                            </div>
                        }
                    >
                        <h2 className="text-xl font-bold text-center mb-4">
                            Enter Sale Short Code
                        </h2>
                        <CashierShortCodeInput
                            onFinalize={handleFinalizeByShortCode}
                            isFinalizing={isFinalizing}
                            error={shortCodeError || ''}
                        />
                        {finalizedSale && (
                            <FinalizedSaleDisplay
                                sale={finalizedSale}
                                onViewReceipt={() =>
                                    navigate(
                                        `/sales/${
                                            finalizedSale._id ||
                                            finalizedSale.id
                                        }`,
                                    )
                                }
                            />
                        )}
                    </PermissionGuard>
                )}
                {/* Pharmacist and admin: Customer selection and sale form */}
                {!isCashier && (
                    <>
                        <div className="mb-4">
                            <CustomerSelect
                                value={selectedCustomerId}
                                onChange={handleCustomerChange}
                            />
                        </div>
                        {/* Pharmacist: Show short code after sale is prepared */}
                        {effectiveRequireShortCode &&
                            isPharmacist &&
                            shortCode &&
                            !finalizedSale && (
                                <PharmacistShortCodeDisplay
                                    shortCode={shortCode}
                                />
                            )}
                        {/* If requireShortCode is true and user is pharmacist, block direct sale finalization */}
                        {effectiveRequireShortCode &&
                            isPharmacist &&
                            !shortCode && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded text-center">
                                    <div className="text-lg font-bold text-yellow-800 mb-2">
                                        Short Code Required
                                    </div>
                                    <div className="text-yellow-700">
                                        You cannot finalize the sale directly.
                                        Prepare the sale and a short code will
                                        be generated for the cashier to complete
                                        the transaction.
                                    </div>
                                </div>
                            )}
                        {/* If requireShortCode is false or user is admin, show normal sale form */}
                        {(!effectiveRequireShortCode ||
                            user?.role === 'admin' ||
                            (effectiveRequireShortCode &&
                                isPharmacist &&
                                !shortCode)) && (
                            <FormProvider {...form}>
                                <CreateSaleForm
                                    onSubmit={onSubmit}
                                    drugData={drugData}
                                    isLoadingDrugs={drugsLoading}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    handleAddDrug={handleAddDrug}
                                    fields={fields}
                                    remove={remove}
                                    errors={errors}
                                    totalAmount={totalAmount}
                                    createSaleMutation={mutation}
                                />
                            </FormProvider>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SalesNewPage;
