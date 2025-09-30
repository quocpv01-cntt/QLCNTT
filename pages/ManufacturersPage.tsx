import React, { useState, useMemo, useEffect, useContext } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Manufacturer, AuthContext, UserRole } from '../types';
import { manufacturersApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { TrashIcon } from '../constants';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import Pagination from '../components/ui/Pagination';

const ManufacturersPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { canAdd, canEdit, canDelete } = usePermissions('manufacturers');
    const { data, refetchData } = useData();
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>(data.manufacturers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Manufacturer> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Manufacturer | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { addToast } = useToast();

    useEffect(() => {
        setManufacturers(data.manufacturers);
    }, [data.manufacturers]);

    const handleOpenModal = (item?: Manufacturer) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Manufacturer>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await manufacturersApi.update(itemToSave.id!, itemToSave);
            } else {
                await manufacturersApi.add(itemToSave as Omit<Manufacturer, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };
    
    const handleRequestDelete = (item: Manufacturer) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await manufacturersApi.remove(itemToDelete.id);
            addToast('Xóa thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

     const handleRequestBulkDelete = () => {
        if (selectedItems.length > 0) {
            setIsBulkDeleteModalOpen(true);
        }
    };

    const handleConfirmBulkDelete = async () => {
        try {
            await Promise.all(selectedItems.map(id => manufacturersApi.remove(id)));
            addToast(`Đã xóa ${selectedItems.length} mục.`, 'success');
            await refetchData();
            setSelectedItems([]);
        } catch (error) {
            addToast('Xóa hàng loạt thất bại!', 'error');
        }
        setIsBulkDeleteModalOpen(false);
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredManufacturers = useMemo(() => {
        if (!searchTerm) return manufacturers;
        return manufacturers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [manufacturers, searchTerm]);
    
    const totalPages = useMemo(() => Math.ceil(filteredManufacturers.length / itemsPerPage), [filteredManufacturers.length]);
    const paginatedManufacturers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredManufacturers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredManufacturers, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedItems(paginatedManufacturers.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };


    const columns = [
        { header: 'Tên nhà sản xuất', accessor: 'name' as keyof Manufacturer },
        { header: 'Người liên hệ', accessor: 'contactPerson' as keyof Manufacturer },
        { header: 'Số điện thoại', accessor: 'phone' as keyof Manufacturer },
        { header: 'Website', accessor: 'website' as keyof Manufacturer },
    ];
    
    const renderActions = (item: Manufacturer) => {
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
            <PageHeader title="Nhà sản xuất">
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-2 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Tìm kiếm nhà sản xuất" />
                <ExportButton
                    filteredData={filteredManufacturers}
                    allData={manufacturers}
                    fileName="danh_sach_nha_san_xuat"
                />
                {canAdd && (
                    <Button onClick={() => handleOpenModal()}>Thêm NSX</Button>
                )}
            </PageHeader>
            {canDelete && (
                <BulkActionsBar selectedCount={selectedItems.length} onClearSelection={() => setSelectedItems([])}>
                    <Button variant="danger" onClick={handleRequestBulkDelete} icon={TrashIcon} className="text-xs px-3 py-1.5">
                        Xóa mục đã chọn
                    </Button>
                </BulkActionsBar>
            )}
            <Table 
                tableId="manufacturers-list"
                columns={columns} 
                data={paginatedManufacturers} 
                renderActions={canEdit || canDelete ? renderActions : undefined}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                startIndex={(currentPage - 1) * itemsPerPage}
            />
             <div className="mt-6 flex justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin' : 'Thêm Nhà sản xuất'}>
                <ManufacturerForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} allManufacturers={manufacturers} />
            </Modal>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa">
                Bạn có chắc chắn muốn xóa "<strong>{itemToDelete?.name}</strong>"?
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title="Xác nhận Xóa Hàng loạt"
                variant="danger"
            >
                Bạn có chắc chắn muốn xóa <strong>{selectedItems.length}</strong> nhà sản xuất đã chọn?
            </ConfirmationModal>
        </div>
    );
};

interface ManufacturerFormProps {
    currentItem: Partial<Manufacturer> | null;
    onSave: (item: Partial<Manufacturer>) => void;
    onClose: () => void;
    allManufacturers: Manufacturer[];
}

const ManufacturerForm: React.FC<ManufacturerFormProps> = ({ currentItem, onSave, onClose, allManufacturers }) => {
    const [formState, setFormState] = useState(currentItem || {});
    const [error, setError] = useState('');

    const validate = (): boolean => {
        if (formState.name && allManufacturers.some(m => m.name.toLowerCase() === formState.name!.toLowerCase() && m.id !== formState.id)) {
            setError('Tên nhà sản xuất này đã tồn tại.');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <label className={labelClass}>Tên nhà sản xuất</label>
                <input type="text" name="name" value={formState.name || ''} onChange={handleChange} className={`${inputClass} ${error ? errorInputClass : ''}`} required />
                {error && <p className={errorTextClass}>{error}</p>}
            </div>
            <div>
                <label className={labelClass}>Người liên hệ</label>
                <input type="text" name="contactPerson" value={formState.contactPerson || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Số điện thoại</label>
                <input type="text" name="phone" value={formState.phone || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Website</label>
                <input type="text" name="website" value={formState.website || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default ManufacturersPage;