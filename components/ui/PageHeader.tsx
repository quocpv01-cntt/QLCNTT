import React from 'react';

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 gap-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {children && <div className="flex items-center gap-2 sm:gap-4 flex-wrap self-start sm:self-center">{children}</div>}
        </div>
    );
};

export default PageHeader;
