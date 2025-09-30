import React, { useState, useMemo, useEffect, useContext } from 'react';
import Table from '../components/ui/Table';
import PageHeader from '../components/ui/PageHeader';
import { ITEquipment, AuthContext, UserRole } from '../types';
import { useToast } from '../contexts/ToastContext';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { useData } from '../contexts/DataContext';
import ExportButton from '../components/ui/ExportButton';
import { ComputerDesktopIcon, GlobeAltIcon, CubeIcon } from '../constants';

const NETWORK_DEVICE_TYPES = ['Switch', 'Access Point', 'Router', 'Firewall'];

const getIconForEquipmentType = (typeName: string) => {
    const className = "w-5 h-5 text-gray-500 dark:text-gray-400";
    if (!typeName) return <CubeIcon className={className} />;
    const lowerTypeName = typeName.toLowerCase();
    if (['laptop', 'desktop', 'server', 'màn hình'].some(keyword => lowerTypeName.includes(keyword))) {
        return <ComputerDesktopIcon className={className} />;
    }
    if (['switch', 'access point', 'router', 'firewall'].some(keyword => lowerTypeName.includes(keyword))) {
        return <GlobeAltIcon className={className} />;
    }
    return <CubeIcon className={className} />;
};

const NetworkPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { data, isLoading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    const { addToast } = useToast();

    const networkDevices = useMemo(() => {
        if (isLoading || !data) return [];
        let devices = data.itEquipment.filter(item => NETWORK_DEVICE_TYPES.includes(item.deviceType));
        
        if ((user?.role === UserRole.UNIT_MANAGER || user?.role === UserRole.EMPLOYEE) && user.unit) {
            devices = devices.filter(e => e.unit === user.unit);
        }
        
        return devices;
    }, [data, isLoading, user]);

    const filteredDevices = useMemo(() => {
        if (!searchTerm) return networkDevices;
        return networkDevices.filter(item =>
            item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.assetTag.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [networkDevices, searchTerm]);
    
     const handleSelectItem = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const handleSelectAll = (areAllSelected: boolean) => {
        if (areAllSelected) {
            setSelectedItems(filteredDevices.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };
    
    const columns = [
        { header: 'Tem thiết bị', accessor: 'assetTag' as keyof ITEquipment, sortKey: 'assetTag' as keyof ITEquipment },
        { header: 'Tên thiết bị', accessor: 'deviceName' as keyof ITEquipment, sortKey: 'deviceName' as keyof ITEquipment },
        { 
            header: 'Loại', 
            accessor: (item: ITEquipment) => (
                <div className="flex items-center gap-2">
                    {getIconForEquipmentType(item.deviceType)}
                    <span>{item.deviceType}</span>
                </div>
            ),
            sortKey: 'deviceType' as keyof ITEquipment 
        },
        { header: 'Địa chỉ IP', accessor: 'ipAddress' as keyof ITEquipment, sortKey: 'ipAddress' as keyof ITEquipment },
        { header: 'Trạng thái', accessor: 'status' as keyof ITEquipment, sortKey: 'status' as keyof ITEquipment },
        { header: 'Đơn vị', accessor: 'unit' as keyof ITEquipment, sortKey: 'unit' as keyof ITEquipment },
        { header: 'Nhà sản xuất', accessor: 'supplier' as keyof ITEquipment, sortKey: 'supplier' as keyof ITEquipment },
    ];
    
    if (isLoading) return <div>Đang tải...</div>;
    
    return (
        <div>
            <PageHeader title="Thiết bị Mạng">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80 px-4 py-2 pl-10 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Tìm kiếm thiết bị mạng"
                    />
                     <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                 <ExportButton
                    filteredData={filteredDevices}
                    allData={networkDevices}
                    fileName="danh_sach_thiet_bi_mang"
                />
            </PageHeader>
            {user?.role !== UserRole.UNIT_MANAGER && (
                <BulkActionsBar 
                    selectedCount={selectedItems.length} 
                    onClearSelection={() => setSelectedItems([])}
                />
            )}
            <Table 
                tableId="network-devices-list"
                columns={columns} 
                data={filteredDevices} 
                selectedItems={selectedItems} 
                onSelectItem={handleSelectItem} 
                onSelectAll={handleSelectAll} 
            />
        </div>
    );
};

export default NetworkPage;