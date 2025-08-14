import React from 'react';
import {
    FaCalendarAlt,
    FaBarcode,
    FaPrescriptionBottleAlt,
} from 'react-icons/fa';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { DrugFormValues } from '../../validations/drug.validation';

interface DrugMetaFieldsProps {
    register: UseFormRegister<DrugFormValues>;
    errors: FieldErrors<DrugFormValues>;
}

export const DrugMetaFields: React.FC<DrugMetaFieldsProps> = ({
    register,
    errors,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiry Date */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="expiryDate"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaCalendarAlt className="mr-1 text-blue-500" /> Expiry Date *
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
                    aria-invalid={!!errors.expiryDate}
                />
                {errors.expiryDate && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>
            {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.expiryDate.message}
                </p>
            )}
        </div>
        {/* Batch Number */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
            <label
                htmlFor="batchNumber"
                className="text-sm font-medium text-gray-700 flex items-center mb-1"
            >
                <FaBarcode className="mr-1 text-blue-500" /> Batch Number *
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
                    aria-invalid={!!errors.batchNumber}
                />
                {errors.batchNumber && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>
            {errors.batchNumber && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.batchNumber.message}
                </p>
            )}
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
                <label
                    htmlFor="requiresPrescription"
                    className="ml-2 flex items-center text-sm font-medium text-gray-700 cursor-pointer"
                >
                    <FaPrescriptionBottleAlt className="mr-1 text-blue-500" />{' '}
                    Requires Prescription
                </label>
            </div>
        </div>
    </div>
);
