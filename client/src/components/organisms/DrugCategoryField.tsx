import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { DrugFormValues } from '../../validations/drug.validation';

interface DrugCategoryFieldProps {
    register: UseFormRegister<DrugFormValues>;
    errors: FieldErrors<DrugFormValues>;
    categorySearchTerm: string;
    setCategorySearchTerm: (v: string) => void;
    showCategoryResults: boolean;
    setShowCategoryResults: (v: boolean) => void;
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    filteredCategories: string[];
    loadingCategories: boolean;
    handleCategorySearch: (query: string) => void;
    handleCategorySelect: (category: string) => void;
}

/**
 * DrugCategoryField component for selecting drug category with search.
 * @param props DrugCategoryFieldProps
 */
export const DrugCategoryField: React.FC<DrugCategoryFieldProps> = ({
    register,
    errors,
    categorySearchTerm,
    setCategorySearchTerm,
    showCategoryResults,
    setShowCategoryResults,
    selectedCategory,
    setSelectedCategory,
    filteredCategories,
    loadingCategories,
    handleCategorySearch,
    handleCategorySelect,
}) => {
    // Handle input change for search
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearchTerm(e.target.value);
        handleCategorySearch(e.target.value);
        setShowCategoryResults(true);
    };

    // Handle category selection
    const onCategoryClick = (category: string) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category);
        handleCategorySelect(category);
        setShowCategoryResults(false);
    };

    // Hide results on blur
    const onBlur = () => {
        setTimeout(() => setShowCategoryResults(false), 100);
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaLayerGroup className="mr-1 text-blue-500" /> Category *
            </label>
            <div className="mt-1 relative">
                {/* Hidden input for form validation */}
                <input
                    type="hidden"
                    id="category"
                    {...register('category', {
                        value: selectedCategory,
                    })}
                />
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search or select category"
                    value={categorySearchTerm}
                    onChange={onInputChange}
                    onFocus={() => setShowCategoryResults(true)}
                    onBlur={onBlur}
                    autoComplete="off"
                    aria-invalid={!!errors.category}
                />
                {showCategoryResults && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {loadingCategories ? (
                            <li className="px-3 py-2 text-gray-500">
                                Loading...
                            </li>
                        ) : filteredCategories.length === 0 ? (
                            <li
                                className="px-3 py-2 text-gray-500 cursor-pointer"
                                onMouseDown={() =>
                                    onCategoryClick(categorySearchTerm)
                                }
                            >
                                Add "{categorySearchTerm}"
                            </li>
                        ) : (
                            <>
                                {filteredCategories.map((category) => (
                                    <li
                                        key={category}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                                            category === selectedCategory
                                                ? 'bg-blue-50 font-semibold'
                                                : ''
                                        }`}
                                        onMouseDown={() =>
                                            onCategoryClick(category)
                                        }
                                    >
                                        {category}
                                    </li>
                                ))}
                                {/* Option to add if not found in filtered list */}
                                {!filteredCategories.includes(
                                    categorySearchTerm,
                                ) &&
                                    categorySearchTerm.trim() !== '' && (
                                        <li
                                            className="px-3 py-2 text-gray-500 cursor-pointer border-t border-gray-100"
                                            onMouseDown={() =>
                                                onCategoryClick(
                                                    categorySearchTerm,
                                                )
                                            }
                                        >
                                            Add "{categorySearchTerm}"
                                        </li>
                                    )}
                            </>
                        )}
                    </ul>
                )}
            </div>
            {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                </p>
            )}
        </div>
    );
};
