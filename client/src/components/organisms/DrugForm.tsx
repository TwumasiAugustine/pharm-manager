/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { drugSchema } from '../../validations/drug.validation';
import type { DrugFormValues } from '../../validations/drug.validation';
import type { Drug } from '../../types/drug.types';
import { FaQuestionCircle } from 'react-icons/fa';
import { useDrugCategories } from '../../hooks/useDrugs';
import { DrugBasicFields } from './DrugBasicFields';
import { DrugCategoryField } from './DrugCategoryField';
import { DrugAdvancedFields } from './DrugAdvancedFields';
import { DrugMetaFields } from './DrugMetaFields';
import { BranchSelect } from '../molecules/BranchSelect';
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

    // State for showing instructions
    const [showInstructions, setShowInstructions] = useState(false);

    // State for category search
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [showCategoryResults, setShowCategoryResults] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        initialData?.category || '',
    );

    // State for branch selection
    const [selectedBranchId, setSelectedBranchId] = useState(
        (initialData as any)?.branchId || '',
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
                      costPrice: ensuredInitialData.costPrice ?? 0,
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
                      branchId: (ensuredInitialData as any).branchId || '',
                  }
                : undefined,
        [ensuredInitialData],
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<DrugFormValues>({
        resolver: zodResolver(drugSchema) as any, // Type assertion to avoid SubmitHandler type error
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
                costPrice: ensuredInitialData.costPrice ?? 0,
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
                branchId: (ensuredInitialData as any).branchId || '',
            });
            setValue('name', ensuredInitialData.name || '', {
                shouldValidate: true,
            });
            setValue('brand', ensuredInitialData.brand || '', {
                shouldValidate: true,
            });
        }
    }, [ensuredInitialData, reset, setValue]);

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
            setValue('category', selectedCategory, {
                shouldValidate: true,
                shouldDirty: true,
            });
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
        // Directly set the form value with validation
        setValue('category', category, {
            shouldValidate: true,
            shouldDirty: true,
        });
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
        // Log validation data
        console.log('Form data on submit:', data);
        console.log('Category value:', data.category);
        console.log('Selected category state:', selectedCategory);
        console.log('Form validation errors:', errors);

        // Make sure category has a valid value
        if (!data.category && selectedCategory) {
            // If selected category exists but didn't get into form data
            data.category = selectedCategory;
        }

        // Include branchId in the submission data
        const submissionData = {
            ...data,
            branchId: selectedBranchId,
        };

        onSubmit(submissionData);

        if (!initialData) {
            reset(); // Reset form after submission only for new drugs
            setSelectedCategory('');
            setCategorySearchTerm('');
            setSelectedBranchId('');
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Basic Information">
                        <DrugBasicFields
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            valueName={watch('name')}
                            valueBrand={watch('brand')}
                        />
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
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Branch Assignment">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <BranchSelect
                                    value={selectedBranchId}
                                    onChange={setSelectedBranchId}
                                />
                                {!selectedBranchId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        Branch selection is required
                                    </p>
                                )}
                            </div>
                        </div>
                    </FormSection>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Advanced Details">
                        <DrugAdvancedFields
                            register={register}
                            errors={errors}
                            setValue={setValue}
                        />
                    </FormSection>
                </div>
                <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                    <FormSection title="Pricing">
                        {/* Instructions toggle button */}
                        <div className="mb-6 flex items-center">
                            <button
                                type="button"
                                className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none mr-2"
                                onClick={() => setShowInstructions((v) => !v)}
                                aria-label="Show instructions"
                            >
                                <FaQuestionCircle className="h-5 w-5 mr-1" />
                                <span className="underline">
                                    How to use Advanced Details & Pricing
                                </span>
                            </button>
                        </div>
                        {showInstructions && (
                            <div className="mb-6">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-blue-900 text-sm">
                                    <strong>
                                        How to use Advanced Details & Pricing:
                                    </strong>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>
                                            <strong>Advanced Details:</strong>{' '}
                                            Enter drug-specific information such
                                            as dosage form, prescription
                                            requirements, and packaging (units
                                            per pack, packs per carton, etc).
                                            These details affect how the drug is
                                            managed in inventory and dispensed
                                            at the point of sale.
                                        </li>
                                        <li>
                                            <strong>Pricing:</strong> Enter the
                                            selling prices for the drug (per
                                            unit, pack, and carton). If you only
                                            provide the unit price, the system
                                            will automatically calculate the
                                            pack and carton prices based on the
                                            packaging configuration you set
                                            above.
                                        </li>
                                        <li>
                                            <strong>
                                                Calculation Example:
                                            </strong>{' '}
                                            If a carton contains 10 packs and
                                            each pack contains 20 units, and you
                                            set the unit price to GH₵100, then:
                                            <ul className="list-disc pl-5 mt-1">
                                                <li>
                                                    Pack price = 20 × GH₵100 =
                                                    GH₵2,000
                                                </li>
                                                <li>
                                                    Carton price = 10 × GH₵2,000
                                                    = GH₵20,000
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Tip:</strong> Always ensure
                                            the{' '}
                                            <span className="font-semibold">
                                                Cost Price
                                            </span>{' '}
                                            (entered below) is less than the
                                            selling prices for proper profit
                                            calculation and to avoid loss.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        <DrugPricingFields
                            register={register}
                            errors={errors}
                        />
                    </FormSection>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100">
                <FormSection title="Branch">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Branch <span className="text-red-500">*</span>
                        </label>
                        <BranchSelect
                            value={watch('branchId')}
                            onChange={(id) =>
                                setValue('branchId', id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                })
                            }
                        />
                        {errors.branchId && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.branchId.message ||
                                    'Branch is required'}
                            </p>
                        )}
                    </div>
                </FormSection>
                <FormSection title="Meta">
                    <DrugMetaFields register={register} errors={errors} />
                </FormSection>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end mt-8">
                <button
                    type="submit"
                    disabled={isSubmitting || !selectedBranchId}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-colors duration-200 ease-in-out ${
                        isSubmitting || !selectedBranchId
                            ? 'opacity-75 cursor-not-allowed'
                            : ''
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
