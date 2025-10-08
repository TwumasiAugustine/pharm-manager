import React from 'react';
import { FiBarChart } from 'react-icons/fi';

export const ChartEmptyState: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-64 sm:h-80 md:h-96 bg-gray-50 rounded-lg">
            <div className="text-center px-4">
                <FiBarChart className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No data to display
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                    No data available for the selected filters
                </p>
            </div>
        </div>
    );
};
