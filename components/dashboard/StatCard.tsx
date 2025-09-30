import React from 'react';
import { StatCardData } from '../../types';

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);


const StatCard: React.FC<StatCardData> = ({ title, value, icon: Icon, change, changeType }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

    return (
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 border border-white/10 dark:border-white/5 shadow-lg">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
            </div>
            <div className="mt-4 flex items-baseline">
                <div className={`flex items-center text-sm font-semibold ${changeColor}`}>
                    {isIncrease ? <ArrowUpIcon/> : <ArrowDownIcon/>}
                    <span className="ml-1">{change}</span>
                </div>
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">so với tháng trước</p>
            </div>
        </div>
    );
};

export default StatCard;