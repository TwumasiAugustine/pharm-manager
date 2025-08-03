import React from 'react';
import type { Drug } from '../../types/drug.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

interface CartItem {
    drug: string;
    quantity: number;
}

interface CartTotalsProps {
    items: CartItem[];
    drugs: Drug[];
}

const CartTotals: React.FC<CartTotalsProps> = ({ items, drugs }) => {
    const getDrugPrice = (drugId: string) => {
        const drug = drugs.find((d) => d.id === drugId);
        return drug ? drug.price || 0 : 0;
    };
    const total = items.reduce((sum, item) => {
        const price = getDrugPrice(item.drug);
        return sum + price * item.quantity;
    }, 0);
    return (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md">
            <div className="flex justify-between mb-2">
                <span className="font-medium">Total Items:</span>
                <span>
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>{formatGHSDisplayAmount(total)}</span>
            </div>
        </div>
    );
};

export default CartTotals;
