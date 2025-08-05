import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDrugs } from '../hooks/useDrugs';
import { useCreateSale } from '../hooks/useSales';
import DashboardLayout from '../layouts/DashboardLayout';
import CreateSaleForm from '../components/organisms/CreateSaleForm';
import {
    createSaleSchema,
    type CreateSaleFormValues,
} from '../validations/sale.validation';
import { useSafeNotify } from '../utils/useSafeNotify';
import { useNavigate } from 'react-router-dom';
import type { Drug } from '../types/drug.types';
import { getErrorMessage } from '../utils/error';

const CreateSalePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: drugData, isLoading: isLoadingDrugs } = useDrugs({
        search: searchTerm,
        limit: 10,
    });

    // Sale creation hook
    const createSaleMutation = useCreateSale();

    const form = useForm<CreateSaleFormValues>({
        resolver: zodResolver(createSaleSchema),
        defaultValues: {
            items: [],
        },
    });
    const {
        control,
        watch,
        formState: { errors },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');
    const totalAmount = useMemo(() => {
        return watchedItems.reduce(
            (total, item) =>
                total + (item.priceAtSale || 0) * (item.quantity || 0),
            0,
        );
    }, [watchedItems]);

    const handleAddDrug = (drug: Drug) => {
        const existingItemIndex = fields.findIndex(
            (item) => item.drugId === drug.id,
        );
        if (existingItemIndex === -1) {
            append({
                drugId: drug.id,
                drugName: drug.name,
                quantity: 1,
                priceAtSale: drug.price,
                maxQuantity: drug.quantity,
            });
        }
        setSearchTerm('');
    };

    const notify = useSafeNotify();
    const onSubmit = async (data: CreateSaleFormValues) => {
        try {
            const saleData = {
                items: data.items.map((item) => ({
                    drugId: item.drugId,
                    quantity: item.quantity,
                })),
                totalAmount,
                paymentMethod: data.paymentMethod as "cash" | "card" | "mobile",
                transactionId: data.transactionId,
                notes: data.notes,
            };

            createSaleMutation.mutate(saleData, {
                onSuccess: () => {
                    notify.success('Sale created successfully!');
                    navigate('/sales');
                },
                onError: (error) => {
                    notify.error(getErrorMessage(error));
                },
            });
        } catch (error) {
            console.error('Unexpected error in onSubmit:', error);
            notify.error('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <FormProvider {...form}>
                    <CreateSaleForm
                        onSubmit={onSubmit}
                        drugData={drugData}
                        isLoadingDrugs={isLoadingDrugs}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        handleAddDrug={handleAddDrug}
                        fields={fields}
                        remove={remove}
                        errors={errors}
                        totalAmount={totalAmount}
                        createSaleMutation={createSaleMutation}
                    />
                </FormProvider>
            </div>
        </DashboardLayout>
    );
};

export default CreateSalePage;
