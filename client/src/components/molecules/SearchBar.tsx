import React, { useEffect, useState } from 'react';
import { useDebounceFunction } from '../../hooks/useDebounceFunction';
import { useURLSearch } from '../../hooks/useURLSearch';

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
    initialValue?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    // URL-related props
    urlParamName?: string;
    enableURLSync?: boolean;
    debounceMs?: number;
}

/**
 * Reusable search bar component with debounced input and URL synchronization
 */
export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search...',
    className = '',
    initialValue = '',
    onFocus,
    onBlur,
    urlParamName = 'search',
    enableURLSync = true,
    debounceMs = 500,
}) => {
    // Local state for immediate UI updates
    const [inputValue, setInputValue] = useState('');

    // URL search management (only when enabled)
    const { searchQuery, setSearchQuery } = useURLSearch({
        paramName: urlParamName,
        debounceMs,
        onSearchChange: onSearch,
    });

    // Debounced search for non-URL mode
    const debouncedSearch = useDebounceFunction(onSearch, debounceMs);

    // Initialize input value
    useEffect(() => {
        if (enableURLSync) {
            setInputValue(searchQuery || '');
        } else {
            setInputValue(initialValue || '');
        }
    }, [enableURLSync, searchQuery, initialValue]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Update local state immediately for responsive UI
        setInputValue(value);

        // Handle search based on mode
        if (enableURLSync) {
            setSearchQuery(value);
        } else {
            debouncedSearch(value);
        }
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (enableURLSync) {
                setSearchQuery(inputValue);
            } else {
                onSearch(inputValue);
            }
        }
    };

    // Handle search button click
    const handleSearchClick = () => {
        if (inputValue) {
            if (enableURLSync) {
                setSearchQuery(inputValue);
            } else {
                onSearch(inputValue);
            }
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 pl-10 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                    </svg>
                </div>
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-blue-600 bg-transparent rounded-r-md hover:text-blue-800"
                    onClick={handleSearchClick}
                >
                    Search
                </button>
            </div>
        </div>
    );
};
