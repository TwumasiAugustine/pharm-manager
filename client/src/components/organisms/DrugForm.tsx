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
import { MultiBranchSelect } from '../molecules/MultiBranchSelect';
import { DrugPricingFields } from './DrugPricingFields';
import { FormSection } from './DrugFormSection';
import { useDebounce } from '../../hooks/useDebounce';
import { FaSave } from 'react-icons/fa';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/user.types';

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
    // Get current user for admin check
    const { user } = useAuthStore();
    const isAdmin =
        user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

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
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [useLegacySingleBranch, setUseLegacySingleBranch] = useState(
        !isAdmin,
    ); // Non-admin users default to single branch mode

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
        formState: { errors, isValid, isDirty },
        reset,
        setValue,
        watch,
    } = useForm<DrugFormValues>({
        resolver: zodResolver(drugSchema) as any, // Type assertion to avoid SubmitHandler type error
        defaultValues,
        mode: 'onChange', // Enable real-time validation
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

    // Initialize branch selection with existing data if editing
    useEffect(() => {
        if (ensuredInitialData) {
            // If drug has branches array, use it for multi-branch selection
            if (
                ensuredInitialData.branches &&
                ensuredInitialData.branches.length > 0
            ) {
                const branchIds = ensuredInitialData.branches.map(
                    (branch) => branch.id,
                );
                setSelectedBranches(branchIds);
                // For admin users, switch to multi-branch mode if multiple branches exist
                if (isAdmin && ensuredInitialData.branches.length > 1) {
                    setUseLegacySingleBranch(false);
                }
            }
            // If drug has a single branch, ensure the branchId is set properly
            else if (ensuredInitialData.branchId) {
                setValue('branchId', ensuredInitialData.branchId, {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }
            // If drug has branch object but no branchId, use the branch object
            else if (ensuredInitialData.branch?.id) {
                setValue('branchId', ensuredInitialData.branch.id, {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }
        }
    }, [ensuredInitialData, isAdmin, setValue]);

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
        console.log('🚀 Form submission started:', {
            data,
            initialData: !!initialData,
            isAdmin,
            useLegacySingleBranch,
            selectedBranches,
            formErrors: errors,
        });

        // Check for any form validation errors
        if (Object.keys(errors).length > 0) {
            console.error('❌ Form has validation errors:', errors);
            return;
        }

        // Make sure category has a valid value
        if (!data.category && selectedCategory) {
            // If selected category exists but didn't get into form data
            data.category = selectedCategory;
        }

        // Prepare submission data with branch selection
        const submissionData = {
            ...data,
        };

        // Handle branch selection based on mode
        if (useLegacySingleBranch && data.branchId) {
            // Legacy single branch mode: send branchId
            submissionData.branchId = data.branchId;
        } else if (!useLegacySingleBranch && selectedBranches.length > 0) {
            // Multi-branch mode: send selectedBranches
            submissionData.selectedBranches = selectedBranches;
            // Remove branchId to avoid conflicts
            delete (submissionData as any).branchId;
        } else if (data.branchId) {
            // Fallback: if branchId is set but not in legacy mode, use it
            submissionData.branchId = data.branchId;
        } else if (initialData) {
            // When editing and no new branch selection, preserve existing branch data
            if (initialData.branchId) {
                submissionData.branchId = initialData.branchId;
            } else if (initialData.branch?.id) {
                submissionData.branchId = initialData.branch.id;
            }
        }

        console.log('Submitting data:', submissionData);
        onSubmit(submissionData);

        if (!initialData) {
            reset(); // Reset form after submission only for new drugs
            setSelectedCategory('');
            setCategorySearchTerm('');
            setSelectedBranches([]);
        }
    };

    // Debug the button disabled condition
    const currentBranchId = watch('branchId');
    // For editing: allow submission regardless of branch selection since the drug already exists
    // For creating new drugs: enforce branch selection rules for non-admin users
    const isButtonDisabled =
        isSubmitting ||
        (!initialData &&
            !isAdmin &&
            useLegacySingleBranch &&
            !currentBranchId) ||
        (!initialData &&
            !isAdmin &&
            !useLegacySingleBranch &&
            selectedBranches.length === 0);

    // Debug logging
    console.log('Button state:', {
        isSubmitting,
        initialData: !!initialData,
        isAdmin,
        useLegacySingleBranch,
        currentBranchId,
        selectedBranches,
        isButtonDisabled,
        isValid,
        isDirty,
        hasErrors: Object.keys(errors).length > 0,
        errors,
    });

    return (
        <form
            onSubmit={(e) => {
                console.log('📝 Form onSubmit event triggered');
                e.preventDefault(); // Prevent default submission

                // Manually trigger form validation and submission
                handleSubmit(
                    (data) => {
                        console.log(
                            '✅ Form validation passed, calling onFormSubmit',
                        );
                        onFormSubmit(data);
                    },
                    (errors) => {
                        console.error('❌ Form validation failed:', errors);
                    },
                )(e);
            }}
            className="space-y-6 sm:space-y-8"
        >
            {/* Basic Information and Category - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
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
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
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

            {/* Branch Assignment - Full Width */}
            <div className="col-span-1 bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
                <FormSection title="Branch Assignment">
                    <div className="space-y-4">
                        {/* Branch Selection Mode Toggle for Admin */}
                        {isAdmin && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-blue-50 rounded-md">
                                <span className="text-sm font-medium text-blue-800">
                                    Selection Mode:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUseLegacySingleBranch(false)
                                        }
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                            !useLegacySingleBranch
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-blue-600 border border-blue-600'
                                        }`}
                                    >
                                        Multi-Branch (Recommended)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUseLegacySingleBranch(true)
                                        }
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                            useLegacySingleBranch
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-blue-600 border border-blue-600'
                                        }`}
                                    >
                                        Single Branch (Legacy)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Branch Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {useLegacySingleBranch || !isAdmin
                                    ? 'Branch'
                                    : 'Branches'}{' '}
                                {!isAdmin && (
                                    <span className="text-red-500">*</span>
                                )}
                                {isAdmin && !useLegacySingleBranch && (
                                    <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                        (Select specific branches or leave empty
                                        for all)
                                    </span>
                                )}
                                {isAdmin && useLegacySingleBranch && (
                                    <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                        (Select one branch or leave empty for
                                        all)
                                    </span>
                                )}
                            </label>

                            {!isAdmin || useLegacySingleBranch ? (
                                // Single branch selection (for non-admin or legacy mode)
                                <BranchSelect
                                    value={watch('branchId')}
                                    onChange={(id) =>
                                        setValue('branchId', id, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                    required={!isAdmin}
                                    mode="form"
                                    placeholder="Select a branch for this drug"
                                />
                            ) : (
                                // Multi-branch selection (for admin)
                                <MultiBranchSelect
                                    value={selectedBranches}
                                    onChange={setSelectedBranches}
                                    placeholder="Select branches or leave empty for all branches"
                                    allowSelectAll={true}
                                />
                            )}

                            {errors.branchId && useLegacySingleBranch && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.branchId.message ||
                                        'Branch is required'}
                                </p>
                            )}

                            {/* Helper text */}
                            <div className="mt-2 space-y-1">
                                {isAdmin && !useLegacySingleBranch && (
                                    <p className="text-sm text-blue-600 flex items-start gap-1">
                                        <span className="text-base">💡</span>
                                        <span>
                                            Select specific branches to make
                                            this drug available only in those
                                            locations. Leave empty to make it
                                            available in all branches.
                                        </span>
                                    </p>
                                )}
                                {isAdmin && useLegacySingleBranch && (
                                    <p className="text-sm text-blue-600 flex items-start gap-1">
                                        <span className="text-base">💡</span>
                                        <span>
                                            Legacy mode: Select one branch or
                                            leave empty to create separate drug
                                            instances in all branches.
                                        </span>
                                    </p>
                                )}
                                {!isAdmin && (
                                    <p className="text-sm text-gray-600 flex items-start gap-1">
                                        <span className="text-base">ℹ️</span>
                                        <span>
                                            You can only create drugs in your
                                            assigned branch.
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </FormSection>
            </div>

            {/* Advanced Details and Pricing - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
                    <FormSection title="Advanced Details">
                        <DrugAdvancedFields
                            register={register}
                            errors={errors}
                            setValue={setValue}
                        />
                    </FormSection>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
                    <FormSection title="Pricing">
                        {/* Instructions toggle button */}
                        <div className="mb-4 sm:mb-6 flex items-start sm:items-center">
                            <button
                                type="button"
                                className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none text-sm"
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

            {/* Meta Information - Full Width */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
                <FormSection title="Meta Information">
                    <DrugMetaFields register={register} errors={errors} />
                </FormSection>
            </div>

            {/* Submit Button - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end mt-6 sm:mt-8">
                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    onClick={(e) => {
                        console.log('🖱️ Submit button clicked!', {
                            isButtonDisabled,
                            type: e.currentTarget.type,
                            disabled: e.currentTarget.disabled,
                        });
                        if (isButtonDisabled) {
                            e.preventDefault();
                            console.log(
                                '❌ Button is disabled, preventing submission',
                            );
                        }
                    }}
                    className={`w-full sm:w-auto inline-flex justify-center items-center px-6 sm:px-8 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-colors duration-200 ease-in-out ${
                        isButtonDisabled ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center space-x-2">
                            <svg
                                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                            <FaSave className="h-4 w-4 sm:h-5 sm:w-5" />
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
