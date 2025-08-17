import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SaleFormInput } from '../types/sale.types';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '../components/molecules/Alert';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCreateSale } from '../hooks/useSales';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import { useDrugs } from '../hooks/useDrugs';
import type { Drug } from '../types/drug.types';
import { getErrorMessage } from '../utils/error';
import { SearchBar } from '../components/molecules/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import { CustomerSelect } from '../components/molecules/CustomerSelect';
import { FaShoppingCart, FaPills, FaUser } from 'react-icons/fa';

const SalesNewPage: React.FC = () => {
    const navigate = useNavigate();

    // Search state for drugs
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<
        string | undefined
    >();
    const debouncedSearch = useDebounce(searchTerm, 400);
    const {
        data: drugData,
        isLoading: drugsLoading,
        error: drugsError,
    } = useDrugs({ search: debouncedSearch, limit: 20 });
    const drugs = drugData?.drugs || [];

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SaleFormInput>({
        defaultValues: {
            items: [],
            paymentMethod: 'cash',
        },
    });
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'items',
    });

    // Remove any empty/unknown drugs on mount and after each append
    useEffect(() => {
        if (fields.some((f) => !f.drug)) {
            replace(fields.filter((f) => f.drug));
        }
    }, [fields, replace]);
    const mutation = useCreateSale();
    const { data: pharmacyData } = usePharmacyInfo();
    const [shortCode, setShortCode] = useState<string | null>(null);
    const onSubmit = (values: SaleFormInput) => {
        // Calculate totalAmount from selected drugs and quantities, respecting saleType
        const selectedDrugs = values.items.map((item) => {
            const drug = drugs.find((d: Drug) => d.id === item.drug);
            let price = 0;
            if (drug) {
                if (item.saleType === 'unit') price = drug.pricePerUnit || 0;
                else if (item.saleType === 'pack')
                    price = drug.pricePerPack || 0;
                else if (item.saleType === 'carton')
                    price = drug.pricePerCarton || 0;
            }
            return {
                price,
                quantity: item.quantity,
                drugId: item.drug,
                saleType: item.saleType,
            };
        });
        const totalAmount = selectedDrugs.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
        const payload = {
            items: selectedDrugs.map(({ drugId, quantity, saleType }) => ({
                drugId,
                quantity,
                saleType,
            })),
            totalAmount,
            paymentMethod: values.paymentMethod,
            customerId: selectedCustomerId,
            transactionId: values.transactionId,
            notes: values.notes,
        };
        mutation.mutate(payload, {
            onSuccess: (sale) => {
                if (
                    pharmacyData?.pharmacyInfo?.requireSaleShortCode &&
                    sale.shortCode
                ) {
                    setShortCode(sale.shortCode);
                } else {
                    navigate(`/sales/${sale._id}`);
                }
            },
        });
    };
    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                {/* Show short code if generated */}
                {shortCode && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded text-center">
                        <div className="text-lg font-bold text-blue-800">
                            Sale Short Code
                        </div>
                        <div className="text-3xl font-mono text-blue-900 my-2">
                            {shortCode}
                        </div>
                        <div className="text-sm text-blue-700 mb-2">
                            Give this code to the cashier to finalize and print
                            the receipt.
                        </div>
                        <Button onClick={() => navigate('/sales')}>Done</Button>
                    </div>
                )}
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <FaShoppingCart className="mr-2 text-green-500" />
                    New Sale
                </h2>
                {mutation.error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {getErrorMessage(mutation.error)}
                        </AlertDescription>
                    </Alert>
                )}
                {drugsError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Drug Load Error</AlertTitle>
                        <AlertDescription>
                            {getErrorMessage(drugsError)}
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        {/* Customer selection */}
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaUser className="mr-1 text-blue-500" />
                                Customer
                            </label>
                            <CustomerSelect
                                onChange={(customerId) => {
                                    setSelectedCustomerId(customerId);
                                    setValue('customerId', customerId);
                                }}
                                value={selectedCustomerId}
                            />
                        </div>

                        {/* Drug SearchBar and selection for first item only */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <FaPills className="mr-1 text-blue-500" />
                                Search and select drug
                            </label>
                            <SearchBar
                                placeholder="Type drug name..."
                                onSearch={setSearchTerm}
                                className="w-full"
                                initialValue={searchTerm}
                            />
                            {drugsLoading && (
                                <div className="text-gray-500 text-sm">
                                    Loading drugs...
                                </div>
                            )}
                            {searchTerm &&
                                drugs.length > 0 &&
                                !drugsLoading && (
                                    <ul className="border rounded-md max-h-40 overflow-y-auto bg-white z-10 relative">
                                        {drugs
                                            .filter(
                                                (drug, idx, arr) =>
                                                    arr.findIndex(
                                                        (d) => d.id === drug.id,
                                                    ) === idx,
                                            )
                                            .filter(
                                                (drug) =>
                                                    !fields.some(
                                                        (f) =>
                                                            f.drug === drug.id,
                                                    ),
                                            )
                                            .map((drug) => (
                                                <li
                                                    key={drug.id}
                                                    className="p-2 flex justify-between cursor-pointer hover:bg-blue-50"
                                                    onClick={() => {
                                                        append({
                                                            drug: drug.id,
                                                            quantity: 1,
                                                            saleType: 'unit',
                                                        });
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    <span>{drug.name}</span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({drug.brand})
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        In Stock:{' '}
                                                        {drug.quantity}
                                                    </span>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            {searchTerm &&
                                !drugsLoading &&
                                drugs.length === 0 && (
                                    <div className="text-gray-500 text-sm">
                                        No drugs found for "{searchTerm}"
                                    </div>
                                )}
                        </div>
                        {/* Sale Items - show only selected drugs with quantity and remove */}
                        {fields.map((field, idx) => {
                            const drug = drugs.find(
                                (d: Drug) => d.id === field.drug,
                            );
                            // Calculate price and profit for this item
                            let price = 0;
                            let cost = 0;
                            let profit = 0;
                            const quantity = field.quantity || 1;
                            const saleType = field.saleType || 'unit';
                            if (drug) {
                                if (saleType === 'unit') {
                                    price = drug.pricePerUnit || 0;
                                    cost = drug.costPrice || 0;
                                } else if (saleType === 'pack') {
                                    price = drug.pricePerPack || 0;
                                    cost =
                                        (drug.costPrice || 0) *
                                        (drug.unitsPerCarton || 1);
                                } else if (saleType === 'carton') {
                                    price = drug.pricePerCarton || 0;
                                    cost =
                                        (drug.costPrice || 0) *
                                        (drug.unitsPerCarton || 1) *
                                        (drug.packsPerCarton || 1);
                                }
                                profit = (price - cost) * quantity;
                            }
                            return (
                                <div
                                    key={field.id}
                                    className="flex items-end gap-4"
                                >
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                            Drug
                                        </label>
                                        <div className="p-2 border rounded bg-gray-50">
                                            {drug ? (
                                                <>
                                                    <span className="font-medium">
                                                        {drug.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({drug.brand})
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        In Stock:{' '}
                                                        {drug.quantity}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Unknown Drug
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Qty
                                        </label>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...register(
                                                `items.${idx}.quantity` as const,
                                                { valueAsNumber: true },
                                            )}
                                            className="w-20"
                                        />
                                        {errors.items?.[idx]?.quantity && (
                                            <span className="text-red-500 text-xs">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Sale Type
                                        </label>
                                        <select
                                            {...register(
                                                `items.${idx}.saleType` as const,
                                            )}
                                            className="w-24 border rounded p-1"
                                            defaultValue={
                                                field.saleType || 'unit'
                                            }
                                        >
                                            <option value="unit">Unit</option>
                                            <option value="pack">Pack</option>
                                            <option value="carton">
                                                Carton
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Profit
                                        </label>
                                        <div className="p-2 border rounded bg-gray-50 min-w-[60px] text-right">
                                            {profit.toFixed(2)}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => {
                                            remove(idx);
                                            setSearchTerm(''); // Reset search to update list in real time
                                        }}
                                        className="mb-1"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            );
                        })}
                        {/* No Add Item button - drugs are only added via search */}
                        {/* Total profit display */}
                        <div className="flex justify-end items-center gap-4 mt-2">
                            <div className="text-green-700 font-semibold">
                                Total Profit:{' '}
                                {fields
                                    .reduce((sum, field) => {
                                        const drug = drugs.find(
                                            (d: Drug) => d.id === field.drug,
                                        );
                                        let price = 0;
                                        let cost = 0;
                                        const quantity = field.quantity || 1;
                                        const saleType =
                                            field.saleType || 'unit';
                                        if (drug) {
                                            if (saleType === 'unit') {
                                                price = drug.pricePerUnit || 0;
                                                cost = drug.costPrice || 0;
                                            } else if (saleType === 'pack') {
                                                price = drug.pricePerPack || 0;
                                                cost =
                                                    (drug.costPrice || 0) *
                                                    (drug.unitsPerCarton || 1);
                                            } else if (saleType === 'carton') {
                                                price =
                                                    drug.pricePerCarton || 0;
                                                cost =
                                                    (drug.costPrice || 0) *
                                                    (drug.unitsPerCarton || 1) *
                                                    (drug.packsPerCarton || 1);
                                            }
                                            return (
                                                sum + (price - cost) * quantity
                                            );
                                        }
                                        return sum;
                                    }, 0)
                                    .toFixed(2)}
                            </div>
                            <Button
                                type="submit"
                                isLoading={mutation.isPending}
                                className="flex items-center"
                            >
                                {!mutation.isPending && (
                                    <FaShoppingCart className="mr-2" />
                                )}
                                Save Sale
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default SalesNewPage;
