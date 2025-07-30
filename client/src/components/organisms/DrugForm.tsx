import React from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { drugSchema } from '../../validations/drug.validation';
import type { DrugFormValues } from '../../validations/drug.validation';
import type { Drug } from '../../types/drug.types';
import { useDrugCategories } from '../../hooks/useDrugs';

/**
 * Props for DrugForm component
 */
interface DrugFormProps {
    onSubmit: (data: DrugFormValues) => void;
    initialData?: Drug;
    isSubmitting?: boolean;
}

/**
 * Form component for creating or editing drugs
 */
export const DrugForm = ({
    onSubmit,
    initialData,
    isSubmitting = false,
}: DrugFormProps): React.ReactElement => {
    // Get drug categories for dropdown
    const { data: categories, isLoading: loadingCategories } =
        useDrugCategories();

    // Ensure requiresPrescription is always a boolean
    const ensuredInitialData = initialData
        ? {
              ...initialData,
              requiresPrescription: initialData.requiresPrescription || false,
          }
        : undefined;

    // Prepare initial values if editing an existing drug
    const defaultValues = ensuredInitialData
        ? {
              name: ensuredInitialData.name,
              brand: ensuredInitialData.brand,
              category: ensuredInitialData.category,
              quantity: ensuredInitialData.quantity,
              price: ensuredInitialData.price,
              expiryDate: ensuredInitialData.expiryDate
                  ? ensuredInitialData.expiryDate.substring(0, 10)
                  : '',
              batchNumber: ensuredInitialData.batchNumber,
              requiresPrescription: ensuredInitialData.requiresPrescription,
          }
        : {
              name: '',
              brand: '',
              category: '',
              quantity: 0,
              price: 0,
              expiryDate: '',
              batchNumber: '',
              requiresPrescription: false,
          };

    // Set up form with validation
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DrugFormValues>({
        // @ts-expect-error - The zodResolver types are mismatched but it works correctly at runtime
        resolver: zodResolver(drugSchema),
        defaultValues,
    });

    // Handle form submission
    const onFormSubmit: SubmitHandler<DrugFormValues> = (data) => {
        onSubmit(data);
        if (!initialData) {
            reset(); // Reset form after submission only for new drugs
        }
    };

    return (
        <form
            // @ts-expect-error - Working around type issue with handleSubmit
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Drug Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.name ? 'border-red-500' : ''
                        }`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Brand */}
                <div>
                    <label
                        htmlFor="brand"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Brand *
                    </label>
                    <input
                        type="text"
                        id="brand"
                        {...register('brand')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.brand ? 'border-red-500' : ''
                        }`}
                    />
                    {errors.brand && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.brand.message}
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Category *
                    </label>
                    <select
                        id="category"
                        {...register('category')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.category ? 'border-red-500' : ''
                        }`}
                        disabled={loadingCategories}
                    >
                        <option value="">Select a category</option>
                        {categories?.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                        <option value="other">Other</option>
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                        </p>
                    )}
                </div>

                {/* Quantity */}
                <div>
                    <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Quantity *
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        {...register('quantity', { valueAsNumber: true })}
                        min="0"
                        step="1"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.quantity ? 'border-red-500' : ''
                        }`}
                    />
                    {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.quantity.message}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div>
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Price (USD) *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="price"
                            {...register('price', { valueAsNumber: true })}
                            className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                errors.price ? 'border-red-500' : ''
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.price.message}
                        </p>
                    )}
                </div>

                {/* Expiry Date */}
                <div>
                    <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Expiry Date *
                    </label>
                    <input
                        type="date"
                        id="expiryDate"
                        {...register('expiryDate')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.expiryDate ? 'border-red-500' : ''
                        }`}
                        min={new Date().toISOString().split('T')[0]} // Set min date to today
                    />
                    {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.expiryDate.message}
                        </p>
                    )}
                </div>

                {/* Batch Number */}
                <div>
                    <label
                        htmlFor="batchNumber"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Batch Number *
                    </label>
                    <input
                        type="text"
                        id="batchNumber"
                        {...register('batchNumber')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.batchNumber ? 'border-red-500' : ''
                        }`}
                    />
                    {errors.batchNumber && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.batchNumber.message}
                        </p>
                    )}
                </div>

                {/* Requires Prescription */}
                <div className="col-span-full">
                    <div className="flex items-center">
                        <input
                            id="requiresPrescription"
                            type="checkbox"
                            {...register('requiresPrescription')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="requiresPrescription"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Requires Prescription
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Processing...
                        </span>
                    ) : initialData ? (
                        'Update Drug'
                    ) : (
                        'Add Drug'
                    )}
                </button>
            </div>
        </form>
    );
};
