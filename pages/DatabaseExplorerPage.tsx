import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import PageHeader from '../components/ui/PageHeader';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { PencilIcon, TrashIcon, CircleStackIcon } from '../constants';
import { apiMap } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { EquipmentStatus, Gender, LicenseStatus, AllocationStatus, MaintenanceStatus, UserRole } from '../types';
import { AppData } from '../contexts/DataContext';


type TableName = keyof ReturnType<typeof useData>['data'];

interface DatabaseExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableNames: TableName[];
    data: AppData;
}

const DatabaseExportModal: React.FC<DatabaseExportModalProps> = ({ isOpen, onClose, tableNames, data }) => {
    const [selectedTables, setSelectedTables] = useState<TableName[]>([]);
    const { addToast } = useToast();

    const handleToggleTable = (tableName: TableName) => {
        setSelectedTables(prev => 
            prev.includes(tableName) 
                ? prev.filter(t => t !== tableName) 
                : [...prev, tableName]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTables(tableNames);
        } else {
            setSelectedTables([]);
        }
    };
    
    const handleExport = () => {
        if (selectedTables.length === 0) {
            addToast('Vui lòng chọn ít nhất một bảng để xuất.', 'info');
            return;
        }

        const dataToExport: Partial<AppData> = {};
        for (const tableName of selectedTables) {
            dataToExport[tableName] = data[tableName];
        }

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        link.download = `database_export_${timestamp}.json`;
        link.click();
        
        addToast(`Đã xuất ${selectedTables.length} bảng thành công!`, 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xuất Toàn bộ Dữ liệu">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Chọn các bảng dữ liệu bạn muốn xuất. Dữ liệu sẽ được lưu dưới dạng một tệp JSON duy nhất.</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                    <label className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                            checked={selectedTables.length === tableNames.length && tableNames.length > 0}
                            onChange={handleSelectAll}
                        />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Chọn tất cả</span>
                    </label>
                    <div className="mt-2 space-y-2">
                        {tableNames.map(name => (
                            <label key={name} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                                    checked={selectedTables.includes(name)}
                                    onChange={() => handleToggleTable(name)}
                                />
                                <span className="text-gray-700 dark:text-gray-300">{name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleExport} disabled={selectedTables.length === 0} icon={CircleStackIcon}>
                        Xuất ({selectedTables.length}) bảng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


const DatabaseExplorerPage: React.FC = () => {
    const { data, isLoading, refetchData } = useData();
    const { addToast } = useToast();

    const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
    const [filterTerm, setFilterTerm] = useState('');
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [deletingItem, setDeletingItem] = useState<any | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);


    const tableNames = useMemo(() => (data ? Object.keys(data) as TableName[] : []), [data]);
    const tableData = useMemo(() => selectedTable && data ? (data[selectedTable] as any[]) : [], [selectedTable, data]);
    const filteredData = useMemo(() => {
        if (!filterTerm) return tableData;
        const lowerFilter = filterTerm.toLowerCase();
        return tableData.filter(row =>
            Object.values(row).some(value => String(value).toLowerCase().includes(lowerFilter))
        );
    }, [tableData, filterTerm]);

    const handleSave = async (updatedItem: any) => {
        if (!selectedTable || !editingItem) return;
        try {
            await apiMap[selectedTable].update(editingItem.id, updatedItem);
            addToast(`Bản ghi đã được cập nhật trong bảng '${selectedTable}'.`, 'success');
            await refetchData();
        } catch (error) {
            addToast(`Cập nhật thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
        } finally {
            setEditingItem(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTable || !deletingItem) return;
        try {
            await apiMap[selectedTable].remove(deletingItem.id);
            addToast(`Bản ghi đã được xóa khỏi bảng '${selectedTable}'.`, 'success');
            await refetchData();
        } catch (error) {
            addToast(`Xóa thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
        } finally {
            setDeletingItem(null);
        }
    };

    const columns = useMemo(() => {
        if (tableData.length === 0) return [];
        const allKeys = tableData.reduce<string[]>((keys, row) => {
            Object.keys(row).forEach(key => !keys.includes(key) && keys.push(key));
            return keys;
        }, []);

        return allKeys.map(key => ({
            header: key,
            accessor: (item: any) => {
                const value = item[key];
                if (typeof value === 'object' && value !== null) {
                    return <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded max-w-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
                }
                return String(value ?? '');
            }
        }));
    }, [tableData]);

    const renderActions = (item: any) => (
        <div className="flex space-x-2">
            <Button variant="secondary" icon={PencilIcon} className="text-xs px-2 py-1" onClick={() => setEditingItem(item)} />
            <Button variant="danger" icon={TrashIcon} className="text-xs px-2 py-1" onClick={() => setDeletingItem(item)} />
        </div>
    );

    if (isLoading) return <PageHeader title="Quản lý Dữ liệu" />;

    return (
        <div>
            <PageHeader title="Quản lý Dữ liệu">
                 <Button icon={CircleStackIcon} variant="secondary" onClick={() => setIsExportModalOpen(true)}>Xuất Cơ sở dữ liệu</Button>
            </PageHeader>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4 lg:w-1/5">
                     <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/5 shadow-lg overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200/50 dark:border-gray-700/50">Bảng dữ liệu</h3>
                        <div className="max-h-[65vh] overflow-y-auto">
                            {tableNames.map(name => (
                                <button key={name} onClick={() => { setSelectedTable(name); setFilterTerm(''); }}
                                    className={`w-full text-left p-3 text-sm font-medium border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 transition-colors ${selectedTable === name ? 'bg-primary-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-300'}`}>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="md:w-3/4 lg:w-4/5">
                    {selectedTable ? (
                         <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/5 shadow-lg overflow-hidden">
                             <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bảng: <span className="text-primary-500 dark:text-primary-400">{selectedTable}</span></h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredData.length} hàng / {tableData.length} tổng</p>
                                </div>
                                <input type="text" placeholder="Lọc dữ liệu..." value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}
                                    className="w-full sm:w-64 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div className="p-4">
                                {filteredData.length > 0 ? (
                                    <Table tableId={`db-explorer-${selectedTable}`} columns={columns} data={filteredData.map(d => ({ ...d, id: d.id ?? JSON.stringify(d) }))} renderActions={renderActions} />
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Không có dữ liệu.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-96 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">Vui lòng chọn một bảng để xem dữ liệu.</p>
                        </div>
                    )}
                </div>
            </div>
            {editingItem && (
                <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={`Chỉnh sửa bản ghi trong: ${selectedTable}`} size="2xl">
                    <GenericEditForm
                        item={editingItem}
                        onSave={handleSave}
                        onClose={() => setEditingItem(null)}
                        lookupData={data}
                        tableName={selectedTable}
                    />
                </Modal>
            )}
            {deletingItem && (
                <ConfirmationModal
                    isOpen={!!deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận Xóa"
                    variant="danger"
                >
                    Bạn có chắc chắn muốn xóa bản ghi này không? ID: <strong>{deletingItem.id}</strong>
                </ConfirmationModal>
            )}
            <DatabaseExportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                tableNames={tableNames} 
                data={data}
            />
        </div>
    );
};

interface GenericEditFormProps {
    item: any;
    onSave: (updatedItem: any) => void;
    onClose: () => void;
    lookupData: any;
    tableName: string | null;
}

const GenericEditForm: React.FC<GenericEditFormProps> = ({ item, onSave, onClose, lookupData, tableName }) => {
    const [formData, setFormData] = useState({ ...item });

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderInput = (key: string, value: any) => {
        const commonProps = {
            id: key,
            name: key,
            className: "w-full mt-1 px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md",
            disabled: key === 'id',
        };

        const enums: Record<string, any[]> = {
            status: {
                itEquipment: Object.values(EquipmentStatus),
                staff: ['Đang hoạt động', 'Đã nghỉ việc'],
                licenses: Object.values(LicenseStatus),
                allocations: Object.values(AllocationStatus),
                maintenance: Object.values(MaintenanceStatus),
            }[tableName || ''] || [],
            gender: Object.values(Gender),
            role: lookupData.roles.map((r: any) => r.name) || Object.values(UserRole),
            unit: lookupData.units.map((u: any) => u.name),
            assignedTo: ['', ...lookupData.staff.map((s: any) => s.fullName)],
            deviceType: lookupData.equipmentTypes.map((et: any) => et.name),
            maintenanceType: ['Sửa chữa', 'Nâng cấp', 'Bảo trì định kỳ'],
        };

        if (enums[key] && enums[key].length > 0) {
            return (
                <select {...commonProps} value={value ?? ''} onChange={e => handleChange(key, e.target.value)}>
                    {enums[key].map((option: string) => <option key={option} value={option}>{option}</option>)}
                </select>
            );
        }

        if (typeof value === 'boolean') {
            return <input {...commonProps} type="checkbox" checked={value} onChange={e => handleChange(key, e.target.checked)} className="h-5 w-5 rounded" />;
        }
        if (typeof value === 'number') {
            return <input {...commonProps} type="number" value={value} onChange={e => handleChange(key, Number(e.target.value))} />;
        }
        if (typeof value === 'string' && (key.toLowerCase().includes('date') || key.toLowerCase().includes('timestamp'))) {
            const dateValue = value.split(' ')[0]; // Handle timestamps
            return <input {...commonProps} type="date" value={dateValue} onChange={e => handleChange(key, e.target.value)} />;
        }
        
        return <input {...commonProps} type="text" value={value ?? ''} onChange={e => handleChange(key, e.target.value)} />;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {Object.entries(formData).map(([key, value]) => (
                (typeof value !== 'object' || value === null) && (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{key}</label>
                        {renderInput(key, value)}
                    </div>
                )
            ))}
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu thay đổi</Button>
            </div>
        </form>
    );
};

export default DatabaseExplorerPage;