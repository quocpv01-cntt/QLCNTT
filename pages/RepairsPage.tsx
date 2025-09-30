import React, { useMemo, useState, useEffect, useContext } from 'react';
import Table from '../components/ui/Table';
import PageHeader from '../components/ui/PageHeader';
import { Maintenance, MaintenanceStatus, ITEquipment, Unit, AuthContext, UserRole } from '../types';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { maintenanceApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import AnimatedCheckbox from '../components/ui/AnimatedCheckbox';
import ExportButton from '../components/ui/ExportButton';

const RepairsPage: React.FC = () => {
    const { data, isLoading, refetchData } = useData();
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { canAdd, canEdit, canDelete } = usePermissions('repairs');
    const { addToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Maintenance> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Maintenance | null>(null);
    const [equipmentList, setEquipmentList] = useState<ITEquipment[]>([]);
    const [unitsList, setUnitsList] = useState<Unit[]>([]);

    useEffect(() => {
        if (data) {
            setEquipmentList(data.itEquipment);
            setUnitsList(data.units);
        }
    }, [data]);

    const repairTasks = useMemo(() => {
        if (isLoading || !data || !user) return [];
        
        const allRepairTasks = data.maintenance.filter(task => task.maintenanceType === 'Sửa chữa');
        
        // Lọc theo đơn vị của người dùng cho vai trò EMPLOYEE và UNIT_MANAGER
        if ((user.role === UserRole.EMPLOYEE || user.role === UserRole.UNIT_MANAGER) && user.unit) {
            return allRepairTasks.filter(task => task.unit === user.unit);
        }
        
        // Quản trị viên thấy tất cả các yêu cầu sửa chữa
        return allRepairTasks;
    }, [data, isLoading, user]);

    const handleOpenModal = (item?: Maintenance) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Maintenance>) => {
        const isEditing = !!itemToSave.id;
        const payload = {
            ...itemToSave,
            maintenanceType: 'Sửa chữa',
        } as Omit<Maintenance, 'id'>;

        try {
            if (isEditing) {
                await maintenanceApi.update(itemToSave.id!, payload);
            } else {
                await maintenanceApi.add(payload);
            }
            addToast(isEditing ? 'Cập nhật yêu cầu thành công!' : 'Thêm yêu cầu thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };

    const handleRequestDelete = (item: Maintenance) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await maintenanceApi.remove(itemToDelete.id);
            addToast('Xóa yêu cầu thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    
    const handleStatusChange = async (item: Maintenance, isCompleted: boolean) => {
        if (item.status === MaintenanceStatus.CANCELLED) {
            addToast('Không thể thay đổi trạng thái của yêu cầu đã bị hủy.', 'info');
            return;
        }
        const newStatus = isCompleted ? MaintenanceStatus.COMPLETED : MaintenanceStatus.IN_PROGRESS;
        try {
            await maintenanceApi.update(item.id, { status: newStatus });
            addToast(`Trạng thái sửa chữa đã được cập nhật.`, 'success');
            await refetchData();
        } catch (error) {
            addToast('Cập nhật trạng thái thất bại!', 'error');
        }
    };

    const getStatusBadge = (status: MaintenanceStatus) => {
        const statusClasses: Record<MaintenanceStatus, string> = {
            [MaintenanceStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            [MaintenanceStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            [MaintenanceStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            [MaintenanceStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return <span className={`${baseClass} ${statusClasses[status] || ''}`}>{status}</span>;
    };

    const columns = [
        {
            header: 'Hoàn thành',
            accessor: (item: Maintenance) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <AnimatedCheckbox
                        id={`repair-${item.id}`}
                        checked={item.status === MaintenanceStatus.COMPLETED}
                        onChange={(isChecked) => handleStatusChange(item, isChecked)}
                        disabled={item.status === MaintenanceStatus.CANCELLED}
                    />
                </div>
            )
        },
        { header: 'Tên tài sản', accessor: 'assetName' as keyof Maintenance },
        { header: 'Ghi chú', accessor: 'notes' as keyof Maintenance },
        { header: 'Đơn vị', accessor: 'unit' as keyof Maintenance },
        { header: 'Ngày bắt đầu', accessor: 'startDate' as keyof Maintenance },
        { header: 'Ngày kết thúc', accessor: 'endDate' as keyof Maintenance },
        { header: 'Trạng thái', accessor: (item: Maintenance) => getStatusBadge(item.status) },
    ];

    const renderActions = (item: Maintenance) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenModal(item)}>Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleRequestDelete(item)}>Xóa</Button>}
            </div>
        );
    };
    
    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div>
            <PageHeader title="Yêu cầu Sửa chữa">
                 <ExportButton
                    filteredData={repairTasks}
                    allData={repairTasks}
                    fileName="danh_sach_yeu_cau_sua_chua"
                />
                {canAdd && <Button onClick={() => handleOpenModal()}>Tạo Yêu cầu</Button>}
            </PageHeader>
            <Table 
                tableId="repairs-list" 
                columns={columns} 
                data={repairTasks} 
                renderActions={canEdit || canDelete ? renderActions : undefined} 
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa Yêu cầu Sửa chữa' : 'Tạo Yêu cầu Sửa chữa Mới'}>
                <RepairForm 
                    currentItem={currentItem} 
                    onSave={handleSave} 
                    onClose={handleCloseModal} 
                    equipmentList={equipmentList} 
                    unitsList={unitsList}
                />
            </Modal>
            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
                title="Xác nhận Xóa Yêu cầu"
            >
                Bạn có chắc chắn muốn xóa yêu cầu sửa chữa cho "<strong>{itemToDelete?.assetName}</strong>"?
            </ConfirmationModal>
        </div>
    );
};

// Form component for repair requests
const RepairForm: React.FC<{ 
    currentItem: Partial<Maintenance> | null; 
    onSave: (item: Partial<Maintenance>) => void; 
    onClose: () => void; 
    equipmentList: ITEquipment[];
    unitsList: Unit[];
}> = ({ currentItem, onSave, onClose, equipmentList, unitsList }) => {
    const [formState, setFormState] = useState(currentItem || {});
    
    useEffect(() => {
        if (formState.assetName) {
            const selectedEquipment = equipmentList.find(e => e.deviceName === formState.assetName);
            if (selectedEquipment && selectedEquipment.unit && formState.unit !== selectedEquipment.unit) {
                setFormState(prev => ({ ...prev, unit: selectedEquipment.unit }));
            }
        }
    }, [formState.assetName, equipmentList, formState.unit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formState); };
    const inputClass = "w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className={labelClass}>Tài sản</label>
                <select name="assetName" value={formState.assetName || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn tài sản --</option>
                    {equipmentList.map(e => <option key={e.id} value={e.deviceName}>{e.deviceName} ({e.assetTag})</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Ghi chú (Mô tả lỗi)</label>
                <textarea name="notes" value={formState.notes || ''} onChange={handleChange} className={inputClass} rows={3} required></textarea>
             </div>
             <div>
                <label className={labelClass}>Đơn vị</label>
                 <select name="unit" value={formState.unit || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn đơn vị --</option>
                    {unitsList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
             </div>
            <div>
                <label className={labelClass}>Ngày bắt đầu (Dự kiến)</label>
                <input type="date" name="startDate" value={formState.startDate || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Ngày kết thúc (Dự kiến)</label>
                <input type="date" name="endDate" value={formState.endDate || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
                <label className={labelClass}>Trạng thái</label>
                <select name="status" value={formState.status || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn trạng thái --</option>
                    {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default RepairsPage;