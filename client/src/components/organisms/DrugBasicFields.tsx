import React, { useState } from 'react';
import { FaPills, FaTrademark } from 'react-icons/fa';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { DrugFormValues } from '../../validations/drug.validation';
import { DRUG_NAMES, BRANDS } from '../../data/drugs';

interface DrugBasicFieldsProps {
    register: UseFormRegister<DrugFormValues>;
    errors: FieldErrors<DrugFormValues>;
}

export const DrugBasicFields: React.FC<DrugBasicFieldsProps> = ({
    register,
    errors,
}) => {
    // Drug Name Autocomplete
    const [nameSearch, setNameSearch] = useState('');
    const [showNameResults, setShowNameResults] = useState(false);
    const filteredNames = nameSearch
        ? DRUG_NAMES.filter((n) =>
              n.toLowerCase().includes(nameSearch.toLowerCase()),
          )
        : DRUG_NAMES;

    // Brand Autocomplete
    const [brandSearch, setBrandSearch] = useState('');
    const [showBrandResults, setShowBrandResults] = useState(false);
    const filteredBrands = brandSearch
        ? BRANDS.filter((b) =>
              b.toLowerCase().includes(brandSearch.toLowerCase()),
          )
        : BRANDS;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaPills className="mr-1 text-blue-500" /> Drug Name *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPills className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="name"
                        {...register('name')}
                        placeholder="e.g. Paracetamol"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.name ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.name}
                        value={nameSearch}
                        onChange={(e) => {
                            setNameSearch(e.target.value);
                            setShowNameResults(true);
                            // Update form value
                            register('name').onChange(e);
                        }}
                        onFocus={() => setShowNameResults(true)}
                        onBlur={() =>
                            setTimeout(() => setShowNameResults(false), 100)
                        }
                        autoComplete="off"
                    />
                    {showNameResults && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {filteredNames.length === 0 ? (
                                <li
                                    className="px-3 py-2 text-gray-500 cursor-pointer"
                                    onMouseDown={() => {
                                        setNameSearch(nameSearch);
                                        register('name').onChange({
                                            target: { value: nameSearch },
                                        });
                                    }}
                                >
                                    Add "{nameSearch}"
                                </li>
                            ) : (
                                filteredNames.map((n) => (
                                    <li
                                        key={n}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                                            n === nameSearch
                                                ? 'bg-blue-50 font-semibold'
                                                : ''
                                        }`}
                                        onMouseDown={() => {
                                            setNameSearch(n);
                                            register('name').onChange({
                                                target: { value: n },
                                            });
                                        }}
                                    >
                                        {n}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                    </p>
                )}
            </div>
            {/* Brand */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="brand"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaTrademark className="mr-1 text-blue-500" /> Brand *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTrademark className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="brand"
                        {...register('brand')}
                        placeholder="e.g. Pfizer"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.brand ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.brand}
                        value={brandSearch}
                        onChange={(e) => {
                            setBrandSearch(e.target.value);
                            setShowBrandResults(true);
                            // Update form value
                            register('brand').onChange(e);
                        }}
                        onFocus={() => setShowBrandResults(true)}
                        onBlur={() =>
                            setTimeout(() => setShowBrandResults(false), 100)
                        }
                        autoComplete="off"
                    />
                    {showBrandResults && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {filteredBrands.length === 0 ? (
                                <li
                                    className="px-3 py-2 text-gray-500 cursor-pointer"
                                    onMouseDown={() => {
                                        setBrandSearch(brandSearch);
                                        register('brand').onChange({
                                            target: { value: brandSearch },
                                        });
                                    }}
                                >
                                    Add "{brandSearch}"
                                </li>
                            ) : (
                                filteredBrands.map((b) => (
                                    <li
                                        key={b}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                                            b === brandSearch
                                                ? 'bg-blue-50 font-semibold'
                                                : ''
                                        }`}
                                        onMouseDown={() => {
                                            setBrandSearch(b);
                                            register('brand').onChange({
                                                target: { value: b },
                                            });
                                        }}
                                    >
                                        {b}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
                {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.brand.message}
                    </p>
                )}
            </div>
        </div>
    );
};
