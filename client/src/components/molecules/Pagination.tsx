import React from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
} from 'react-icons/fa';

/**
 * Props for Pagination component
 */
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    showInfo?: boolean;
    totalItems?: number;
    itemsPerPage?: number;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable pagination component for navigating through pages of data
 */
export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    showInfo = true,
    totalItems,
    itemsPerPage,
    size = 'md',
}) => {
    // Size-based styling
    const sizeClasses = {
        sm: {
            button: 'px-2 py-1 text-xs',
            icon: 'h-3 w-3',
            nav: 'text-xs',
        },
        md: {
            button: 'px-3 py-2 text-sm',
            icon: 'h-4 w-4',
            nav: 'text-sm',
        },
        lg: {
            button: 'px-4 py-3 text-base',
            icon: 'h-5 w-5',
            nav: 'text-base',
        },
    };

    const currentSizeClasses = sizeClasses[size];
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = size === 'sm' ? 3 : size === 'lg' ? 7 : 5;

        // Calculate the range of pages to show
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    // Calculate pagination info
    const getPaginationInfo = () => {
        if (!totalItems || !itemsPerPage) return null;

        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        return { startItem, endItem };
    };

    const paginationInfo = getPaginationInfo();

    // If there's only one page, don't show pagination
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 ${className}`}
        >
            {/* Pagination Info */}
            {showInfo && paginationInfo && (
                <div
                    className={`text-gray-600 font-medium ${currentSizeClasses.nav}`}
                >
                    Showing{' '}
                    <span className="text-gray-900 font-semibold">
                        {paginationInfo.startItem}
                    </span>{' '}
                    to{' '}
                    <span className="text-gray-900 font-semibold">
                        {paginationInfo.endItem}
                    </span>{' '}
                    of{' '}
                    <span className="text-gray-900 font-semibold">
                        {totalItems}
                    </span>{' '}
                    results
                </div>
            )}

            {/* Navigation */}
            <nav
                className="flex items-center space-x-1"
                aria-label="Pagination Navigation"
                role="navigation"
            >
                {/* First page button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`${
                        currentSizeClasses.button
                    } rounded-lg border transition-all duration-200 ${
                        currentPage === 1
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    }`}
                    aria-label="Go to first page"
                    title="First page"
                >
                    <FaAngleDoubleLeft className={currentSizeClasses.icon} />
                </button>

                {/* Previous page button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${
                        currentSizeClasses.button
                    } rounded-lg border transition-all duration-200 ${
                        currentPage === 1
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    }`}
                    aria-label="Go to previous page"
                    title="Previous page"
                >
                    <FaChevronLeft className={currentSizeClasses.icon} />
                </button>

                {/* First page if not in the visible range */}
                {getPageNumbers()[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className={`${currentSizeClasses.button} rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200`}
                            aria-label="Go to page 1"
                        >
                            1
                        </button>
                        {getPageNumbers()[0] > 2 && (
                            <span
                                className={`${currentSizeClasses.button} text-gray-500 font-medium select-none`}
                            >
                                ...
                            </span>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`${
                            currentSizeClasses.button
                        } rounded-lg border font-medium transition-all duration-200 ${
                            currentPage === page
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}

                {/* Last page if not in the visible range */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                        {getPageNumbers()[getPageNumbers().length - 1] <
                            totalPages - 1 && (
                            <span
                                className={`${currentSizeClasses.button} text-gray-500 font-medium select-none`}
                            >
                                ...
                            </span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className={`${currentSizeClasses.button} rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200`}
                            aria-label={`Go to page ${totalPages}`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next page button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${
                        currentSizeClasses.button
                    } rounded-lg border transition-all duration-200 ${
                        currentPage === totalPages
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    }`}
                    aria-label="Go to next page"
                    title="Next page"
                >
                    <FaChevronRight className={currentSizeClasses.icon} />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`${
                        currentSizeClasses.button
                    } rounded-lg border transition-all duration-200 ${
                        currentPage === totalPages
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    }`}
                    aria-label="Go to last page"
                    title="Last page"
                >
                    <FaAngleDoubleRight className={currentSizeClasses.icon} />
                </button>
            </nav>

            {/* Quick page jump for large datasets */}
            {totalPages > 10 && (
                <div className="flex items-center space-x-2">
                    <span className={`text-gray-600 ${currentSizeClasses.nav}`}>
                        Go to:
                    </span>
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        className={`w-16 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${currentSizeClasses.button}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const value = parseInt(
                                    (e.target as HTMLInputElement).value,
                                );
                                if (value >= 1 && value <= totalPages) {
                                    onPageChange(value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                        placeholder={currentPage.toString()}
                        aria-label="Jump to page number"
                    />
                </div>
            )}
        </div>
    );
};
