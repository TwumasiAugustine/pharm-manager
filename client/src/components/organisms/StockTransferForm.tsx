import React, { useState } from 'react';
import type { Branch } from '../../types/branch.types';
import type { Drug } from '../../types/drug.types';

interface StockTransferFormProps {
    drug: Drug;
    branches: Branch[];
    currentBranchId: string;
    onSubmit: (toBranchId: string, quantity: number) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const StockTransferForm: React.FC<StockTransferFormProps> = ({
    drug,
    branches,
    currentBranchId,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [toBranchId, setToBranchId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const availableBranches = branches.filter((b) => b.id !== currentBranchId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!toBranchId) {
            setError('Please select a destination branch.');
            return;
        }
        if (quantity < 1 || quantity > drug.quantity) {
            setError('Invalid quantity.');
            return;
        }
        onSubmit(toBranchId, quantity);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <h3 className="text-lg font-semibold mb-2">
                Transfer Stock for {drug.name}
            </h3>
            <div>
                <label className="block text-sm font-medium mb-1">
                    To Branch
                </label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    required
                    title="Select destination branch"
                >
                    <option value="">Select branch</option>
                    {availableBranches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Quantity
                </label>
                <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    min={1}
                    max={drug.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    placeholder="Enter quantity"
                />
                <div className="text-xs text-gray-500 mt-1">
                    Available: {drug.quantity}
                </div>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Transferring...' : 'Transfer'}
                </button>
            </div>
        </form>
    );
};
