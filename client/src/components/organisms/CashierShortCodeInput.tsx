import React, { useState } from 'react';
import { Button } from '../atoms/Button';

interface CashierShortCodeInputProps {
    onFinalize: (code: string) => Promise<void>;
    isFinalizing: boolean;
    error: string;
}

const CashierShortCodeInput: React.FC<CashierShortCodeInputProps> = ({
    onFinalize,
    isFinalizing,
    error,
}) => {
    const [enteredShortCode, setEnteredShortCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onFinalize(enteredShortCode);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded text-center"
        >
            <div className="text-lg font-bold text-blue-800 mb-2">
                Enter Sale Short Code
            </div>
            <input
                type="text"
                value={enteredShortCode}
                onChange={(e) => setEnteredShortCode(e.target.value)}
                className="border rounded px-3 py-2 text-lg font-mono text-center"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
            />
            <Button type="submit" isLoading={isFinalizing} className="ml-2">
                Submit
            </Button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            <div className="mt-4 text-yellow-700 text-sm">
                Ask the pharmacist for the short code to finalize and print the
                sale receipt.
            </div>
        </form>
    );
};

export default CashierShortCodeInput;
