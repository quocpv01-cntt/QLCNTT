
import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { EquipmentType, AuthContext, UserRole } from '../types';
import { equipmentTypesApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { TrashIcon, ComputerDesktopIcon, GlobeAltIcon, CubeIcon } from '../constants';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import Pagination from '../components/ui/Pagination';

const getIconForEquipmentType = (typeName: string) => {
    const className = "w-5 h-5 text-gray-600 dark:text-gray-300";
    const lowerTypeName = typeName.toLowerCase();
    if (['laptop', 'desktop', 'server', 'màn hình'].some(keyword => lowerTypeName.includes(keyword))) {
        return <ComputerDesktopIcon className={className} />;
    }
    if (['switch', 'access point', 'router', 'firewall'].some(keyword => lowerTypeName.includes(keyword))) {
        return <GlobeAltIcon className={className} />;
    }
    return <CubeIcon className={className} />;
};


const EquipmentTypesPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { canAdd, canEdit, canDelete } = usePermissions('equipment-types');
    const { data, refetchData } = useData();
    const [types, setTypes] = useState<EquipmentType[]>(data.equipmentTypes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<EquipmentType> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<EquipmentType | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTypes(data.equipmentTypes);
    }, [data.equipmentTypes]);

    const handleOpenModal = (item?: EquipmentType) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<EquipmentType>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await equipmentTypesApi.update(itemToSave.id!, itemToSave);
            } else {
                await equipmentTypesApi.add(itemToSave as Omit<EquipmentType, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };

    const handleRequestDelete = (item: EquipmentType) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await equipmentTypesApi.remove(itemToDelete.id);
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
            await Promise.all(selectedItems.map(id => equipmentTypesApi.remove(id)));
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
    
    const filteredTypes = useMemo(() => {
        if (!searchTerm) return types;
        return types.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [types, searchTerm]);

    const totalPages = useMemo(() => Math.ceil(filteredTypes.length / itemsPerPage), [filteredTypes.length]);
    const paginatedTypes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTypes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTypes, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedItems(paginatedTypes.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            addToast('Hiện tại chỉ hỗ trợ nhập từ tệp .csv.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                addToast('Không thể đọc tệp.', 'error');
                return;
            }

            try {
                const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
                if (rows.length < 2) {
                    addToast('Tệp CSV trống hoặc chỉ có dòng tiêu đề.', 'info');
                    return;
                }

                const headers = rows[0].split(',').map(h => h.trim());
                const requiredHeaders = ['name', 'prefix'];
                
                if (!requiredHeaders.every(h => headers.includes(h))) {
                    addToast(`Tệp CSV phải có ít nhất các cột: ${requiredHeaders.join(', ')}.`, 'error');
                    return;
                }

                const newTypes: Partial<EquipmentType>[] = [];
                for (let i = 1; i < rows.length; i++) {
                    const values = rows[i].split(',').map(v => v.trim());
                    const typeObject: Partial<EquipmentType> = {};
                    headers.forEach((header, index) => {
                        if (['name', 'prefix', 'category', 'notes'].includes(header)) {
                             (typeObject as any)[header] = values[index] || '';
                        }
                    });

                    if (typeObject.name && typeObject.prefix) {
                        newTypes.push(typeObject);
                    }
                }

                if (newTypes.length === 0) {
                     addToast('Không tìm thấy dữ liệu hợp lệ nào trong tệp.', 'info');
                     return;
                }

                addToast(`Đang xử lý ${newTypes.length} mục...`, 'info');
                
                await Promise.all(newTypes.map(type => equipmentTypesApi.add(type as Omit<EquipmentType, 'id'>)));

                addToast(`Đã nhập thành công ${newTypes.length} loại thiết bị.`, 'success');
                await refetchData();

            } catch (error) {
                addToast('Đã xảy ra lỗi khi xử lý tệp. Vui lòng kiểm tra định dạng.', 'error');
                console.error('Import error:', error);
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const columns = [
        {
            header: 'Tên loại',
            accessor: (item: EquipmentType) => (
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {getIconForEquipmentType(item.name)}
                    </div>
                    <span>{item.name}</span>
                </div>
            ),
            sortKey: 'name' as keyof EquipmentType
        },
        { header: 'Tiền tố tem', accessor: 'prefix' as keyof EquipmentType, sortKey: 'prefix' as keyof EquipmentType },
        { header: 'Danh mục', accessor: 'category' as keyof EquipmentType, sortKey: 'category' as keyof EquipmentType },
        { header: 'Ghi chú', accessor: 'notes' as keyof EquipmentType },
    ];
    
    const renderActions = (item: EquipmentType) => {
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
            <PageHeader title="Loại thiết bị">
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-2 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Tìm kiếm loại thiết bị" />
                <ExportButton
                    filteredData={filteredTypes}
                    allData={types}
                    fileName="danh_sach_loai_thiet_bi"
                />
                {canAdd && (
                    <>
                        <Button onClick={handleImportClick} variant="secondary">Nhập Excel</Button>
                        <Button onClick={() => handleOpenModal()}>Thêm loại</Button>
                    </>
                )}
            </PageHeader>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".csv"
                className="hidden"
                aria-hidden="true"
            />
            {canDelete && (
                <BulkActionsBar selectedCount={selectedItems.length} onClearSelection={() => setSelectedItems([])}>
                    <Button variant="danger" onClick={handleRequestBulkDelete} icon={TrashIcon} className="text-xs px-3 py-1.5">
                        Xóa mục đã chọn
                    </Button>
                </BulkActionsBar>
            )}
            <Table 
                tableId="equipment-types-list"
                columns={columns} 
                data={paginatedTypes} 
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
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa Loại thiết bị' : 'Thêm Loại thiết bị'}>
                <EquipmentTypeForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} allTypes={types} />
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
                Bạn có chắc chắn muốn xóa <strong>{selectedItems.length}</strong> loại thiết bị đã chọn?
            </ConfirmationModal>
        </div>
    );
};

interface EquipmentTypeFormProps {
    currentItem: Partial<EquipmentType> | null;
    onSave: (item: Partial<EquipmentType>) => void;
    onClose: () => void;
    allTypes: EquipmentType[];
}

const EquipmentTypeForm: React.FC<EquipmentTypeFormProps> = ({ currentItem, onSave, onClose, allTypes }) => {
    const [formState, setFormState] = useState(currentItem || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (formState.name && allTypes.some(t => t.name.toLowerCase() === formState.name!.toLowerCase() && t.id !== formState.id)) {
            newErrors.name = "Tên loại này đã tồn tại.";
        }
        if (formState.prefix && allTypes.some(t => t.prefix.toLowerCase() === formState.prefix!.toLowerCase() && t.id !== formState.id)) {
            newErrors.prefix = "Tiền tố này đã tồn tại.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
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
            <div>
                <label className={labelClass}>Tên loại</label>
                <input type="text" name="name" value={formState.name || ''} onChange={handleChange} className={`${inputClass} ${errors.name ? errorInputClass : ''}`} required />
                {errors.name && <p className={errorTextClass}>{errors.name}</p>}
            </div>
            <div>
                <label className={labelClass}>Tiền tố tem</label>
                <input type="text" name="prefix" value={formState.prefix || ''} onChange={handleChange} className={`${inputClass} ${errors.prefix ? errorInputClass : ''}`} required />
                {errors.prefix && <p className={errorTextClass}>{errors.prefix}</p>}
            </div>
            <div>
                <label className={labelClass}>Danh mục</label>
                <input type="text" name="category" value={formState.category || ''} onChange={handleChange} className={inputClass} />
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

export default EquipmentTypesPage;