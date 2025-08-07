import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDrugs } from '../../hooks/useDrugs';
import { SearchBar } from '../molecules/SearchBar';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card';
import { Alert, AlertDescription } from '../molecules/Alert';
import { PackagePricingDisplay } from '../molecules/PackagePricingDisplay';
import { calculatePackagePricing, getBestPricingOption, formatCurrency } from '../../utils/packagePricing';
import type { Drug } from '../../types/drug.types';
import type { SaleFormItem, SaleFormInput } from '../../types/sale.types';
import {
    FaPlus,
    FaTrash,
    FaCalculator,
    FaBox,
    FaBoxes,
    FaPills,
    FaMoneyBillAlt,
    FaInfoCircle,
} from 'react-icons/fa';

// Enhanced sale form validation schema
const enhancedSaleFormSchema = z.object({
    items: z.array(z.object({
        drug: z.string().min(1, 'Drug is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        packageType: z.enum(['individual', 'pack', 'carton']).default('individual'),
        unitPrice: z.number().min(0, 'Unit price must be positive'),
        totalPrice: z.number().min(0, 'Total price must be positive'),
        drugDetails: z.object({
            id: z.string(),
            name: z.string(),
            generic: z.string(),
            brand: z.string(),
            price: z.number(),
            packageInfo: z.object({
                isPackaged: z.boolean(),
                unitsPerPack: z.number().optional(),
                packsPerCarton: z.number().optional(),
                packPrice: z.number().optional(),
                cartonPrice: z.number().optional(),
            }).optional(),
        }).optional(),
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['cash', 'card', 'mobile']),
    customerId: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
});

type EnhancedSaleFormValues = z.infer<typeof enhancedSaleFormSchema>;

interface EnhancedSaleFormProps {
    onSubmit: (data: EnhancedSaleFormValues) => void;
    isSubmitting?: boolean;
}

export const EnhancedSaleForm: React.FC<EnhancedSaleFormProps> = ({
    onSubmit,
    isSubmitting = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
    const [showDrugResults, setShowDrugResults] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [packageType, setPackageType] = useState<'individual' | 'pack' | 'carton'>('individual');

    // Get drugs data
    const { data: drugsData, isLoading: loadingDrugs } = useDrugs({
        search: searchTerm,
        limit: 10,
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<EnhancedSaleFormValues>({
        resolver: zodResolver(enhancedSaleFormSchema),
        defaultValues: {
            items: [],
            paymentMethod: 'cash',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');
    const totalAmount = watchedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // Filter drugs based on search term
    const filteredDrugs = drugsData?.drugs?.filter(drug =>
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.brand.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Calculate pricing for selected drug and quantity
    const calculatePricing = () => {
        if (!selectedDrug) return null;

        const pricing = calculatePackagePricing(selectedDrug.price, selectedDrug.packageInfo);
        const bestOption = getBestPricingOption(quantity, selectedDrug.price, selectedDrug.packageInfo);

        let unitPrice = selectedDrug.price;
        let totalPrice = quantity * selectedDrug.price;
        let packageTypeToUse = packageType;

        // Determine best package type if available
        if (selectedDrug.packageInfo?.isPackaged) {
            if (bestOption.type !== 'individual') {
                packageTypeToUse = bestOption.type;
                unitPrice = bestOption.totalCost / bestOption.units;
                totalPrice = bestOption.totalCost;
            }
        }

        return {
            unitPrice,
            totalPrice,
            packageType: packageTypeToUse,
            pricing,
            bestOption,
        };
    };

    const pricingInfo = calculatePricing();

    // Handle drug selection
    const handleDrugSelect = (drug: Drug) => {
        setSelectedDrug(drug);
        setShowDrugResults(false);
        setSearchTerm(drug.name);
        setQuantity(1);
        setPackageType('individual');
    };

    // Handle adding item to sale
    const handleAddItem = () => {
        if (!selectedDrug || !pricingInfo) return;

        const newItem = {
            drug: selectedDrug.id,
            quantity,
            packageType: pricingInfo.packageType,
            unitPrice: pricingInfo.unitPrice,
            totalPrice: pricingInfo.totalPrice,
            drugDetails: {
                id: selectedDrug.id,
                name: selectedDrug.name,
                generic: selectedDrug.generic,
                brand: selectedDrug.brand,
                price: selectedDrug.price,
                packageInfo: selectedDrug.packageInfo,
            },
        };

        append(newItem);

        // Reset form
        setSelectedDrug(null);
        setSearchTerm('');
        setQuantity(1);
        setPackageType('individual');
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity: number) => {
        setQuantity(newQuantity);
        if (selectedDrug?.packageInfo?.isPackaged) {
            const bestOption = getBestPricingOption(newQuantity, selectedDrug.price, selectedDrug.packageInfo);
            setPackageType(bestOption.type);
        }
    };

    // Handle package type change
    const handlePackageTypeChange = (newPackageType: 'individual' | 'pack' | 'carton') => {
        setPackageType(newPackageType);
        if (selectedDrug) {
            const pricing = calculatePackagePricing(selectedDrug.price, selectedDrug.packageInfo);
            let newTotalPrice = quantity * selectedDrug.price;

            if (newPackageType === 'pack' && pricing.packPrice && selectedDrug.packageInfo?.unitsPerPack) {
                const packsNeeded = Math.ceil(quantity / selectedDrug.packageInfo.unitsPerPack);
                newTotalPrice = packsNeeded * pricing.packPrice;
            } else if (newPackageType === 'carton' && pricing.cartonPrice && selectedDrug.packageInfo?.packsPerCarton) {
                const cartonsNeeded = Math.ceil(quantity / (selectedDrug.packageInfo.unitsPerPack! * selectedDrug.packageInfo.packsPerCarton));
                newTotalPrice = cartonsNeeded * pricing.cartonPrice;
            }

            setValue('totalPrice', newTotalPrice);
        }
    };

    return (
        <div className="space-y-6">
            {/* Drug Selection Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaPills className="text-blue-500" />
                        Add Drug to Sale
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Drug Search */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Search Drug
                        </label>
                        <div className="relative">
                            <SearchBar
                                placeholder="Search by name, generic, or brand..."
                                onSearch={setSearchTerm}
                                initialValue={searchTerm}
                                onFocus={() => setShowDrugResults(true)}
                                className="w-full"
                            />
                            
                            {/* Search Results */}
                            {showDrugResults && searchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {loadingDrugs ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Loading drugs...
                                        </div>
                                    ) : filteredDrugs.length > 0 ? (
                                        <ul className="py-1">
                                            {filteredDrugs.map((drug) => (
                                                <li
                                                    key={drug.id}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleDrugSelect(drug)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{drug.name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {drug.generic} • {drug.brand}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {drug.category} • {drug.dosageForm}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium text-gray-900">
                                                                {formatCurrency(drug.price)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Stock: {drug.quantity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            No drugs found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Drug Details */}
                    {selectedDrug && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-medium text-gray-900">{selectedDrug.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedDrug.generic} • {selectedDrug.brand}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Stock: {selectedDrug.quantity} units
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">
                                        {formatCurrency(selectedDrug.price)} per unit
                                    </div>
                                </div>
                            </div>

                            {/* Package Pricing Display */}
                            <PackagePricingDisplay 
                                drug={selectedDrug} 
                                quantity={quantity}
                                showBestOption={true}
                            />
                        </div>
                    )}

                    {/* Quantity and Package Type Selection */}
                    {selectedDrug && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Quantity Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={selectedDrug.quantity}
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="w-full"
                                />
                            </div>

                            {/* Package Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Package Type
                                </label>
                                <select
                                    value={packageType}
                                    onChange={(e) => handlePackageTypeChange(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Package type selection"
                                >
                                    <option value="individual">Individual Units</option>
                                    {selectedDrug.packageInfo?.isPackaged && (
                                        <>
                                            <option value="pack">Packs</option>
                                            <option value="carton">Cartons</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Add Button */}
                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={handleAddItem}
                                    disabled={!selectedDrug || quantity <= 0 || quantity > selectedDrug.quantity}
                                    className="w-full"
                                >
                                    <FaPlus className="mr-2" />
                                    Add to Sale
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pricing Preview */}
                    {selectedDrug && pricingInfo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-green-900">Pricing Preview</h4>
                                    <p className="text-sm text-green-700">
                                        {quantity} {packageType === 'individual' ? 'units' : packageType === 'pack' ? 'packs' : 'cartons'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-900">
                                        {formatCurrency(pricingInfo.totalPrice)}
                                    </div>
                                    <div className="text-sm text-green-700">
                                        {formatCurrency(pricingInfo.unitPrice)} per {packageType === 'individual' ? 'unit' : packageType === 'pack' ? 'pack' : 'carton'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sale Items List */}
            {fields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaCalculator className="text-green-500" />
                            Sale Items ({fields.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {fields.map((field, index) => {
                                const item = watchedItems[index];
                                return (
                                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {item.drugDetails?.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {item.drugDetails?.generic} • {item.drugDetails?.brand}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className="text-gray-600">
                                                        Qty: {item.quantity} {item.packageType === 'individual' ? 'units' : item.packageType === 'pack' ? 'packs' : 'cartons'}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        Price: {formatCurrency(item.unitPrice)} per {item.packageType === 'individual' ? 'unit' : item.packageType === 'pack' ? 'pack' : 'carton'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    {formatCurrency(item.totalPrice)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="mt-2 text-red-600 hover:text-red-800"
                                                    aria-label="Remove item from sale"
                                                    title="Remove item"
                                                >
                                                    <FaTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total Amount */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment and Customer Information */}
            {fields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaMoneyBillAlt className="text-purple-500" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method
                            </label>
                            <Controller
                                name="paymentMethod"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="mobile">Mobile Money</option>
                                    </select>
                                )}
                            />
                        </div>

                        {/* Transaction ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction ID (Optional)
                            </label>
                            <Controller
                                name="transactionId"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Enter transaction ID"
                                        className="w-full"
                                    />
                                )}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        rows={3}
                                        placeholder="Add any additional notes..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            {fields.length > 0 && (
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting || fields.length === 0}
                        className="px-8 py-3 text-lg"
                    >
                        {isSubmitting ? 'Processing Sale...' : `Complete Sale - ${formatCurrency(totalAmount)}`}
                    </Button>
                </div>
            )}

            {/* Form Errors */}
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Please fix the following errors:
                        <ul className="mt-2 list-disc list-inside">
                            {errors.items && <li>At least one item is required</li>}
                            {errors.paymentMethod && <li>Payment method is required</li>}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
