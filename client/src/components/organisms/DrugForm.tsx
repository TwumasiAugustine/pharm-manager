import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { drugSchema } from '../../validations/drug.validation';
import type { DrugFormValues } from '../../validations/drug.validation';
import type { Drug } from '../../types/drug.types';
import { useDrugCategories, useDrugTypes, useDosageForms } from '../../hooks/useDrugs';
import { SearchBar } from '../../components/molecules/SearchBar';
import { useDebounce } from '../../hooks/useDebounce';
import {
    FaPills,
    FaTrademark,
    FaLayerGroup,
    FaBoxes,
    FaMoneyBillAlt,
    FaCalendarAlt,
    FaBarcode,
    FaPrescriptionBottleAlt,
    FaSave,
    FaCapsules,
    FaFlask,
    FaTag,
    FaBox,
    FaCalculator,
} from 'react-icons/fa';

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
    // Get drug data for dropdowns
    const { data: categories, isLoading: loadingCategories } = useDrugCategories();
    const { data: types, isLoading: loadingTypes } = useDrugTypes();
    const { data: dosageForms, isLoading: loadingDosageForms } = useDosageForms();

    // State for search dropdowns
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [showCategoryResults, setShowCategoryResults] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category || '');

    const [typeSearchTerm, setTypeSearchTerm] = useState('');
    const [showTypeResults, setShowTypeResults] = useState(false);
    const [selectedType, setSelectedType] = useState(initialData?.type || '');

    const [dosageFormSearchTerm, setDosageFormSearchTerm] = useState('');
    const [showDosageFormResults, setShowDosageFormResults] = useState(false);
    const [selectedDosageForm, setSelectedDosageForm] = useState(initialData?.dosageForm || '');

    const debouncedCategorySearch = useDebounce(categorySearchTerm, 300);
    const debouncedTypeSearch = useDebounce(typeSearchTerm, 300);
    const debouncedDosageFormSearch = useDebounce(dosageFormSearchTerm, 300);

    // Ensure requiresPrescription is always a boolean
    const ensuredInitialData = React.useMemo(
        () =>
            initialData
                ? {
                      ...initialData,
                      requiresPrescription: initialData.requiresPrescription || false,
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
                      generic: ensuredInitialData.generic,
                      brand: ensuredInitialData.brand,
                      category: ensuredInitialData.category,
                      type: ensuredInitialData.type,
                      dosageForm: ensuredInitialData.dosageForm,
                      quantity: ensuredInitialData.quantity,
                      price: ensuredInitialData.price,
                      packageInfo: ensuredInitialData.packageInfo || {
                          isPackaged: false,
                          unitsPerPack: undefined,
                          packsPerCarton: undefined,
                          packPrice: undefined,
                          cartonPrice: undefined,
                      },
                      expiryDate: ensuredInitialData.expiryDate
                          ? ensuredInitialData.expiryDate.substring(0, 10)
                          : '',
                      batchNumber: ensuredInitialData.batchNumber,
                      requiresPrescription: ensuredInitialData.requiresPrescription,
                  }
                : {
                      name: '',
                      generic: '',
                      brand: '',
                      category: '',
                      type: '',
                      dosageForm: '',
                      quantity: 0,
                      price: 0,
                      packageInfo: {
                          isPackaged: false,
                          unitsPerPack: undefined,
                          packsPerCarton: undefined,
                          packPrice: undefined,
                          cartonPrice: undefined,
                      },
                      expiryDate: '',
                      batchNumber: '',
                      requiresPrescription: false,
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
        watch,
        control,
    } = useForm<DrugFormValues>({
        resolver: zodResolver(drugSchema),
        defaultValues,
    });

    // Watch package info for conditional rendering
    const packageInfo = watch('packageInfo');
    const isPackaged = packageInfo?.isPackaged;

    // Reset form with initial data when it's loaded
    useEffect(() => {
        if (ensuredInitialData) {
            reset({
                name: ensuredInitialData.name || '',
                generic: ensuredInitialData.generic || '',
                brand: ensuredInitialData.brand || '',
                category: ensuredInitialData.category || '',
                type: ensuredInitialData.type || '',
                dosageForm: ensuredInitialData.dosageForm || '',
                quantity: ensuredInitialData.quantity || 0,
                price: ensuredInitialData.price || 0,
                packageInfo: ensuredInitialData.packageInfo || {
                    isPackaged: false,
                    unitsPerPack: undefined,
                    packsPerCarton: undefined,
                    packPrice: undefined,
                    cartonPrice: undefined,
                },
                expiryDate: ensuredInitialData.expiryDate
                    ? ensuredInitialData.expiryDate.substring(0, 10)
                    : '',
                batchNumber: ensuredInitialData.batchNumber || '',
                requiresPrescription: ensuredInitialData.requiresPrescription || false,
            });
        }
    }, [ensuredInitialData, reset]);

    // Initialize search terms with existing values if editing
    useEffect(() => {
        if (ensuredInitialData?.category) {
            setSelectedCategory(ensuredInitialData.category);
            setCategorySearchTerm(ensuredInitialData.category);
        }
        if (ensuredInitialData?.type) {
            setSelectedType(ensuredInitialData.type);
            setTypeSearchTerm(ensuredInitialData.type);
        }
        if (ensuredInitialData?.dosageForm) {
            setSelectedDosageForm(ensuredInitialData.dosageForm);
            setDosageFormSearchTerm(ensuredInitialData.dosageForm);
        }
    }, [ensuredInitialData]);

    // Filter data based on search terms
    const filteredCategories = React.useMemo(() => {
        if (!categories || !debouncedCategorySearch) return [];
        return categories.filter((category) =>
            category.toLowerCase().includes(debouncedCategorySearch.toLowerCase()),
        );
    }, [categories, debouncedCategorySearch]);

    const filteredTypes = React.useMemo(() => {
        if (!types || !debouncedTypeSearch) return [];
        return types.filter((type) =>
            type.toLowerCase().includes(debouncedTypeSearch.toLowerCase()),
        );
    }, [types, debouncedTypeSearch]);

    const filteredDosageForms = React.useMemo(() => {
        if (!dosageForms || !debouncedDosageFormSearch) return [];
        return dosageForms.filter((dosageForm) =>
            dosageForm.toLowerCase().includes(debouncedDosageFormSearch.toLowerCase()),
        );
    }, [dosageForms, debouncedDosageFormSearch]);

    // Update form when selections are made
    useEffect(() => {
        if (selectedCategory) {
            setValue('category', selectedCategory);
        }
    }, [selectedCategory, setValue]);

    useEffect(() => {
        if (selectedType) {
            setValue('type', selectedType);
        }
    }, [selectedType, setValue]);

    useEffect(() => {
        if (selectedDosageForm) {
            setValue('dosageForm', selectedDosageForm);
        }
    }, [selectedDosageForm, setValue]);

    // Handle search and selection functions
    const handleCategorySearch = (query: string) => {
        setCategorySearchTerm(query);
        setShowCategoryResults(true);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category);
        setShowCategoryResults(false);
    };

    const handleTypeSearch = (query: string) => {
        setTypeSearchTerm(query);
        setShowTypeResults(true);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setTypeSearchTerm(type);
        setShowTypeResults(false);
    };

    const handleDosageFormSearch = (query: string) => {
        setDosageFormSearchTerm(query);
        setShowDosageFormResults(true);
    };

    const handleDosageFormSelect = (dosageForm: string) => {
        setSelectedDosageForm(dosageForm);
        setDosageFormSearchTerm(dosageForm);
        setShowDosageFormResults(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowCategoryResults(false);
            setShowTypeResults(false);
            setShowDosageFormResults(false);
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
            setSelectedType('');
            setSelectedDosageForm('');
            setCategorySearchTerm('');
            setTypeSearchTerm('');
            setDosageFormSearchTerm('');
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaPills className="mr-1 text-blue-500" />
                        Drug Name *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPills className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="name"
                            {...register('name')}
                            placeholder="Enter drug name"
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.name ? 'border-red-500 pr-10' : ''
                            }`}
                        />
                        {errors.name && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Generic Name */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="generic" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaCapsules className="mr-1 text-blue-500" />
                        Generic Name *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCapsules className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="generic"
                            {...register('generic')}
                            placeholder="Enter generic name"
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.generic ? 'border-red-500 pr-10' : ''
                            }`}
                        />
                        {errors.generic && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.generic && <p className="mt-1 text-sm text-red-600">{errors.generic.message}</p>}
                </div>

                {/* Brand */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="brand" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaTrademark className="mr-1 text-blue-500" />
                        Brand *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaTrademark className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="brand"
                            {...register('brand')}
                            placeholder="Enter brand name"
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.brand ? 'border-red-500 pr-10' : ''
                            }`}
                        />
                        {errors.brand && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
                </div>

                {/* Category with SearchBar */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaLayerGroup className="mr-1 text-blue-500" />
                        Category *
                    </label>
                    <div className="mt-1 relative">
                        <input type="hidden" id="category" {...register('category')} />
                        <div onClick={(e) => e.stopPropagation()}>
                            <SearchBar
                                onSearch={handleCategorySearch}
                                placeholder="Search category..."
                                initialValue={categorySearchTerm}
                                className="w-full"
                            />
                        </div>
                        {showCategoryResults && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                                {loadingCategories ? (
                                    <div className="p-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="py-2 animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredCategories.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredCategories.map((category) => (
                                            <li
                                                key={category}
                                                className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                                                onClick={() => handleCategorySelect(category)}
                                            >
                                                {category}
                                            </li>
                                        ))}
                                        <li
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-t border-gray-100"
                                            onClick={() => handleCategorySelect('other')}
                                        >
                                            + Add as "Other"
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-3 text-center text-gray-500">
                                        <p>No categories found</p>
                                        <button
                                            type="button"
                                            className="mt-1 text-blue-600 hover:underline text-sm"
                                            onClick={() => handleCategorySelect(categorySearchTerm || 'other')}
                                        >
                                            + Add "{categorySearchTerm || 'other'}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedCategory && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {selectedCategory}
                            </div>
                        )}
                    </div>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                {/* Type with SearchBar */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaTag className="mr-1 text-blue-500" />
                        Drug Type *
                    </label>
                    <div className="mt-1 relative">
                        <input type="hidden" id="type" {...register('type')} />
                        <div onClick={(e) => e.stopPropagation()}>
                            <SearchBar
                                onSearch={handleTypeSearch}
                                placeholder="Search drug type..."
                                initialValue={typeSearchTerm}
                                className="w-full"
                            />
                        </div>
                        {showTypeResults && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                                {loadingTypes ? (
                                    <div className="p-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="py-2 animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredTypes.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredTypes.map((type) => (
                                            <li
                                                key={type}
                                                className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                                                onClick={() => handleTypeSelect(type)}
                                            >
                                                {type}
                                            </li>
                                        ))}
                                        <li
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-t border-gray-100"
                                            onClick={() => handleTypeSelect('other')}
                                        >
                                            + Add as "Other"
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-3 text-center text-gray-500">
                                        <p>No types found</p>
                                        <button
                                            type="button"
                                            className="mt-1 text-blue-600 hover:underline text-sm"
                                            onClick={() => handleTypeSelect(typeSearchTerm || 'other')}
                                        >
                                            + Add "{typeSearchTerm || 'other'}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedType && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedType}
                            </div>
                        )}
                    </div>
                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                </div>

                {/* Dosage Form with SearchBar */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="dosageForm" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaFlask className="mr-1 text-blue-500" />
                        Dosage Form *
                    </label>
                    <div className="mt-1 relative">
                        <input type="hidden" id="dosageForm" {...register('dosageForm')} />
                        <div onClick={(e) => e.stopPropagation()}>
                            <SearchBar
                                onSearch={handleDosageFormSearch}
                                placeholder="Search dosage form..."
                                initialValue={dosageFormSearchTerm}
                                className="w-full"
                            />
                        </div>
                        {showDosageFormResults && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                                {loadingDosageForms ? (
                                    <div className="p-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="py-2 animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredDosageForms.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredDosageForms.map((dosageForm) => (
                                            <li
                                                key={dosageForm}
                                                className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                                                onClick={() => handleDosageFormSelect(dosageForm)}
                                            >
                                                {dosageForm}
                                            </li>
                                        ))}
                                        <li
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-t border-gray-100"
                                            onClick={() => handleDosageFormSelect('other')}
                                        >
                                            + Add as "Other"
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-3 text-center text-gray-500">
                                        <p>No dosage forms found</p>
                                        <button
                                            type="button"
                                            className="mt-1 text-blue-600 hover:underline text-sm"
                                            onClick={() => handleDosageFormSelect(dosageFormSearchTerm || 'other')}
                                        >
                                            + Add "{dosageFormSearchTerm || 'other'}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedDosageForm && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {selectedDosageForm}
                            </div>
                        )}
                    </div>
                    {errors.dosageForm && <p className="mt-1 text-sm text-red-600">{errors.dosageForm.message}</p>}
                </div>

                {/* Quantity */}
                <div className="lg:col-span-1">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaBoxes className="mr-1 text-blue-500" />
                        Quantity *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaBoxes className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            id="quantity"
                            {...register('quantity', { valueAsNumber: true })}
                            min="0"
                            step="1"
                            placeholder="Enter quantity"
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.quantity ? 'border-red-500 pr-10' : ''
                            }`}
                        />
                        {errors.quantity && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
                </div>

                {/* Price */}
                <div className="lg:col-span-1">
                    <label htmlFor="price" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaMoneyBillAlt className="mr-1 text-blue-500" />
                        Price (GHC) *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMoneyBillAlt className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm font-medium">₵</span>
                        </div>
                        <input
                            type="number"
                            id="price"
                            {...register('price', { valueAsNumber: true })}
                            className={`pl-12 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.price ? 'border-red-500 pr-10' : ''
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        {errors.price && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                {/* Package Information Section */}
                <div className="md:col-span-2">
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center mb-4">
                            <FaBox className="mr-2 text-blue-500" />
                            <h3 className="text-lg font-medium text-gray-900">Package Information</h3>
                        </div>
                        
                        {/* Is Packaged Checkbox */}
                        <div className="mb-4">
                            <div className="flex items-center">
                                <input
                                    id="isPackaged"
                                    type="checkbox"
                                    {...register('packageInfo.isPackaged')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isPackaged" className="ml-2 text-sm font-medium text-gray-700">
                                    Available in packaged quantities
                                </label>
                            </div>
                        </div>

                        {/* Package Details - Only show if isPackaged is true */}
                        {isPackaged && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Units Per Pack */}
                                <div>
                                    <label htmlFor="unitsPerPack" className="block text-sm font-medium text-gray-700">
                                        Units per Pack *
                                    </label>
                                    <input
                                        type="number"
                                        id="unitsPerPack"
                                        {...register('packageInfo.unitsPerPack', { valueAsNumber: true })}
                                        min="1"
                                        step="1"
                                        placeholder="e.g., 10"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                    {errors.packageInfo?.unitsPerPack && (
                                        <p className="mt-1 text-sm text-red-600">{errors.packageInfo.unitsPerPack.message}</p>
                                    )}
                                </div>

                                {/* Pack Price */}
                                <div>
                                    <label htmlFor="packPrice" className="block text-sm font-medium text-gray-700">
                                        Pack Price (GHC) *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₵</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="packPrice"
                                            {...register('packageInfo.packPrice', { valueAsNumber: true })}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    {errors.packageInfo?.packPrice && (
                                        <p className="mt-1 text-sm text-red-600">{errors.packageInfo.packPrice.message}</p>
                                    )}
                                </div>

                                {/* Packs Per Carton */}
                                <div>
                                    <label htmlFor="packsPerCarton" className="block text-sm font-medium text-gray-700">
                                        Packs per Carton
                                    </label>
                                    <input
                                        type="number"
                                        id="packsPerCarton"
                                        {...register('packageInfo.packsPerCarton', { valueAsNumber: true })}
                                        min="1"
                                        step="1"
                                        placeholder="e.g., 50"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                    {errors.packageInfo?.packsPerCarton && (
                                        <p className="mt-1 text-sm text-red-600">{errors.packageInfo.packsPerCarton.message}</p>
                                    )}
                                </div>

                                {/* Carton Price */}
                                <div>
                                    <label htmlFor="cartonPrice" className="block text-sm font-medium text-gray-700">
                                        Carton Price (GHC)
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₵</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="cartonPrice"
                                            {...register('packageInfo.cartonPrice', { valueAsNumber: true })}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    {errors.packageInfo?.cartonPrice && (
                                        <p className="mt-1 text-sm text-red-600">{errors.packageInfo.cartonPrice.message}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiry Date */}
                <div>
                    <label htmlFor="expiryDate" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-500" />
                        Expiry Date *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="date"
                            id="expiryDate"
                            {...register('expiryDate')}
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.expiryDate ? 'border-red-500 pr-10' : ''
                            }`}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.expiryDate && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>}
                </div>

                {/* Batch Number */}
                <div>
                    <label htmlFor="batchNumber" className="text-sm font-medium text-gray-700 flex items-center">
                        <FaBarcode className="mr-1 text-blue-500" />
                        Batch Number *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaBarcode className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="batchNumber"
                            {...register('batchNumber')}
                            placeholder="Enter batch number"
                            className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                                errors.batchNumber ? 'border-red-500 pr-10' : ''
                            }`}
                        />
                        {errors.batchNumber && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.batchNumber && <p className="mt-1 text-sm text-red-600">{errors.batchNumber.message}</p>}
                </div>

                {/* Requires Prescription */}
                <div className="col-span-full">
                    <div className="flex items-center p-3 border border-gray-300 bg-white hover:bg-gray-50 rounded-md shadow-sm transition-all">
                        <input
                            id="requiresPrescription"
                            type="checkbox"
                            {...register('requiresPrescription')}
                            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requiresPrescription" className="ml-2 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                            <FaPrescriptionBottleAlt className="mr-1 text-blue-500" />
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
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-colors duration-200 ease-in-out ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                        </span>
                    ) : (
                        <span className="flex items-center space-x-2">
                            <FaSave className="h-5 w-5" />
                            <span>{initialData ? 'Update Drug' : 'Add Drug'}</span>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};
