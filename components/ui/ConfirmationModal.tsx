import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmButtonText?: string;
  isConfirming?: boolean;
  variant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmButtonText = 'Xác nhận',
  isConfirming = false,
  variant = 'danger',
}) => {
  const isDanger = variant === 'danger';
  
  const Icon = isDanger ? ExclamationTriangleIcon : QuestionMarkCircleIcon;
  const iconContainerClasses = isDanger 
    ? "bg-red-100 dark:bg-red-900/50" 
    : "bg-blue-100 dark:bg-blue-900/50";
  const iconClasses = isDanger 
    ? "text-red-600 dark:text-red-400" 
    : "text-blue-600 dark:text-blue-400";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconContainerClasses} sm:mx-0 sm:h-10 sm:w-10`}>
          <Icon className={`h-6 w-6 ${iconClasses}`} aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
           <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {children}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button variant={variant} onClick={onConfirm} isSubmitting={isConfirming} className="w-full sm:w-auto sm:ml-3">
          {confirmButtonText}
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={isConfirming} className="mt-3 w-full sm:w-auto sm:mt-0">
          Hủy
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;