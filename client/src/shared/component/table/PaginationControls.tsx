import React, { useState } from 'react';

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, totalPages, onPageChange }) => {
    const [gotoValue, setGotoValue] = useState<string>(String(page));

    const handleGoto = () => {
        const n = Number(gotoValue);
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(totalPages, Math.max(1, Math.floor(n)));
        onPageChange(clamped);
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            {/* First button */}
            <button
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                className="inline-flex items-center px-2 py-1 border rounded text-xs text-gray-300  cursor-pointer"
                aria-label="First page"
            >
                «
            </button>
            
            {/* Page info */}
            <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">Page {page} of {totalPages}</div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center px-2 py-1 border rounded text-xs text-gray-300 cursor-pointer"
                    aria-label="Previous page"
                >
                    ‹
                </button>
                
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={gotoValue}
                    onChange={(e) => setGotoValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGoto(); }}
                    className="w-16 px-2 py-1 border rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
                />
                
                <button
                    onClick={handleGoto}
                    className="px-2 py-1 border rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
                >
                    Go
                </button>
                
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center px-2 py-1 border rounded text-xs text-gray-300 cursor-pointer"
                    aria-label="Next page"
                >
                    ›
                </button>
                
                {/* Last button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages}
                    className="inline-flex items-center px-2 py-1 border rounded text-xs text-gray-300 cursor-pointer"
                    aria-label="Last page"
                >
                    »
                </button>
            </div>
        </div>
    );
};

export default PaginationControls;
