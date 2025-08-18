import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import CashierShortCodeInput from '../components/organisms/CashierShortCodeInput';
import FinalizedSaleDisplay from '../components/organisms/FinalizedSaleDisplay';
import PharmacistShortCodeDisplay from '../components/organisms/PharmacistShortCodeDisplay';
import CreateSaleForm from '../components/organisms/CreateSaleForm';
import saleApi from '../api/sale.api';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCreateSale } from '../hooks/useSales';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import { useDrugs } from '../hooks/useDrugs';
import type { Drug } from '../types/drug.types';
import type { Sale } from '../types/sale.types';

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
    // Sale item type for form
    type PaymentMethod = 'cash' | 'card' | 'mobile';
    type SaleFormItem = {
        drugId: string;
        drugName: string;
        quantity: number;
        priceAtSale: number;
        maxQuantity: number;
        saleType: 'unit' | 'pack' | 'carton';
    };
    type SaleFormType = {
        items: SaleFormItem[];
        paymentMethod: PaymentMethod;
        transactionId?: string;
        notes?: string;
        customerId?: string;
    };
    const form = useForm<SaleFormType>({
        defaultValues: { items: [], paymentMethod: 'cash' },
    });
    const { fields, append, remove } = useFieldArray<
        SaleFormType,
        'items',
        'id'
    >({
        control: form.control,
        name: 'items',
    });
    const { errors } = form.formState;

    // Calculate total amount
    const totalAmount = form
        .watch('items')
        .reduce(
            (sum, item) => sum + (item.priceAtSale || 0) * (item.quantity || 0),
            0,
        );

    // Add drug to sale
    const handleAddDrug = (drug: Drug) => {
        if (!fields.some((item) => item.drugId === drug.id)) {
            append({
                drugId: drug.id,
                drugName: drug.name,
                quantity: 1,
                priceAtSale: drug.pricePerUnit || 0,
                maxQuantity: drug.quantity,
                saleType: 'unit',
            });
        }
        setSearchTerm('');
    };

    // Sale mutation
    const mutation = useCreateSale();

    // Sale form submit handler
    const onSubmit = (data: {
        items: SaleFormItem[];
        paymentMethod: PaymentMethod;
        transactionId?: string;
        notes?: string;
        customerId?: string;
    }) => {
        const payload = {
            items: data.items.map(({ drugId, quantity, saleType }) => ({
                drugId,
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
            onSuccess: (sale) => {
                if (requireShortCode && sale.shortCode) {
                    setShortCode(sale.shortCode);
                } else {
                    navigate(`/sales/${sale._id}`);
                }
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
        } catch {
            setShortCodeError('Invalid or expired code.');
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                {/* Pharmacist: Show short code after sale is prepared */}
                {requireShortCode &&
                    isPharmacist &&
                    shortCode &&
                    !finalizedSale && (
                        <PharmacistShortCodeDisplay shortCode={shortCode} />
                    )}
                {/* Cashier: Only show code input and status until code is validated */}
                {requireShortCode && isCashier && !finalizedSale && (
                    <CashierShortCodeInput
                        onFinalize={handleFinalizeByShortCode}
                        isFinalizing={isFinalizing}
                        error={shortCodeError || ''}
                    />
                )}
                {/* Cashier: Show finalized sale details after code is validated */}
                {requireShortCode && isCashier && finalizedSale && (
                    <FinalizedSaleDisplay
                        sale={finalizedSale}
                        onViewReceipt={() =>
                            navigate(
                                `/sales/${
                                    finalizedSale._id || finalizedSale.id
                                }`,
                            )
                        }
                    />
                )}
                {/* If requireShortCode is true and user is pharmacist, block direct sale finalization */}
                {requireShortCode && isPharmacist && !shortCode && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded text-center">
                        <div className="text-lg font-bold text-yellow-800 mb-2">
                            Short Code Required
                        </div>
                        <div className="text-yellow-700">
                            You cannot finalize the sale directly. Prepare the
                            sale and a short code will be generated for the
                            cashier to complete the transaction.
                        </div>
                    </div>
                )}
                {/* If requireShortCode is false or user is admin, show normal sale form */}
                {(!requireShortCode ||
                    user?.role === 'admin' ||
                    (requireShortCode && isPharmacist && !shortCode)) && (
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
                )}
            </div>
        </DashboardLayout>
    );
};

export default SalesNewPage;
