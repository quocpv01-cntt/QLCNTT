import React, { useState, useEffect, useMemo, useRef } from 'react';

const SortAscIcon = () => (
    <svg className="w-4 h-4 inline-block ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);
const SortDescIcon = () => (
    <svg className="w-4 h-4 inline-block ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
const ViewColumnsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125a1.125 1.125 0 00-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);


interface SortConfig<T> {
  key: keyof T;
  direction: 'ascending' | 'descending';
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortKey?: keyof T;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  tableId: string; // Unique ID for storing settings in localStorage
  renderActions?: (item: T) => React.ReactNode;
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
  onSelectAll?: (areAllSelected: boolean) => void;
  onRowClick?: (item: T) => void;
  startIndex?: number;
  activeRowId?: string | null;
}

const Table = <T extends { id: string },>(
    { columns, data, tableId, renderActions, selectedItems, onSelectItem, onSelectAll, onRowClick, startIndex = 0, activeRowId }: TableProps<T>
) => {
    const isSelectionEnabled = !!selectedItems && !!onSelectItem && !!onSelectAll;
    const allVisibleSelected = data.length > 0 && data.every(item => selectedItems?.includes(item.id));

    const [sortConfig, setSortConfig] = useState<SortConfig<T>[] | null>(null);
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
        columns.reduce((acc, col) => ({ ...acc, [col.header]: true }), {})
    );
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const configRef = useRef<HTMLDivElement>(null);

    const storageKey = `table-config-${tableId}`;

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(storageKey);
            if (savedSettings) {
                const { savedSortConfig, savedColumnVisibility } = JSON.parse(savedSettings);
                if (savedSortConfig) setSortConfig(savedSortConfig);
                if (savedColumnVisibility) {
                     const initialVisibility = columns.reduce((acc, col) => ({
                        ...acc,
                        [col.header]: savedColumnVisibility[col.header] ?? true
                    }), {});
                    setColumnVisibility(initialVisibility);
                }
            }
        } catch (error) {
            console.error("Failed to load table settings from localStorage", error);
        }
    }, [tableId, columns, storageKey]);

    useEffect(() => {
        try {
            const settings = JSON.stringify({ savedSortConfig: sortConfig, savedColumnVisibility: columnVisibility });
            localStorage.setItem(storageKey, settings);
        } catch (error) {
             console.error("Failed to save table settings to localStorage", error);
        }
    }, [sortConfig, columnVisibility, storageKey]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (configRef.current && !configRef.current.contains(event.target as Node)) {
                setIsConfigOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSelectAll) {
            onSelectAll(e.target.checked);
        }
    };
    
    const requestSort = (key: keyof T, event: React.MouseEvent) => {
        const isShiftPressed = event.shiftKey;
        
        setSortConfig(prev => {
            const newConfig = isShiftPressed ? [...(prev || [])] : [];
            const existingIndex = newConfig.findIndex(c => c.key === key);

            if (existingIndex > -1) {
                const existing = newConfig[existingIndex];
                if (existing.direction === 'ascending') {
                    newConfig[existingIndex] = { ...existing, direction: 'descending' };
                } else {
                    newConfig.splice(existingIndex, 1);
                }
            } else {
                newConfig.push({ key, direction: 'ascending' });
            }
            
            return newConfig.length > 0 ? newConfig : null;
        });
    };
    
    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig && sortConfig.length > 0) {
            sortableItems.sort((a, b) => {
                for (const config of sortConfig) {
                    const valA = a[config.key];
                    const valB = b[config.key];
                    
                    let comparison = 0;
                    if (valA < valB) comparison = -1;
                    else if (valA > valB) comparison = 1;

                    if (comparison !== 0) {
                        return config.direction === 'ascending' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const visibleColumns = useMemo(() => columns.filter(col => columnVisibility[col.header]), [columns, columnVisibility]);
    const thClasses = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700";

    return (
        <div className="overflow-x-auto">
            <div className="relative">
                 <div className="absolute top-0 right-0 -mt-12 z-10" ref={configRef}>
                    <button
                        onClick={() => setIsConfigOpen(prev => !prev)}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Cấu hình cột"
                    >
                        <ViewColumnsIcon className="w-5 h-5" />
                    </button>
                    {isConfigOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200">Hiển thị Cột</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {columns.map(col => (
                                    <label key={col.header} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded"
                                            checked={columnVisibility[col.header]}
                                            onChange={(e) => setColumnVisibility(prev => ({...prev, [col.header]: e.target.checked}))}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{col.header}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <table className="min-w-full">
                    <thead className="hidden md:table-header-group">
                        <tr>
                            {isSelectionEnabled && (
                                <th scope="col" className={`${thClasses} px-6 py-3`}>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-500"
                                        checked={allVisibleSelected}
                                        onChange={handleSelectAllClick}
                                        aria-label="Chọn tất cả các mục"
                                    />
                                </th>
                            )}
                            <th scope="col" className={thClasses}>STT</th>
                            {visibleColumns.map((col, index) => {
                                const isSortable = col.sortKey;
                                const sortIndex = sortConfig?.findIndex(s => s.key === col.sortKey) ?? -1;
                                const isSorted = isSortable && sortIndex !== -1;
                                const direction = isSorted ? sortConfig![sortIndex].direction : null;

                                const headerContent = (
                                    <div className="flex items-center">
                                        {col.header}
                                        {isSorted && (
                                            <>
                                                {direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />}
                                                {sortConfig && sortConfig.length > 1 && (
                                                    <span className="ml-1.5 text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full h-4 w-4 flex items-center justify-center">
                                                        {sortIndex + 1}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );

                                return (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={thClasses}
                                        aria-sort={isSorted ? (direction === 'ascending' ? 'ascending' : 'descending') : undefined}
                                    >
                                        {isSortable ? (
                                            <button
                                                onClick={(e) => requestSort(col.sortKey!, e)}
                                                className="flex items-center uppercase font-medium"
                                                aria-label={`Sắp xếp theo ${col.header}${isSorted ? (direction === 'ascending' ? ', hiện đang sắp xếp tăng dần' : ', hiện đang sắp xếp giảm dần') : ''}`}
                                            >
                                                {headerContent}
                                            </button>
                                        ) : (
                                            headerContent
                                        )}
                                    </th>
                                );
                            })}
                            {renderActions && (
                                <th scope="col" className={`${thClasses} relative px-6 py-3`}>
                                    <span className="sr-only">Hành động</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-transparent">
                        {sortedData.map((item, index) => {
                            const isSelected = selectedItems?.includes(item.id);
                            const isActive = activeRowId === item.id;
                            return (
                                <tr
                                    key={item.id}
                                    className={`
                                        block md:table-row mb-4 border rounded-lg shadow-sm md:shadow-none md:border-none md:mb-0 
                                        transition-colors duration-150
                                        md:border-b md:border-gray-200 dark:md:border-gray-700
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${isActive
                                        ? 'bg-blue-500/10 dark:bg-blue-900/30'
                                        : isSelected
                                            ? 'bg-primary-500/10 dark:bg-primary-900/40'
                                            : 'hover:bg-black/5 dark:hover:bg-white/10'
                                        }
                                    `}
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {isSelectionEnabled && (
                                        <td className="px-6 py-3 block md:table-cell" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-500 dark:text-gray-400 md:hidden">Chọn</span>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-500"
                                                    checked={!!isSelected}
                                                    onChange={() => onSelectItem && onSelectItem(item.id)}
                                                    aria-label={`Chọn mục ${item.id}`}
                                                />
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 block md:table-cell">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-500 dark:text-gray-400 md:hidden">STT</span>
                                            <span>{startIndex + index + 1}</span>
                                        </div>
                                    </td>
                                    {visibleColumns.map((col, cIndex) => (
                                        <td key={cIndex} className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 block md:table-cell">
                                            <div className="flex justify-between items-center md:block">
                                                <span className="font-semibold text-gray-500 dark:text-gray-400 md:hidden">{col.header}</span>
                                                <div className="text-right md:text-left break-words">
                                                    {typeof col.accessor === 'function'
                                                        ? col.accessor(item)
                                                        : (item[col.accessor as keyof T] as React.ReactNode)}
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium block md:table-cell" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-end pt-2 md:pt-0">{renderActions(item)}</div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;