import React from 'react';
import type { Sale } from '../../types/sale.types';
import type { Drug } from '../../types/drug.types';

interface ReceiptProps {
    sale: Sale;
    drugs: Drug[];
}

const Receipt: React.FC<ReceiptProps> = ({ sale, drugs }) => {
    // All drug info is now accessed directly from item.name and item.brand
    return (
        <div className="max-w-md mx-auto bg-white border rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2 text-center">Sale Receipt</h2>
            <div className="mb-4 text-sm text-gray-600 text-center">
                Sale ID: <span className="font-mono">{sale.id}</span>
                <br />
                Date: {new Date(sale.createdAt).toLocaleString()}
            </div>
            <table className="w-full mb-4 text-sm">
                <thead>
                    <tr>
                        <th className="text-left">Drug</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, idx) => {
                        const drug = drugs.find((d) => d.id === item.drugId);
                        const price = drug?.price || item.priceAtSale || 0;
                        return (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">
                                    ${price.toFixed(2)}
                                </td>
                                <td className="text-right">
                                    ${(price * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${sale.totalAmount.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default Receipt;
