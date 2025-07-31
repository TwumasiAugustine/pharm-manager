import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type {
    FieldErrors,
    UseFieldArrayRemove,
    FieldArrayWithId,
} from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { SearchBar } from '../molecules/SearchBar';
import { FaTrash } from 'react-icons/fa';
import { Alert, AlertDescription, AlertTitle } from '../molecules/Alert';
import { getErrorMessage } from '../../utils/error';
import type { Drug, PaginatedDrugsResponse } from '../../types/drug.types';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Sale, CreateSaleRequest } from '../../types/sale.types';
import type { CreateSaleFormValues } from '../../validations/sale.validation';

interface CreateSaleFormProps {
    onSubmit: (data: CreateSaleFormValues) => void;
    drugData: PaginatedDrugsResponse | undefined;
    isLoadingDrugs: boolean;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    handleAddDrug: (drug: Drug) => void;
    fields: FieldArrayWithId<CreateSaleFormValues, 'items', 'id'>[];
    remove: UseFieldArrayRemove;
    errors: FieldErrors<CreateSaleFormValues>;
    totalAmount: number;
    createSaleMutation: UseMutationResult<
        Sale,
        Error,
        CreateSaleRequest,
        unknown
    >;
}

const CreateSaleForm: React.FC<CreateSaleFormProps> = ({
    onSubmit,
    drugData,
    isLoadingDrugs,
    searchTerm,
    setSearchTerm,
    handleAddDrug,
    fields,
    remove,
    errors,
    totalAmount,
    createSaleMutation,
}) => {
    const { handleSubmit, watch, control } =
        useFormContext<CreateSaleFormValues>();
    const watchedItems = watch('items');
    const isProcessing = createSaleMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Sale</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Drug Search - Responsive and always loads from DB */}
                    <div className="space-y-2">
                        <label
                            htmlFor="drug-search"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Search for a drug to add
                        </label>
                        <div className="relative">
                            <SearchBar
                                placeholder="Start typing drug name..."
                                onSearch={setSearchTerm}
                                className="w-full"
                                initialValue={searchTerm}
                            />
                            {/* Responsive dropdown for search results */}
                            {isLoadingDrugs && (
                                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md z-20 p-4 text-center text-gray-500 text-sm">
                                    Loading drugs...
                                </div>
                            )}
                            {searchTerm &&
                                drugData?.drugs &&
                                drugData.drugs.length > 0 && (
                                    <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md z-20 max-h-60 overflow-y-auto mt-1 divide-y divide-gray-100">
                                        {drugData.drugs.map((drug: Drug) => (
                                            <li
                                                key={drug.id}
                                                className="p-3 hover:bg-blue-50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between transition-colors"
                                                onClick={() =>
                                                    handleAddDrug(drug)
                                                }
                                            >
                                                <span className="font-medium text-gray-900">
                                                    {drug.name}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({drug.brand})
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    In Stock: {drug.quantity}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ${drug.price.toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            {searchTerm &&
                                drugData?.drugs &&
                                drugData.drugs.length === 0 &&
                                !isLoadingDrugs && (
                                    <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md z-20 p-4 text-center text-gray-500 text-sm">
                                        No drugs found for "{searchTerm}"
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Sale Items - Responsive */}
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 p-2 border rounded-md"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">
                                        {field.drugName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Price: ${field.priceAtSale.toFixed(2)}
                                    </p>
                                </div>
                                <Controller
                                    name={`items.${index}.quantity`}
                                    control={control}
                                    render={({
                                        field: { onChange, ...restField },
                                    }) => (
                                        <Input
                                            type="number"
                                            className="w-full md:w-24"
                                            min="1"
                                            max={field.maxQuantity}
                                            onChange={(e) =>
                                                onChange(
                                                    parseInt(
                                                        e.target.value,
                                                        10,
                                                    ) || 0,
                                                )
                                            }
                                            {...restField}
                                        />
                                    )}
                                />
                                <p className="w-full md:w-28 text-right">
                                    Subtotal: $
                                    {(
                                        (watchedItems?.[index]?.priceAtSale ??
                                            0) *
                                        (watchedItems?.[index]?.quantity ?? 0)
                                    ).toFixed(2)}
                                </p>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => remove(index)}
                                >
                                    <FaTrash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {errors.items && (
                            <p className="text-red-500 text-sm">
                                {errors.items.message}
                            </p>
                        )}
                    </div>

                    {/* Total Amount */}
                    <div className="text-right text-xl font-bold">
                        Total: ${totalAmount.toFixed(2)}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">
                            Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Controller
                                    name="paymentMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <label
                                                htmlFor="paymentMethod"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Payment Method
                                            </label>
                                            <select
                                                id="paymentMethod"
                                                className={`w-full border rounded-md p-2 ${
                                                    errors.paymentMethod
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                }`}
                                                {...field}
                                            >
                                                <option value="">
                                                    Select payment method
                                                </option>
                                                <option value="cash">
                                                    Cash
                                                </option>
                                                <option value="card">
                                                    Card
                                                </option>
                                                <option value="mobile">
                                                    Mobile Money
                                                </option>
                                            </select>
                                            {errors.paymentMethod && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {
                                                        errors.paymentMethod
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="transactionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="transactionId"
                                            label="Transaction ID"
                                            placeholder="Enter transaction/reference ID (if any)"
                                            error={
                                                errors.transactionId?.message
                                            }
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sale Notes */}
                    <div className="mb-4">
                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="saleNotes"
                                    label="Sale Notes"
                                    placeholder="Add any notes for this sale (optional)"
                                    error={errors.notes?.message}
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    {/* Customer creation status */}
                    {/* Customer creation status removed */}

                    {createSaleMutation.isError && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {getErrorMessage(createSaleMutation.error)}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={isProcessing || fields.length === 0}
                        className="w-full md:w-auto flex items-center justify-center space-x-2"
                        aria-live="polite"
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
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
                                <span>Processing Sale...</span>
                            </>
                        ) : (
                            <span className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    ></path>
                                </svg>
                                Create Sale
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateSaleForm;
