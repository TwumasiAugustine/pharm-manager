import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

// Validation schema for search input
const searchSchema = z.object({
    query: z.string().trim(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

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
    // URL search management
    const { searchQuery, setSearchQuery, clearSearch } = useURLSearch({
        paramName: urlParamName,
        debounceMs,
        onSearchChange: onSearch,
    });

    // Use debounced search function for non-URL updates
    const debouncedSearch = useDebounceFunction(onSearch, debounceMs);

    const { watch, setValue } = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            query: enableURLSync ? searchQuery : initialValue,
        },
    });

    // Get the current query value
    const queryValue = watch('query');

    // Sync form with URL when URL changes
    useEffect(() => {
        if (enableURLSync && searchQuery !== queryValue) {
            setValue('query', searchQuery || '');
        }
    }, [searchQuery, setValue, enableURLSync, queryValue]);

    // Update form when initialValue changes (for non-URL mode)
    useEffect(() => {
        if (!enableURLSync) {
            setValue('query', initialValue || '');
        }
    }, [initialValue, setValue, enableURLSync]);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue('query', value); // Update form state
        debouncedSearch(value);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={queryValue || ''}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 pl-10 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value;
                            onSearch(value);
                        }
                    }}
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
                    onClick={() => {
                        if (queryValue) onSearch(queryValue);
                    }}
                >
                    Search
                </button>
            </div>
        </div>
    );
};
