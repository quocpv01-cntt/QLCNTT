import React, { useState, useMemo, useEffect, useContext } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Unit, Staff, AuthContext, UserRole } from '../types';
import { unitsApi } from '../services/api';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import Pagination from '../components/ui/Pagination';

const UnitsPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { canAdd, canEdit, canDelete } = usePermissions('units');
    const { data, refetchData } = useData();
    const [units, setUnits] = useState<Unit[]>(data.units);
    const [staff, setStaff] = useState<Staff[]>(data.staff);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Unit> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Unit | null>(null);
    const { addToast } = useToast();
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setUnits(data.units);
        setStaff(data.staff);
    }, [data.units, data.staff]);


    const handleOpenModal = (item?: Unit) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Unit>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await unitsApi.update(itemToSave.id!, itemToSave);
            } else {
                await unitsApi.add(itemToSave as Omit<Unit, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật đơn vị thành công!' : 'Thêm đơn vị thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };

    const handleRequestDelete = (item: Unit) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await unitsApi.remove(itemToDelete.id);
            addToast('Xóa đơn vị thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    
    const filteredUnits = useMemo(() => {
        let unitsToDisplay = units;
        
        if ((user?.role === UserRole.UNIT_MANAGER || user?.role === UserRole.EMPLOYEE) && user.unit) {
            unitsToDisplay = units.filter(d => d.name === user.unit);
        }

        if (!searchTerm) return unitsToDisplay;
        return unitsToDisplay.filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.manager.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [units, searchTerm, user]);

    const totalPages = useMemo(() => Math.ceil(filteredUnits.length / itemsPerPage), [filteredUnits.length]);
    const paginatedUnits = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUnits.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUnits, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const columns = [
        { header: 'Tên đơn vị', accessor: 'name' as keyof Unit },
        { header: 'Trưởng đơn vị', accessor: 'manager' as keyof Unit },
        { header: 'Mô tả', accessor: 'description' as keyof Unit },
    ];
    
    const renderActions = (item: Unit) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs" onClick={() => handleOpenModal(item)}>Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs" onClick={() => handleRequestDelete(item)}>Xóa</Button>}
            </div>
        );
    };
    
    return (
        <div>
            <PageHeader title="Danh sách Đơn vị">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn vị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 pl-10 pr-10 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Tìm kiếm đơn vị"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                     {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                            aria-label="Xóa tìm kiếm"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <ExportButton
                    filteredData={filteredUnits}
                    allData={units}
                    fileName="danh_sach_don_vi"
                />
                {canAdd && (
                    <Button onClick={() => handleOpenModal()}>Thêm đơn vị</Button>
                )}
            </PageHeader>
            <Table 
                tableId="units-list" 
                columns={columns} 
                data={paginatedUnits} 
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
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin đơn vị' : 'Thêm đơn vị mới'}>
                <UnitForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} staffList={staff} allUnits={units} />
            </Modal>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Đơn vị"
            >
                Bạn có chắc chắn muốn xóa đơn vị "<strong>{itemToDelete?.name}</strong>"? Hành động này không thể hoàn tác.
            </ConfirmationModal>
        </div>
    );
};


interface FormProps {
    currentItem: Partial<Unit> | null;
    onSave: (item: Partial<Unit>) => void;
    onClose: () => void;
    staffList: Staff[];
    allUnits: Unit[];
}

const UnitForm: React.FC<FormProps> = ({ currentItem, onSave, onClose, staffList, allUnits }) => {
    const [formState, setFormState] = useState<Partial<Unit>>(currentItem || {});
    const [error, setError] = useState('');

    const validate = (): boolean => {
        if (formState.name && allUnits.some(u => u.name.toLowerCase() === formState.name!.toLowerCase() && u.id !== formState.id)) {
            setError('Tên đơn vị này đã tồn tại.');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formState);
        }
    };

    const inputClass = "w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400";
    const errorInputClass = "border-red-500 dark:border-red-400 focus:ring-red-500";
    const errorTextClass = "mt-1 text-xs text-red-500 dark:text-red-400";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Tên đơn vị</label>
                <input type="text" name="name" placeholder="Tên đơn vị" value={formState.name || ''} onChange={handleChange} className={`${inputClass} ${error ? errorInputClass : ''}`} required />
                {error && <p className={errorTextClass}>{error}</p>}
            </div>
             <div>
                <label className={labelClass}>Trưởng đơn vị</label>
                 <select name="manager" value={formState.manager || ''} onChange={handleChange} className={inputClass}>
                    <option value="">-- Chọn trưởng đơn vị --</option>
                    {staffList.map(staff => (
                        <option key={staff.id} value={staff.fullName}>{staff.fullName}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className={labelClass}>Mô tả</label>
                <textarea name="description" placeholder="Mô tả" value={formState.description || ''} onChange={handleChange} className={inputClass} rows={4}></textarea>
             </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default UnitsPage;