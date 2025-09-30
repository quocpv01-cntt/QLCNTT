import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { globalApi } from '../services/api';
import { Staff, ITEquipment, EquipmentType, Manufacturer, Unit, License, Allocation, Maintenance, Transfer, UsageHistory, Role } from '../types';

export interface AppData {
    staff: Staff[];
    itEquipment: ITEquipment[];
    equipmentTypes: EquipmentType[];
    manufacturers: Manufacturer[];
    units: Unit[];
    licenses: License[];
    allocations: Allocation[];
    maintenance: Maintenance[];
    transfers: Transfer[];
    usageHistory: UsageHistory[];
    roles: Role[];
}

interface DataContextType {
    data: AppData;
    isLoading: boolean;
    error: string | null;
    refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allData = await globalApi.getAllData();
            setData(allData);
        } catch (err) {
            setError('Không thể tải dữ liệu toàn cục cho ứng dụng.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const value = {
        data: data!,
        isLoading,
        error,
        refetchData: fetchData,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-gray-900">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Đang tải dữ liệu hệ thống...</p>
                </div>
            </div>
        );
    }
    
    if (error || !data) {
         return (
            <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-gray-900 text-center">
                 <div>
                    <h2 className="text-xl font-bold text-red-500">Lỗi nghiêm trọng</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
                    <button onClick={fetchData} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Thử lại</button>
                 </div>
            </div>
        );
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};