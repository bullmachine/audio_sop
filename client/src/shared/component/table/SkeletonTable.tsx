import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonTableProps {
    columnsCount: number;
    rows?: number;
}

const randomWidth = (min = 40, max = 90) => `${Math.floor(Math.random() * (max - min + 1)) + min}%`;

const SkeletonTable: React.FC<SkeletonTableProps> = ({ columnsCount, rows = 8 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={`sk-row-${rowIdx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    {Array.from({ length: columnsCount }).map((__, colIdx) => (
                        <td key={`sk-cell-${rowIdx}-${colIdx}`} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Skeleton width={randomWidth()} height={14} />
                            </div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default SkeletonTable;
