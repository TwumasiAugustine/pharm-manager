import React from 'react';

/**
 * Props for Pagination component
 */
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

/**
 * Reusable pagination component for navigating through pages of data
 */
export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Show at most 5 page numbers

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

    // If there's only one page, don't show pagination
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex justify-center mt-4 ${className}`}>
            <nav
                className="inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
            >
                {/* Previous page button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                        currentPage === 1
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <span className="sr-only">Previous</span>
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {/* First page if not in the visible range */}
                {getPageNumbers()[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            1
                        </button>
                        {getPageNumbers()[0] > 2 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Last page if not in the visible range */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                        {getPageNumbers()[getPageNumbers().length - 1] <
                            totalPages - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                            </span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next page button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                        currentPage === totalPages
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <span className="sr-only">Next</span>
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </nav>
        </div>
    );
};
