import React from 'react';

interface PharmacistShortCodeDisplayProps {
    shortCode: string;
}

const PharmacistShortCodeDisplay: React.FC<PharmacistShortCodeDisplayProps> = ({
    shortCode,
}) => (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded text-center">
        <div className="text-lg font-bold text-blue-800 mb-2">
            Short Code for Cashier
        </div>
        <div className="text-blue-700 mb-2">
            Share this code with the cashier to authorize the sale:
        </div>
        <div className="text-2xl font-mono font-bold text-blue-900 tracking-widest bg-white px-4 py-2 rounded inline-block border border-blue-200">
            {shortCode}
        </div>
    </div>
);

export default PharmacistShortCodeDisplay;
