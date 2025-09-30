import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLastPageNext?: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, onLastPageNext }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const pagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (endPage - startPage + 1 < pagesToShow) {
        startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
            pageNumbers.push('...');
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }

    const baseButtonClass = "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white";
    const activeClass = "z-10 text-primary-600 dark:text-primary-400 border-primary-500 bg-primary-50 dark:bg-gray-700";
    const disabledClass = "opacity-50 cursor-not-allowed";

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        } else if (onLastPageNext) {
            onLastPageNext();
        }
    };

    return (
        <nav aria-label="Page navigation">
            <ul className="inline-flex -space-x-px text-sm">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${baseButtonClass} rounded-l-lg ${currentPage === 1 ? disabledClass : ''}`}
                        aria-label="Previous Page"
                    >
                        Trước
                    </button>
                </li>
                {pageNumbers.map((page, index) => (
                    <li key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`${baseButtonClass} ${currentPage === page ? activeClass : ''}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className={baseButtonClass}>{page}</span>
                        )}
                    </li>
                ))}
                <li>
                    <button
                        onClick={handleNextClick}
                        className={`${baseButtonClass} rounded-r-lg ${currentPage === totalPages ? disabledClass : ''}`}
                        aria-label="Next Page"
                    >
                        Sau
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;