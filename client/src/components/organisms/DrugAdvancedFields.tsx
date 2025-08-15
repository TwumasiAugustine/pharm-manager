import React, { useState } from 'react';
import {
    FaCapsules,
    FaCheckCircle,
    FaBoxOpen,
    FaCubes,
    FaLayerGroup,
} from 'react-icons/fa';
import type {
    UseFormRegister,
    FieldErrors,
    UseFormSetValue,
} from 'react-hook-form';
import type { DrugFormValues } from '../../validations/drug.validation';
import { DOSAGE_FORMS } from '../../data/drugs';

interface DrugAdvancedFieldsProps {
    register: UseFormRegister<DrugFormValues>;
    errors: FieldErrors<DrugFormValues>;
    setValue?: UseFormSetValue<DrugFormValues>;
}

export const DrugAdvancedFields: React.FC<DrugAdvancedFieldsProps> = ({
    register,
    errors,
    setValue,
}) => {
    // Dosage Form Autocomplete
    const [dosageSearch, setDosageSearch] = useState('');
    const [showDosageResults, setShowDosageResults] = useState(false);
    const filteredDosages = dosageSearch
        ? DOSAGE_FORMS.filter((d) =>
              d.toLowerCase().includes(dosageSearch.toLowerCase()),
          )
        : DOSAGE_FORMS;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dosage Form */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="dosageForm"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaCapsules className="mr-1 text-blue-500" /> Dosage Form *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCapsules className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="dosageForm"
                        {...register('dosageForm')}
                        placeholder="e.g. Tablet"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.dosageForm ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.dosageForm}
                        value={dosageSearch}
                        onChange={(e) => {
                            setDosageSearch(e.target.value);
                            setShowDosageResults(true);
                            if (setValue)
                                setValue('dosageForm', e.target.value, {
                                    shouldValidate: true,
                                });
                        }}
                        onFocus={() => setShowDosageResults(true)}
                        onBlur={() =>
                            setTimeout(() => setShowDosageResults(false), 100)
                        }
                        autoComplete="off"
                    />
                    {showDosageResults && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {filteredDosages.length === 0 ? (
                                <li
                                    className="px-3 py-2 text-gray-500 cursor-pointer"
                                    onMouseDown={() => {
                                        setDosageSearch(dosageSearch);
                                        if (setValue)
                                            setValue(
                                                'dosageForm',
                                                dosageSearch,
                                                { shouldValidate: true },
                                            );
                                    }}
                                >
                                    Add "{dosageSearch}"
                                </li>
                            ) : (
                                filteredDosages.map((d) => (
                                    <li
                                        key={d}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                                            d === dosageSearch
                                                ? 'bg-blue-50 font-semibold'
                                                : ''
                                        }`}
                                        onMouseDown={() => {
                                            setDosageSearch(d);
                                            if (setValue)
                                                setValue('dosageForm', d, {
                                                    shouldValidate: true,
                                                });
                                        }}
                                    >
                                        {d}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
                {errors.dosageForm && (
                    <p className="mt-1 text-xs text-red-600">
                        {errors.dosageForm.message as string}
                    </p>
                )}
            </div>
            {/* Able to Sell */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2 flex items-center">
                <input
                    id="ableToSell"
                    type="checkbox"
                    {...register('ableToSell')}
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <label
                    htmlFor="ableToSell"
                    className="text-sm font-medium text-gray-700 flex items-center mb-0"
                >
                    <FaCheckCircle className="mr-1 text-green-500" /> Able to
                    Sell
                </label>
            </div>
            {/* Drugs in Carton */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="drugsInCarton"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaBoxOpen className="mr-1 text-blue-500" /> Drugs in Carton
                    (Optional)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBoxOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        id="drugsInCarton"
                        {...register('drugsInCarton', { valueAsNumber: true })}
                        min="0"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.drugsInCarton ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.drugsInCarton}
                    />
                </div>
                {errors.drugsInCarton && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.drugsInCarton.message}
                    </p>
                )}
            </div>
            {/* Units per Carton */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="unitsPerCarton"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaCubes className="mr-1 text-blue-500" /> Units per Carton
                    *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCubes className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        id="unitsPerCarton"
                        {...register('unitsPerCarton', { valueAsNumber: true })}
                        min="1"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.unitsPerCarton ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.unitsPerCarton}
                    />
                </div>
                {errors.unitsPerCarton && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.unitsPerCarton.message}
                    </p>
                )}
            </div>
            {/* Packs per Carton */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                <label
                    htmlFor="packsPerCarton"
                    className="text-sm font-medium text-gray-700 flex items-center mb-1"
                >
                    <FaLayerGroup className="mr-1 text-blue-500" /> Packs per
                    Carton *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLayerGroup className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        id="packsPerCarton"
                        {...register('packsPerCarton', { valueAsNumber: true })}
                        min="1"
                        className={`pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                            errors.packsPerCarton ? 'border-red-500 pr-10' : ''
                        }`}
                        aria-invalid={!!errors.packsPerCarton}
                    />
                </div>
                {errors.packsPerCarton && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.packsPerCarton.message}
                    </p>
                )}
            </div>
        </div>
    );
};
