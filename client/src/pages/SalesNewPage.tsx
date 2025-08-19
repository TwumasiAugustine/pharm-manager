import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import CashierShortCodeInput from '../components/organisms/CashierShortCodeInput';
import FinalizedSaleDisplay from '../components/organisms/FinalizedSaleDisplay';
import PharmacistShortCodeDisplay from '../components/organisms/PharmacistShortCodeDisplay';
import CreateSaleForm from '../components/organisms/CreateSaleForm';
import { CustomerSelect } from '../components/molecules/CustomerSelect';
import saleApi from '../api/sale.api';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCreateSale } from '../hooks/useSales';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import { useDrugs } from '../hooks/useDrugs';
import type { Drug } from '../types/drug.types';
import type { Sale, SaleFormItem, SaleFormInput } from '../types/sale.types';

const SalesNewPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [shortCode, setShortCode] = useState<string | null>(null);
    const [shortCodeError, setShortCodeError] = useState<string>('');
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalizedSale, setFinalizedSale] = useState<Sale | null>(null);

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
    const form = useForm<SaleFormInput>({
        defaultValues: { items: [], paymentMethod: 'cash' },
    });
    // Customer selection state (for CustomerSelect)
    const selectedCustomerId = form.watch('customerId');
    const handleCustomerChange = (customerId: string | undefined) => {
        form.setValue('customerId', customerId);
    };
    const { fields, append, remove } = useFieldArray<
        SaleFormInput,
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
        ? items.reduce((sum: number, item: SaleFormItem) => {
              const drugInfo = (drugData?.drugs || []).find(
                  (d) => d.id === item.drug,
              );
              const price = drugInfo?.pricePerUnit ?? 0;
              return sum + price * (item.quantity || 0);
          }, 0)
        : 0;

    // Add drug to sale
    const handleAddDrug = (drug: Drug) => {
        if (!fields.some((item) => item.drug === drug.id)) {
            append({
                drug: drug.id,
                quantity: 1,
                saleType: 'unit',
            });
        }
        setSearchTerm('');
    };

    // Sale mutation
    const mutation = useCreateSale();

    // Sale form submit handler
    const onSubmit = (data: SaleFormInput) => {
        const payload = {
            items: data.items.map(({ drug, quantity, saleType }) => ({
                drugId: drug,
                quantity,
                saleType,
            })),
            totalAmount,
            paymentMethod: data.paymentMethod,
            customerId: data.customerId,
            transactionId: data.transactionId,
            notes: data.notes,
        };
        mutation.mutate(payload, {
            onSuccess: (sale: any) => {
                // Debug: log sale object and relevant flags
                // eslint-disable-next-line no-console
                console.log('Sale response:', sale, {
                    requireShortCode,
                    isPharmacist,
                    shortCode: sale.shortCode,
                });
                // Use backend value if present, else fallback
                const backendRequireShortCode =
                    typeof sale.requireShortCode !== 'undefined'
                        ? sale.requireShortCode
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
        } catch (err: any) {
            // Handle 401 Unauthorized (show message in UI)
            if (err?.response?.status === 401) {
                setShortCodeError(
                    'You are not authorized to finalize sales. Please contact your administrator.',
                );
                return;
            }
            // If sale is already finalized, show it for printing
            if (err?.response?.data?.message?.includes('already finalized')) {
                try {
                    const sale = await saleApi.getSaleByShortCode(code);
                    setFinalizedSale(sale);
                    setShortCodeError('');
                    return;
                } catch (fetchErr) {
                    setShortCodeError('Could not fetch finalized sale.');
                    return;
                }
            }
            setShortCodeError(
                err?.response?.data?.message || 'Invalid or expired code.',
            );
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                {/* Cashier: Always show code input if short code is required */}
                {effectiveRequireShortCode && isCashier && (
                    <>
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
                    </>
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
