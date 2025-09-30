import React, { useState, useEffect, useMemo } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Allocation, AllocationStatus, Staff, ITEquipment } from '../types';
import { allocationsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import Pagination from '../components/ui/Pagination';
import DatePicker from '../components/ui/DatePicker';

const AllocationPage: React.FC = () => {
    const { data, refetchData } = useData();
    const { canAdd, canEdit, canDelete } = usePermissions('allocation');
    const [allocations, setAllocations] = useState<Allocation[]>(data.allocations);
    const [staff, setStaff] = useState<Staff[]>(data.staff);
    const [equipment, setEquipment] = useState<ITEquipment[]>(data.itEquipment.filter(e => e.status === 'Sẵn sàng'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Allocation> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Allocation | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { addToast } = useToast();

    useEffect(() => {
        setAllocations(data.allocations);
        setStaff(data.staff);
        setEquipment(data.itEquipment.filter(e => e.status === 'Sẵn sàng'));
    }, [data]);


    const handleOpenModal = (item?: Allocation) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Allocation>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await allocationsApi.update(itemToSave.id!, itemToSave);
            } else {
                await allocationsApi.add(itemToSave as Omit<Allocation, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };

    const handleRequestDelete = (item: Allocation) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await allocationsApi.remove(itemToDelete.id);
            addToast('Xóa thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    
    const totalPages = useMemo(() => Math.ceil(allocations.length / itemsPerPage), [allocations.length]);
    const paginatedAllocations = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allocations.slice(startIndex, startIndex + itemsPerPage);
    }, [allocations, currentPage]);

    const getStatusBadge = (status: AllocationStatus) => {
        const statusClasses: Record<AllocationStatus, string> = {
            [AllocationStatus.ALLOCATED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            [AllocationStatus.RETURNED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            [AllocationStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            [AllocationStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return <span className={`${baseClass} ${statusClasses[status] || ''}`}>{status}</span>;
    };

    const columns = [
        { header: 'Tên tài sản', accessor: 'assetName' as keyof Allocation },
        { header: 'Cán bộ', accessor: 'staffName' as keyof Allocation },
        { header: 'Ngày cấp phát', accessor: 'allocationDate' as keyof Allocation, sortKey: 'allocationDate' as keyof Allocation },
        { header: 'Ngày thu hồi', accessor: 'returnDate' as keyof Allocation, sortKey: 'returnDate' as keyof Allocation },
        { header: 'Trạng thái', accessor: (item: Allocation) => getStatusBadge(item.status) },
    ];
    
    const renderActions = (item: Allocation) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenModal(item)} title="Sửa mục cấp phát này">Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleRequestDelete(item)} title="Xóa mục cấp phát này">Xóa</Button>}
            </div>
        );
    };

    return (
        <div>
            <PageHeader title="Lịch sử Cấp phát">
                 <ExportButton
                    filteredData={allocations}
                    allData={allocations}
                    fileName="lich_su_cap_phat"
                />
                {canAdd && <Button onClick={() => handleOpenModal()} title="Tạo một mục cấp phát mới">Cấp phát mới</Button>}
            </PageHeader>
            <Table 
                tableId="allocations-list" 
                columns={columns} 
                data={paginatedAllocations} 
                renderActions={canEdit || canDelete ? renderActions : undefined} 
                startIndex={(currentPage - 1) * itemsPerPage}
            />
            <div className="mt-6 flex justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin' : 'Cấp phát tài sản'}>
                <AllocationForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} staffList={staff} equipmentList={equipment} />
            </Modal>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa">
                Bạn có chắc chắn muốn xóa mục cấp phát tài sản "<strong>{itemToDelete?.assetName}</strong>" cho cán bộ "<strong>{itemToDelete?.staffName}</strong>"?
            </ConfirmationModal>
        </div>
    );
};

const AllocationForm: React.FC<{ currentItem: Partial<Allocation> | null; onSave: (item: Partial<Allocation>) => void; onClose: () => void; staffList: Staff[], equipmentList: ITEquipment[] }> = ({ currentItem, onSave, onClose, staffList, equipmentList }) => {
    const [formState, setFormState] = useState(currentItem || {});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                <label className={labelClass}>Cán bộ</label>
                <select name="staffName" value={formState.staffName || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn cán bộ --</option>
                    {staffList.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Ngày cấp phát</label>
                <DatePicker value={formState.allocationDate || ''} onChange={(date) => setFormState(prev => ({...prev, allocationDate: date}))} />
            </div>
             <div>
                <label className={labelClass}>Trạng thái</label>
                <select name="status" value={formState.status || ''} onChange={handleChange} className={inputClass} required>
                    {Object.values(AllocationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} title="Hủy bỏ và đóng cửa sổ">Hủy</Button>
                <Button type="submit" title="Lưu thông tin đã nhập">Lưu</Button>
            </div>
        </form>
    );
};

export default AllocationPage;