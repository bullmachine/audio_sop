import React, { useMemo, useState } from 'react';
import SkeletonTable from './SkeletonTable';

interface Column<T> {
    label: string;
    key: keyof T | string;
    render?: (item: T, index: number) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    skeletonRowCount?: number;
    rowKey: keyof T;
}

function DataTable<T extends { _id: string }>({
    columns,
    data,
    loading,
    skeletonRowCount = 8,
    rowKey,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredData = useMemo(() => {
        if (!loading && data.length === 0) return [];
        return data;
    }, [loading, data]);

    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortKey, sortOrder]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize tracking-wider border-r border-gray-200 dark:border-gray-700 ${col.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors' : ''}`}
                                    onClick={() => col.sortable && handleSort(col.key as string)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.label}</span>
                                        {col.sortable && (
                                            <div className="flex flex-col">
                                                <svg
                                                    className={`w-3 h-3 ${sortKey === col.key && sortOrder === 'asc' ? 'text-blue-500' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414 1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                                <svg
                                                    className={`w-3 h-3 ${sortKey === col.key && sortOrder === 'desc' ? 'text-blue-500' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <SkeletonTable columnsCount={columns.length} rows={skeletonRowCount} />
                        ) : (
                            sortedData.map((item, index) => (
                                <tr key={`${item[rowKey]}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                            {col.render ? col.render(item, index) : (item as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
