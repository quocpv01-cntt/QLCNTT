import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/ui/Table';
import PageHeader from '../components/ui/PageHeader';
import { UsageHistory } from '../types';
import { usageHistoryApi } from '../services/api';
import ExportButton from '../components/ui/ExportButton';

const UsageHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<UsageHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await usageHistoryApi.getAll();
                setHistory(data);
            } catch (err) {
                setError('Không thể tải lịch sử sử dụng.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredHistory = useMemo(() => {
        if (!searchTerm) return history;
        return history.filter(item =>
            item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    const columns = [
        { header: 'Thời gian', accessor: 'timestamp' as keyof UsageHistory },
        { header: 'Người dùng', accessor: 'user' as keyof UsageHistory },
        { header: 'Hành động', accessor: 'action' as keyof UsageHistory },
        { header: 'Tài sản', accessor: 'asset' as keyof UsageHistory },
        { header: 'Chi tiết', accessor: 'details' as keyof UsageHistory },
    ];
    
    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <PageHeader title="Lịch sử sử dụng">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lịch sử..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80 px-4 py-2 pl-10 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Tìm kiếm lịch sử sử dụng"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                 <ExportButton
                    filteredData={filteredHistory}
                    allData={history}
                    fileName="lich_su_su_dung"
                />
            </PageHeader>
            <Table tableId="usage-history-list" columns={columns} data={filteredHistory} />
        </div>
    );
};

export default UsageHistoryPage;