import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
}

// Validation schema for search input
const searchSchema = z.object({
    query: z.string().trim(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

/**
 * Reusable search bar component with debounced input
 */
export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search...',
    className = '',
    initialValue = '',
    onFocus,
    onBlur,
}) => {
    // Timeout for debouncing
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);

    const { register, watch } = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            query: initialValue,
        },
    });

    // Get the current query value
    const queryValue = watch('query');

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Clear existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set new timeout to debounce search
        const timeout = setTimeout(() => {
            onSearch(value);
        }, 500); // 500ms debounce time

        setDebounceTimeout(timeout);
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [debounceTimeout]);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    {...register('query')}
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
