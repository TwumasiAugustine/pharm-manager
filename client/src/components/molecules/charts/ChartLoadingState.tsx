import React from 'react';

export const ChartLoadingState: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading chart...</p>
            </div>
        </div>
    );
};
