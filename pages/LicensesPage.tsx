import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { License, LicenseStatus } from '../types';
import { licensesApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import DatePicker from '../components/ui/DatePicker';
import Pagination from '../components/ui/Pagination';

const LicensesPage: React.FC = () => {
    const { canAdd, canEdit, canDelete } = usePermissions('licenses');
    const { data, refetchData } = useData();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<License> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<License | null>(null);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [itemToSave, setItemToSave] = useState<Partial<License> | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { addToast } = useToast();

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedLicenses = data.licenses.map(license => {
            if (license.status === LicenseStatus.INACTIVE) return license;
            if (license.expiryDate) {
                const expiry = new Date(license.expiryDate);
                expiry.setHours(0, 0, 0, 0);
                const newStatus = expiry < today ? LicenseStatus.EXPIRED : LicenseStatus.ACTIVE;
                if (license.status !== newStatus) return { ...license, status: newStatus };
            }
            return license;
        });
        setLicenses(updatedLicenses);
    }, [data.licenses]);
    
    const handleOpenModal = (item?: License) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = (item: Partial<License>) => {
        setItemToSave(item);
        setIsSaveConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!itemToSave) return;
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await licensesApi.update(itemToSave.id!, itemToSave);
            } else {
                await licensesApi.add(itemToSave as Omit<License, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
        setIsSaveConfirmOpen(false);
        setItemToSave(null);
    };

    const handleRequestDelete = (item: License) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await licensesApi.remove(itemToDelete.id);
            addToast('Xóa thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleRequestBulkDelete = () => {
        if (selectedItems.length > 0) setIsBulkDeleteModalOpen(true);
    };

    const handleConfirmBulkDelete = async () => {
        try {
            await Promise.all(selectedItems.map(id => licensesApi.remove(id)));
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

    const filteredLicenses = useMemo(() => {
        if (!searchTerm) return licenses;
        return licenses.filter(l => l.softwareName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [licenses, searchTerm]);

    const totalPages = useMemo(() => Math.ceil(filteredLicenses.length / itemsPerPage), [filteredLicenses.length]);
    const paginatedLicenses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLicenses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLicenses, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);
    
    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedItems(paginatedLicenses.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };


    const getStatusBadge = (status: LicenseStatus) => {
        const statusClasses: Record<LicenseStatus, string> = {
            [LicenseStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            [LicenseStatus.EXPIRED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            [LicenseStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return <span className={`${baseClass} ${statusClasses[status] || ''}`}>{status}</span>;
    };

    const columns = [
        { header: 'Tên phần mềm', accessor: 'softwareName' as keyof License, sortKey: 'softwareName' as keyof License },
        { header: 'Ngày mua', accessor: 'purchaseDate' as keyof License, sortKey: 'purchaseDate' as keyof License },
        { header: 'Ngày hết hạn', accessor: 'expiryDate' as keyof License, sortKey: 'expiryDate' as keyof License },
        { header: 'Số lượng', accessor: (item: License) => `${item.assignedSeats} / ${item.totalSeats}`, sortKey: 'totalSeats' as keyof License },
        { header: 'Trạng thái', accessor: (item: License) => getStatusBadge(item.status), sortKey: 'status' as keyof License },
    ];
    
    const renderActions = (item: License) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" icon={PencilIcon} className="text-xs px-2 py-1" onClick={() => handleOpenModal(item)}>Sửa</Button>}
                {canDelete && <Button variant="danger" icon={TrashIcon} className="text-xs px-2 py-1" onClick={() => handleRequestDelete(item)}>Xóa</Button>}
            </div>
        );
    };

    return (
        <div>
            <PageHeader title="Bản quyền Phần mềm">
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-2 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Tìm kiếm bản quyền" />
                <ExportButton
                    filteredData={filteredLicenses}
                    allData={licenses}
                    fileName="danh_sach_ban_quyen"
                />
                {canAdd && <Button icon={PlusIcon} onClick={() => handleOpenModal()}>Thêm bản quyền</Button>}
            </PageHeader>
            {canDelete && (
                <BulkActionsBar selectedCount={selectedItems.length} onClearSelection={() => setSelectedItems([])}>
                    <Button variant="danger" onClick={handleRequestBulkDelete} icon={TrashIcon} className="text-xs px-3 py-1.5">
                        Xóa mục đã chọn
                    </Button>
                </BulkActionsBar>
            )}
            <Table 
                tableId="licenses-list"
                columns={columns} 
                data={paginatedLicenses} 
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
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin' : 'Thêm Bản quyền'}>
                <LicenseForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} />
            </Modal>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa">
                Bạn có chắc chắn muốn xóa "<strong>{itemToDelete?.softwareName}</strong>"?
            </ConfirmationModal>
            <ConfirmationModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleConfirmBulkDelete} title="Xác nhận Xóa Hàng loạt" variant="danger">
                Bạn có chắc chắn muốn xóa <strong>{selectedItems.length}</strong> bản quyền đã chọn?
            </ConfirmationModal>
            <ConfirmationModal isOpen={isSaveConfirmOpen} onClose={() => setIsSaveConfirmOpen(false)} onConfirm={handleConfirmSave} title="Xác nhận Lưu" variant="primary" confirmButtonText="Xác nhận">
                Bạn có chắc chắn muốn lưu các thay đổi này không?
            </ConfirmationModal>
        </div>
    );
};

const LicenseForm: React.FC<{ currentItem: Partial<License> | null; onSave: (item: Partial<License>) => void; onClose: () => void; }> = ({ currentItem, onSave, onClose }) => {
    const [formState, setFormState] = useState(currentItem || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const total = formState.totalSeats ?? 0;
        const assigned = formState.assignedSeats ?? 0;

        if (assigned > total) {
            newErrors.assignedSeats = "Số lượng đã cấp phát không thể lớn hơn tổng số lượng.";
        }

        if (formState.purchaseDate && formState.expiryDate) {
            if (new Date(formState.expiryDate) < new Date(formState.purchaseDate)) {
                newErrors.expiryDate = "Ngày hết hạn không thể trước ngày mua.";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['totalSeats', 'assignedSeats'].includes(name);
        setFormState(prev => ({ ...prev, [name]: isNumeric ? (value === '' ? '' : Number(value)) : value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className={labelClass}>Tên phần mềm</label>
                    <input type="text" name="softwareName" value={formState.softwareName || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Ngày mua</label>
                    <DatePicker value={formState.purchaseDate || ''} onChange={(date) => setFormState(prev => ({...prev, purchaseDate: date}))} />
                </div>
                <div>
                    <label className={labelClass}>Ngày hết hạn</label>
                     <div className={`${errors.expiryDate ? 'rounded-md ring-1 ring-red-500' : ''}`}>
                        <DatePicker value={formState.expiryDate || ''} onChange={(date) => setFormState(prev => ({...prev, expiryDate: date}))} />
                     </div>
                    {errors.expiryDate && <p className={errorTextClass}>{errors.expiryDate}</p>}
                </div>
                <div>
                    <label className={labelClass}>Tổng số lượng</label>
                    <input type="number" name="totalSeats" value={formState.totalSeats ?? ''} onChange={handleChange} className={inputClass} min="0" />
                </div>
                <div>
                    <label className={labelClass}>Đã cấp phát</label>
                    <input type="number" name="assignedSeats" value={formState.assignedSeats ?? ''} onChange={handleChange} className={`${inputClass} ${errors.assignedSeats ? errorInputClass : ''}`} min="0" />
                    {errors.assignedSeats && <p className={errorTextClass}>{errors.assignedSeats}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className={labelClass}>Trạng thái</label>
                    <select name="status" value={formState.status || ''} onChange={handleChange} className={inputClass} required>
                        <option value="" disabled>-- Chọn trạng thái --</option>
                        {Object.values(LicenseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
             </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default LicensesPage;