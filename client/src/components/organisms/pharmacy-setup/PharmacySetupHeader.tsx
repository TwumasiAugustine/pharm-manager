import React from 'react';

export const PharmacySetupHeader: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 sm:p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Pharmacy Setup & Configuration
            </h1>
            <p className="text-sm sm:text-base text-blue-100">
                Configure your pharmacy information and system settings
            </p>
        </div>
    );
};
