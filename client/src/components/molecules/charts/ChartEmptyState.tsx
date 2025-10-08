import React from 'react';
import { FiBarChart } from 'react-icons/fi';

interface ChartEmptyStateProps {
    message?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
    message = 'No data available for the selected filters',
}) => {
    return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
                <FiBarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No data to display
                </h3>
                <p className="text-gray-500">{message}</p>
            </div>
        </div>
    );
};
