import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Transfer, Staff, ITEquipment } from '../types';
import { transfersApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import DatePicker from '../components/ui/DatePicker';

const TransfersPage: React.FC = () => {
    const { data, refetchData } = useData();
    const { canAdd, canEdit, canDelete } = usePermissions('transfers');
    const [transfers, setTransfers] = useState<Transfer[]>(data.transfers);
    const [staff, setStaff] = useState<Staff[]>(data.staff);
    const [equipment, setEquipment] = useState<ITEquipment[]>(data.itEquipment);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Transfer> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Transfer | null>(null);

    const { addToast } = useToast();

    useEffect(() => {
        setTransfers(data.transfers);
        setStaff(data.staff);
        setEquipment(data.itEquipment);
    }, [data]);
    

    const handleOpenModal = (item?: Transfer) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Transfer>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await transfersApi.update(itemToSave.id!, itemToSave);
            } else {
                await transfersApi.add(itemToSave as Omit<Transfer, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };
    
    const handleRequestDelete = (item: Transfer) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await transfersApi.remove(itemToDelete.id);
            addToast('Xóa thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    
    const columns = [
        { header: 'Tên tài sản', accessor: 'assetName' as keyof Transfer },
        { header: 'Từ cán bộ', accessor: 'fromStaff' as keyof Transfer },
        { header: 'Đến cán bộ', accessor: 'toStaff' as keyof Transfer },
        { header: 'Ngày điều chuyển', accessor: 'transferDate' as keyof Transfer, sortKey: 'transferDate' as keyof Transfer },
        { header: 'Ghi chú', accessor: 'notes' as keyof Transfer },
    ];
    
     const renderActions = (item: Transfer) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenModal(item)}>Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleRequestDelete(item)}>Xóa</Button>}
            </div>
        );
    };

    return (
        <div>
            <PageHeader title="Điều chuyển Thiết bị">
                 <ExportButton
                    filteredData={transfers}
                    allData={transfers}
                    fileName="lich_su_dieu_chuyen"
                />
                {canAdd && <Button onClick={() => handleOpenModal()}>Tạo điều chuyển</Button>}
            </PageHeader>
            <Table tableId="transfers-list" columns={columns} data={transfers} renderActions={canEdit || canDelete ? renderActions : undefined} />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin' : 'Tạo điều chuyển'}>
                <TransferForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} staffList={staff} equipmentList={equipment} />
            </Modal>
             <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa">
                Bạn có chắc chắn muốn xóa lịch sử điều chuyển cho "<strong>{itemToDelete?.assetName}</strong>"?
            </ConfirmationModal>
        </div>
    );
};

const TransferForm: React.FC<{ currentItem: Partial<Transfer> | null; onSave: (item: Partial<Transfer>) => void; onClose: () => void; staffList: Staff[]; equipmentList: ITEquipment[] }> = ({ currentItem, onSave, onClose, staffList, equipmentList }) => {
    const [formState, setFormState] = useState(currentItem || {});
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
                <label className={labelClass}>Từ cán bộ</label>
                <select name="fromStaff" value={formState.fromStaff || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn cán bộ --</option>
                     <option value="Kho">Kho</option>
                    {staffList.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Đến cán bộ</label>
                <select name="toStaff" value={formState.toStaff || ''} onChange={handleChange} className={inputClass} required>
                    <option value="">-- Chọn cán bộ --</option>
                    <option value="Kho">Kho</option>
                    {staffList.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Ngày điều chuyển</label>
                <DatePicker value={formState.transferDate || ''} onChange={(date) => setFormState(prev => ({...prev, transferDate: date}))} />
            </div>
            <div>
                <label className={labelClass}>Ghi chú</label>
                <textarea name="notes" value={formState.notes || ''} onChange={handleChange} className={inputClass} rows={3}></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default TransfersPage;