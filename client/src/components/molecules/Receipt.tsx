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
        <div className="w-full max-w-4xl mx-auto bg-white border rounded-lg shadow-lg p-8 print:shadow-none print:border-none">
            {/* Receipt Header */}
            <header className="border-b-2 border-dashed pb-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            {pharmacyInfo?.name || 'Pharmacy'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {pharmacyInfo?.slogan ||
                                'Your health is our priority'}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold uppercase text-gray-700">
                            Sales Receipt
                        </h2>
                        <p className="text-sm font-mono text-gray-500">
                            ID: {sale.id}
                        </p>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p>{pharmacyInfo?.address?.street}</p>
                    <p>
                        {pharmacyInfo?.address?.city},{' '}
                        {pharmacyInfo?.address?.state}{' '}
                        {pharmacyInfo?.address?.postalCode}
                    </p>
                    <p>
                        Phone: {pharmacyInfo?.contact?.phone} | Email:{' '}
                        {pharmacyInfo?.contact?.email}
                    </p>
                </div>
            </header>

            {/* Transaction Info */}
            <section className="grid grid-cols-2 gap-6 mb-8 text-sm">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">
                        Billed To
                    </h3>
                    {sale.customer ? (
                        <div>
                            <p className="font-medium">{sale.customer.name}</p>
                            <p>Phone: {sale.customer.phone}</p>
                        </div>
                    ) : (
                        <p>Walk-in Customer</p>
                    )}
                </div>
                <div className="text-right">
                    <h3 className="font-semibold text-gray-700 mb-2 pb-1 border-b">
                        Sale Details
                    </h3>
                    <p>
                        <span className="font-semibold">Date of Issue:</span>{' '}
                        {saleDate}
                    </p>
                    <p>
                        <span className="font-semibold">Served By:</span>{' '}
                        {soldBy}
                    </p>
                </div>
            </section>

            {/* Items Table */}
            <section className="mb-8">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left font-semibold p-3">#</th>
                            <th className="text-left font-semibold p-3">
                                Item Description
                            </th>
                            <th className="text-right font-semibold p-3">
                                Quantity
                            </th>
                            <th className="text-right font-semibold p-3">
                                Unit Price
                            </th>
                            <th className="text-right font-semibold p-3">
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
                            const price = drug?.price || item.priceAtSale || 0;
                            // Use drug properties if available
                            const displayName = drug?.name || item.name;
                            const displayBrand =
                                drug?.brand || item.brand || 'N/A';

                            return (
                                <tr
                                    key={`${item.drugId || ''}-${index}`}
                                    className="border-b"
                                >
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <p className="font-medium text-gray-800">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Brand: {displayBrand}
                                        </p>
                                    </td>
                                    <td className="text-right p-3">
                                        {item.quantity}
                                    </td>
                                    <td className="text-right p-3">
                                        {formatGHSDisplayAmount(price)}
                                    </td>
                                    <td className="text-right p-3 font-medium">
                                        {formatGHSDisplayAmount(
                                            price * item.quantity,
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            {/* Totals Section */}
            <section className="flex justify-end mb-8">
                <div className="w-full max-w-xs text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                            {formatGHSDisplayAmount(sale.totalAmount)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Tax (0%)</span>
                        <span>{formatGHSDisplayAmount(0)}</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg font-bold text-gray-800 bg-gray-50 -mx-3 px-3 rounded">
                        <span>Total Amount</span>
                        <span>{formatGHSDisplayAmount(sale.totalAmount)}</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 pt-6 border-t">
                <p>
                    Thank you for your business! - {pharmacyInfo?.slogan || ''}
                </p>
                <p className="mt-1">
                    Printed on: {printDate}. This is a computer-generated
                    receipt.
                </p>
            </footer>
        </div>
    );
};

export default Receipt;
