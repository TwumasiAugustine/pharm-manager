import React from 'react';
import { format } from 'date-fns';
import type { Sale } from '../../types/sale.types';
import type { Drug } from '../../types/drug.types';
import type { PharmacyInfo } from '../../api/pharmacy.api';
import { formatGHSDisplayAmount } from '../../utils/currency';

interface ReceiptProps {
    sale: Sale;
    drugs: Drug[];
    pharmacyInfo?: PharmacyInfo;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, drugs, pharmacyInfo }) => {
    const saleDate = sale.createdAt
        ? format(new Date(sale.createdAt), 'PPP p')
        : 'N/A';
    const printDate = format(new Date(), 'PPP p');

    const soldBy =
        sale.soldBy && typeof sale.soldBy === 'object'
            ? sale.soldBy.name
            : 'N/A';

    return (
        <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg print:shadow-none print:border-none print:rounded-none">
            <div className="p-4 sm:p-6 lg:p-8 print:p-6">
                {/* Receipt Header */}
                <header className="border-b-2 border-dashed pb-4 sm:pb-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                                {pharmacyInfo?.name || 'Pharmacy'}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {pharmacyInfo?.slogan ||
                                    'Your health is our priority'}
                            </p>
                            {sale.branch && (
                                <p className="text-xs sm:text-sm font-medium text-blue-600 mt-1">
                                    Branch: {sale.branch.name}
                                </p>
                            )}
                        </div>
                        <div className="text-center sm:text-right">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold uppercase text-gray-700">
                                Sales Receipt
                            </h2>
                            <p className="text-xs sm:text-sm font-mono text-gray-500 break-all">
                                ID: {sale.id}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        <p>{pharmacyInfo?.address?.street}</p>
                        <p>
                            {pharmacyInfo?.address?.city},{' '}
                            {pharmacyInfo?.address?.state}{' '}
                            {pharmacyInfo?.address?.postalCode}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                            <p>Phone: {pharmacyInfo?.contact?.phone}</p>
                            <p>Email: {pharmacyInfo?.contact?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Transaction Info */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">
                            Billed To
                        </h3>
                        {sale.customer ? (
                            <div>
                                <p className="font-medium">
                                    {sale.customer.name}
                                </p>
                                <p>Phone: {sale.customer.phone}</p>
                            </div>
                        ) : (
                            <p>Walk-in Customer</p>
                        )}
                    </div>
                    <div className="sm:text-right">
                        <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">
                            Sale Details
                        </h3>
                        <p>
                            <span className="font-semibold">
                                Date of Issue:
                            </span>{' '}
                            <span className="block sm:inline">{saleDate}</span>
                        </p>
                        <p>
                            <span className="font-semibold">Served By:</span>{' '}
                            <span className="block sm:inline">{soldBy}</span>
                        </p>
                    </div>
                </section>

                {/* Items Table */}
                <section className="mb-6 sm:mb-8">
                    {/* Mobile Card Layout */}
                    <div className="block sm:hidden space-y-4">
                        {(sale.items || []).map((item, index) => {
                            // Use the attached drug object directly if available
                            // Otherwise fall back to the drug search
                            const drug =
                                item.drug ||
                                drugs.find(
                                    (d) =>
                                        d.id === item.drugId ||
                                        d._id === item.drugId,
                                );

                            // Determine price label and value based on saleType
                            let priceLabel = 'Unit Price';
                            let price = item.priceAtSale || 0;

                            if (item.saleType === 'pack') {
                                priceLabel = 'Price per Pack';
                                if (
                                    drug &&
                                    'pricePerPack' in drug &&
                                    drug.pricePerPack
                                ) {
                                    price = drug.pricePerPack;
                                }
                            } else if (item.saleType === 'carton') {
                                priceLabel = 'Price per Carton';
                                if (
                                    drug &&
                                    'pricePerCarton' in drug &&
                                    drug.pricePerCarton
                                ) {
                                    price = drug.pricePerCarton;
                                }
                            } else {
                                // unit sale
                                if (
                                    drug &&
                                    'pricePerUnit' in drug &&
                                    drug.pricePerUnit
                                ) {
                                    price = drug.pricePerUnit;
                                }
                            }

                            // Dosage form: DrugDetails may not have it, so fallback to empty string
                            const displayDosageForm =
                                'dosageForm' in (drug || {}) &&
                                (drug as Drug).dosageForm
                                    ? (drug as Drug).dosageForm
                                    : '';
                            const displayName = displayDosageForm
                                ? `${
                                      drug?.name || item.name
                                  } (${displayDosageForm})`
                                : drug?.name || item.name;
                            const displayBrand =
                                drug?.brand || item.brand || 'N/A';

                            return (
                                <div
                                    key={`${item.drugId || ''}-${index}`}
                                    className="bg-gray-50 p-3 rounded-lg border"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-sm">
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Brand: {displayBrand}
                                            </p>
                                        </div>
                                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize ml-2">
                                            {item.saleType}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <p className="text-gray-500">
                                                Quantity
                                            </p>
                                            <p className="font-medium">
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                {priceLabel}
                                            </p>
                                            <p className="font-medium">
                                                {formatGHSDisplayAmount(price)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-500">
                                                Total
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {formatGHSDisplayAmount(
                                                    price * item.quantity,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50 border-b-2">
                                <tr>
                                    <th className="text-left font-semibold p-2 sm:p-4 border-b">
                                        #
                                    </th>
                                    <th className="text-left font-semibold p-2 sm:p-4 border-b">
                                        Item Description
                                    </th>
                                    <th className="text-center font-semibold p-2 sm:p-4 border-b">
                                        Sale Type
                                    </th>
                                    <th className="text-right font-semibold p-2 sm:p-4 border-b">
                                        Quantity
                                    </th>
                                    <th className="text-right font-semibold p-2 sm:p-4 border-b">
                                        Unit Price
                                    </th>
                                    <th className="text-right font-semibold p-2 sm:p-4 border-b">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(sale.items || []).map((item, index) => {
                                    // Use the attached drug object directly if available
                                    // Otherwise fall back to the drug search
                                    const drug =
                                        item.drug ||
                                        drugs.find(
                                            (d) =>
                                                d.id === item.drugId ||
                                                d._id === item.drugId,
                                        );

                                    // Determine price label and value based on saleType
                                    let priceLabel = 'Unit Price';
                                    let price = item.priceAtSale || 0;

                                    if (item.saleType === 'pack') {
                                        priceLabel = 'Price per Pack';
                                        if (
                                            drug &&
                                            'pricePerPack' in drug &&
                                            drug.pricePerPack
                                        ) {
                                            price = drug.pricePerPack;
                                        }
                                    } else if (item.saleType === 'carton') {
                                        priceLabel = 'Price per Carton';
                                        if (
                                            drug &&
                                            'pricePerCarton' in drug &&
                                            drug.pricePerCarton
                                        ) {
                                            price = drug.pricePerCarton;
                                        }
                                    } else {
                                        // unit sale
                                        if (
                                            drug &&
                                            'pricePerUnit' in drug &&
                                            drug.pricePerUnit
                                        ) {
                                            price = drug.pricePerUnit;
                                        }
                                    }

                                    // Dosage form: DrugDetails may not have it, so fallback to empty string
                                    const displayDosageForm =
                                        'dosageForm' in (drug || {}) &&
                                        (drug as Drug).dosageForm
                                            ? (drug as Drug).dosageForm
                                            : '';
                                    const displayName = displayDosageForm
                                        ? `${
                                              drug?.name || item.name
                                          } (${displayDosageForm})`
                                        : drug?.name || item.name;
                                    const displayBrand =
                                        drug?.brand || item.brand || 'N/A';

                                    return (
                                        <tr
                                            key={`${
                                                item.drugId || ''
                                            }-${index}`}
                                            className="border-b hover:bg-gray-25"
                                        >
                                            <td className="p-2 sm:p-4 text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="p-2 sm:p-4">
                                                <p className="font-medium text-gray-800">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Brand: {displayBrand}
                                                </p>
                                            </td>
                                            <td className="text-center p-2 sm:p-4">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                                                    {item.saleType}
                                                </span>
                                            </td>
                                            <td className="text-right p-2 sm:p-4 font-medium">
                                                {item.quantity}
                                            </td>
                                            <td className="text-right p-2 sm:p-4">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {priceLabel}
                                                </div>
                                                <div className="font-medium">
                                                    {formatGHSDisplayAmount(
                                                        price,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-right p-2 sm:p-4 font-semibold text-gray-800">
                                                {formatGHSDisplayAmount(
                                                    price * item.quantity,
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Totals Section */}
                <section className="flex justify-center sm:justify-end mb-6 sm:mb-8">
                    <div className="w-full sm:max-w-sm">
                        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                    {formatGHSDisplayAmount(sale.totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b">
                                <span className="text-gray-600">Tax (0%)</span>
                                <span>{formatGHSDisplayAmount(0)}</span>
                            </div>
                            <div className="flex justify-between py-3 sm:py-4 text-lg sm:text-xl font-bold text-gray-800">
                                <span>Total Amount</span>
                                <span className="text-green-600">
                                    {formatGHSDisplayAmount(sale.totalAmount)}
                                </span>
                            </div>
                            <div className="text-center pt-3 border-t">
                                <p className="text-sm text-gray-600">
                                    Payment Method:{' '}
                                    <span className="font-medium capitalize">
                                        {sale.paymentMethod}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-xs sm:text-sm text-gray-500 pt-4 sm:pt-6 border-t-2 border-dashed">
                    <div className="mb-3 sm:mb-4">
                        <p className="font-medium text-gray-700">
                            Thank you for choosing{' '}
                            {pharmacyInfo?.name || 'our pharmacy'}!
                        </p>
                        <p className="text-xs mt-1">
                            {pharmacyInfo?.slogan ||
                                'Your health is our priority'}
                        </p>
                    </div>
                    <div className="text-xs space-y-1">
                        <p>Receipt generated on: {printDate}</p>
                        <p className="break-words">
                            This is a computer-generated receipt and does not
                            require a signature.
                        </p>
                        {sale.branch && (
                            <p>Served at: {sale.branch.name} Branch</p>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Receipt;
