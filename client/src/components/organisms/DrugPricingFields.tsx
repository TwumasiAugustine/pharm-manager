import React from 'react';
import { FaMoneyBillAlt, FaLayerGroup, FaBoxes } from 'react-icons/fa';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { DrugFormValues } from '../../validations/drug.validation';

interface DrugPricingFieldsProps {
    register: UseFormRegister<DrugFormValues>;
    errors: FieldErrors<DrugFormValues>;
    onManualPricePerPack?: () => void;
    onManualPricePerCarton?: () => void;
}

export const DrugPricingFields: React.FC<DrugPricingFieldsProps> = ({
    register,
    errors,
    onManualPricePerPack,
    onManualPricePerCarton,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Per Unit */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="pricePerUnit"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaMoneyBillAlt className="mr-1 text-blue-500" /> Price Per Unit
                (GHC) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    id="pricePerUnit"
                    {...register('pricePerUnit', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                        errors.pricePerUnit ? 'border-red-500 pr-10' : ''
                    }`}
                    aria-invalid={!!errors.pricePerUnit}
                />
            </div>
            {errors.pricePerUnit && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.pricePerUnit.message}
                </p>
            )}
        </div>
        {/* Price Per Pack */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="pricePerPack"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaLayerGroup className="mr-1 text-blue-500" /> Price Per Pack
                (GHC)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLayerGroup className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    id="pricePerPack"
                    {...register('pricePerPack', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                        errors.pricePerPack ? 'border-red-500 pr-10' : ''
                    }`}
                    aria-invalid={!!errors.pricePerPack}
                    onChange={(e) => {
                        register('pricePerPack', {
                            valueAsNumber: true,
                        }).onChange?.(e);
                        if (onManualPricePerPack) onManualPricePerPack();
                    }}
                />
            </div>
            {errors.pricePerPack && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.pricePerPack.message}
                </p>
            )}
        </div>
        {/* Price Per Carton */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="pricePerCarton"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaBoxes className="mr-1 text-blue-500" /> Price Per Carton
                (GHC)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBoxes className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    id="pricePerCarton"
                    {...register('pricePerCarton', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                        errors.pricePerCarton ? 'border-red-500 pr-10' : ''
                    }`}
                    aria-invalid={!!errors.pricePerCarton}
                    onChange={(e) => {
                        register('pricePerCarton', {
                            valueAsNumber: true,
                        }).onChange?.(e);
                        if (onManualPricePerCarton) onManualPricePerCarton();
                    }}
                />
            </div>
            {errors.pricePerCarton && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.pricePerCarton.message}
                </p>
            )}
        </div>
        {/* Cost Price (per unit) */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="costPrice"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaMoneyBillAlt className="mr-1 text-green-500" /> Cost Price
                (per unit) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillAlt className="h-5 w-5 text-green-400" />
                </div>
                <input
                    type="number"
                    id="costPrice"
                    step="0.01"
                    min="0.01"
                    {...register('costPrice', { valueAsNumber: true })}
                    placeholder="Enter cost price per unit"
                    className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm ${
                        errors.costPrice ? 'border-red-500 pr-10' : ''
                    }`}
                    aria-invalid={!!errors.costPrice}
                />
            </div>
            {errors.costPrice && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.costPrice.message}
                </p>
            )}
        </div>
    </div>
);
