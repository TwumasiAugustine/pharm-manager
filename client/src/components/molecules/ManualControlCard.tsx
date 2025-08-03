import React, { useState } from 'react';
import { FaPlay, FaExclamationTriangle, FaInfo } from 'react-icons/fa';

interface ManualControlCardProps {
    title: string;
    description: string;
    note?: string;
    onTrigger: (daysToKeep?: number) => void;
    isLoading: boolean;
    requiresInput?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    defaultValue?: number;
}

const ManualControlCard: React.FC<ManualControlCardProps> = ({
    title,
    description,
    note,
    onTrigger,
    isLoading,
    requiresInput = true,
    inputLabel = 'Days to keep',
    inputPlaceholder = 'Enter number of days',
    defaultValue = 1,
}) => {
    const [inputValue, setInputValue] = useState<number>(defaultValue);

    const handleTrigger = () => {
        if (requiresInput) {
            onTrigger(inputValue);
        } else {
            onTrigger();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <div className="flex items-start text-sm text-gray-700 mb-3">
                        <FaInfo className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <p className="leading-relaxed">{description}</p>
                    </div>

                    {note && (
                        <div className="flex items-start text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                            <FaExclamationTriangle className="mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                            <p className="leading-relaxed">{note}</p>
                        </div>
                    )}

                    {requiresInput && (
                        <div className="mb-4">
                            <label
                                htmlFor={`${title
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')}-input`}
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {inputLabel}
                            </label>
                            <input
                                id={`${title
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')}-input`}
                                type="number"
                                min="1"
                                max="365"
                                value={inputValue}
                                onChange={(e) =>
                                    setInputValue(Number(e.target.value))
                                }
                                placeholder={inputPlaceholder}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleTrigger}
                    disabled={
                        isLoading ||
                        (requiresInput && (!inputValue || inputValue < 1))
                    }
                    className={`
                        flex items-center px-4 py-2 rounded-md text-sm font-medium
                        transition-colors duration-200
                        ${
                            isLoading ||
                            (requiresInput && (!inputValue || inputValue < 1))
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                        }
                    `}
                >
                    <FaPlay
                        className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    {isLoading ? 'Executing...' : 'Execute Manual Task'}
                </button>
            </div>
        </div>
    );
};

export default ManualControlCard;
