// components/ui/BulkActionsBar.tsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children?: React.ReactNode;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ selectedCount, onClearSelection, children }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 mb-4 bg-primary-50 dark:bg-gray-800 border border-primary-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">
          Đã chọn {selectedCount} mục
        </span>
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
      <button
        onClick={onClearSelection}
        className="p-1.5 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-gray-700 rounded-full"
        aria-label="Bỏ chọn tất cả"
        title="Bỏ chọn tất cả"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default BulkActionsBar;