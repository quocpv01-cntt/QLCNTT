import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [message, onDismiss]);

    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" />,
        error: <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />,
        info: <InformationCircleIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
    };

    const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700";
    
    return (
        <div className={`${baseClasses} space-x-3 rtl:space-x-reverse`}>
            {icons[message.type]}
            <div className="text-sm font-normal">{message.message}</div>
            <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center h-8 w-8"
                onClick={() => onDismiss(message.id)}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 space-y-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};