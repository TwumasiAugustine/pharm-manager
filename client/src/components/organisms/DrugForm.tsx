import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { drugSchema } from '../../validations/drug.validation';
import type { DrugFormValues } from '../../validations/drug.validation';
import type { Drug } from '../../types/drug.types';
import { useDrugCategories } from '../../hooks/useDrugs';
import { DrugBasicFields } from './DrugBasicFields';
import { DrugCategoryField } from './DrugCategoryField';
import { DrugAdvancedFields } from './DrugAdvancedFields';
import { DrugMetaFields } from './DrugMetaFields';
import { DrugPricingFields } from './DrugPricingFields';
import { FormSection } from './DrugFormSection';
import { useDebounce } from '../../hooks/useDebounce';
import { FaSave } from 'react-icons/fa';

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

    // State for category search
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [showCategoryResults, setShowCategoryResults] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        initialData?.category || '',
    );
    const debouncedCategorySearch = useDebounce(categorySearchTerm, 300);

    // Ensure requiresPrescription is always a boolean
    const ensuredInitialData = React.useMemo(
        () =>
            initialData
                ? {
                      ...initialData,
                      requiresPrescription:
                          initialData.requiresPrescription || false,
                  }
                : undefined,
        [initialData],
    );

    // Prepare initial values if editing an existing drug
    const defaultValues = React.useMemo(
        () =>
            ensuredInitialData
                ? {
                      name: ensuredInitialData.name,
                      brand: ensuredInitialData.brand,
                      category: ensuredInitialData.category,
                      dosageForm: ensuredInitialData.dosageForm,
                      ableToSell: ensuredInitialData.ableToSell,
                      drugsInCarton: ensuredInitialData.drugsInCarton,
                      unitsPerCarton: ensuredInitialData.unitsPerCarton,
                      packsPerCarton: ensuredInitialData.packsPerCarton,
                      quantity: ensuredInitialData.quantity,
                      pricePerUnit: ensuredInitialData.pricePerUnit,
                      pricePerPack: ensuredInitialData.pricePerPack,
                      pricePerCarton: ensuredInitialData.pricePerCarton,
                      expiryDate: ensuredInitialData.expiryDate
                          ? ensuredInitialData.expiryDate.substring(0, 10)
                          : '',
                      batchNumber: ensuredInitialData.batchNumber,
                      requiresPrescription:
                          ensuredInitialData.requiresPrescription,
                      supplier: ensuredInitialData.supplier || '',
                      location: ensuredInitialData.location || '',
                  }
                : {
                      name: '',
                      brand: '',
                      category: '',
                      dosageForm: '',
                      ableToSell: true,
                      drugsInCarton: 0,
                      unitsPerCarton: 0,
                      packsPerCarton: 0,
                      quantity: 0,
                      pricePerUnit: 0,
                      pricePerPack: 0,
                      pricePerCarton: 0,
                      expiryDate: '',
                      batchNumber: '',
                      requiresPrescription: false,
                      supplier: '',
                      location: '',
                  },
        [ensuredInitialData],
    );

    // Set up form with validation
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<DrugFormValues>({
        // @ts-expect-error - The zodResolver types are mismatched but it works correctly at runtime
        resolver: zodResolver(drugSchema),
        defaultValues,
    });

    // Reset form with initial data when it's loaded
    useEffect(() => {
        if (ensuredInitialData) {
            reset({
                name: ensuredInitialData.name || '',
                brand: ensuredInitialData.brand || '',
                category: ensuredInitialData.category || '',
                dosageForm: ensuredInitialData.dosageForm || '',
                ableToSell:
                    typeof ensuredInitialData.ableToSell === 'boolean'
                        ? ensuredInitialData.ableToSell
                        : true,
                drugsInCarton: ensuredInitialData.drugsInCarton ?? 0,
                unitsPerCarton: ensuredInitialData.unitsPerCarton ?? 0,
                packsPerCarton: ensuredInitialData.packsPerCarton ?? 0,
                quantity: ensuredInitialData.quantity ?? 0,
                pricePerUnit: ensuredInitialData.pricePerUnit ?? 0,
                pricePerPack: ensuredInitialData.pricePerPack ?? 0,
                pricePerCarton: ensuredInitialData.pricePerCarton ?? 0,
                expiryDate: ensuredInitialData.expiryDate
                    ? ensuredInitialData.expiryDate.substring(0, 10)
                    : '',
                batchNumber: ensuredInitialData.batchNumber || '',
                requiresPrescription:
                    ensuredInitialData.requiresPrescription || false,
                supplier: ensuredInitialData.supplier || '',
                location: ensuredInitialData.location || '',
            });
        }
    }, [ensuredInitialData, reset]);

    // Initialize category search with existing value if editing
    useEffect(() => {
        if (ensuredInitialData?.category) {
            setSelectedCategory(ensuredInitialData.category);
            setCategorySearchTerm(ensuredInitialData.category);
        }
    }, [ensuredInitialData]);

    // Filter categories based on search term
    const filteredCategories = React.useMemo(() => {
        if (!categories || !debouncedCategorySearch) return [];
        return categories.filter((category) =>
            category
                .toLowerCase()
                .includes(debouncedCategorySearch.toLowerCase()),
        );
    }, [categories, debouncedCategorySearch]);

    // Update form when category is selected
    useEffect(() => {
        if (selectedCategory) {
            setValue('category', selectedCategory);
        }
    }, [selectedCategory, setValue]);

    // Handle category search and selection
    const handleCategorySearch = (query: string) => {
        setCategorySearchTerm(query);
        setShowCategoryResults(true);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category);
        setShowCategoryResults(false);
    };

    // Close category results when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowCategoryResults(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Handle form submission
    const onFormSubmit: SubmitHandler<DrugFormValues> = (data) => {
        onSubmit(data);
        if (!initialData) {
            reset(); // Reset form after submission only for new drugs
            setSelectedCategory('');
            setCategorySearchTerm('');
        }
    };

    return (
        <form
            // @ts-expect-error - Working around type issue with handleSubmit
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Basic Information">
                        <DrugBasicFields register={register} errors={errors} />
                    </FormSection>
                </div>
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Category">
                        <DrugCategoryField
                            register={register}
                            errors={errors}
                            categorySearchTerm={categorySearchTerm}
                            setCategorySearchTerm={setCategorySearchTerm}
                            showCategoryResults={showCategoryResults}
                            setShowCategoryResults={setShowCategoryResults}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            filteredCategories={filteredCategories}
                            loadingCategories={loadingCategories}
                            handleCategorySearch={handleCategorySearch}
                            handleCategorySelect={handleCategorySelect}
                        />
                    </FormSection>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Advanced Details">
                        <DrugAdvancedFields
                            register={register}
                            errors={errors}
                        />
                    </FormSection>
                </div>
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Pricing">
                        <DrugPricingFields
                            register={register}
                            errors={errors}
                        />
                    </FormSection>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                <FormSection title="Meta">
                    <DrugMetaFields register={register} errors={errors} />
                </FormSection>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-colors duration-200 ease-in-out ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center space-x-2">
                            <svg
                                className="animate-spin h-5 w-5 text-white"
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
                            <span>Processing...</span>
                        </span>
                    ) : (
                        <span className="flex items-center space-x-2">
                            <FaSave className="h-5 w-5" />
                            <span>
                                {initialData ? 'Update Drug' : 'Add Drug'}
                            </span>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};
