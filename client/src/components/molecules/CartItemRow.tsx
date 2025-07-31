import React from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import type { Drug } from '../../types/drug.types';

interface CartItemRowProps {
    index: number;
    item: { drug: string; quantity: number };
    drugs: Drug[];
    onDrugChange: (index: number, drugId: string) => void;
    onQuantityChange: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
    disableRemove?: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
    index,
    item,
    drugs,
    onDrugChange,
    onQuantityChange,
    onRemove,
    disableRemove,
}) => {
    return (
        <div className="flex items-end gap-4 mb-2">
            <div className="flex-1">
                <label htmlFor={`drug-select-${index}`} className="block text-sm font-medium mb-1">Drug</label>
                <select
                    id={`drug-select-${index}`}
                    value={item.drug}
                    onChange={(e) => onDrugChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">Select Drug</option>
                    {drugs.map((drug) => (
                        <option
                            key={drug.id}
                            value={drug.id}
                        >
                            {drug.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Qty</label>
                <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                        onQuantityChange(index, Number(e.target.value))
                    }
                    className="w-20"
                />
            </div>
            <Button
                type="button"
                variant="danger"
                onClick={() => onRemove(index)}
                className="mb-1"
                disabled={disableRemove}
            >
                Remove
            </Button>
        </div>
    );
};

export default CartItemRow;
