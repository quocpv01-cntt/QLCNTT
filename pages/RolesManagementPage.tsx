import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { Role, Permissions, PermissionActions } from '../types';
import { rolesApi } from '../services/api';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { NAV_ITEMS } from '../constants';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';
import { usePermissions } from '../hooks/usePermissions';

const actions: { key: keyof PermissionActions; label: string }[] = [
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' },
];

const RolesManagementPage: React.FC = () => {
    const { data, refetchData } = useData();
    const { addToast } = useToast();
    const { canAdd, canEdit, canDelete } = usePermissions('roles');

    const [roles, setRoles] = useState<Role[]>(data.roles || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Role> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Role | null>(null);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [itemToSave, setItemToSave] = useState<Partial<Role> | null>(null);


    useEffect(() => {
        setRoles(data.roles || []);
    }, [data.roles]);

    const handleOpenModal = (item?: Role) => {
        setCurrentItem(item || { permissions: {} });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = (itemToSave: Partial<Role>) => {
        setItemToSave(itemToSave);
        setIsSaveConfirmOpen(true);
    };
    
    const handleConfirmSave = async () => {
        if (!itemToSave) return;
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await rolesApi.update(itemToSave.id!, itemToSave);
            } else {
                await rolesApi.add(itemToSave as Omit<Role, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật vai trò thành công!' : 'Thêm vai trò thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        setIsSaveConfirmOpen(false);
        setItemToSave(null);
        handleCloseModal();
    };

    const handleRequestDelete = (item: Role) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await rolesApi.remove(itemToDelete.id);
            addToast('Xóa vai trò thành công.', 'success');
            await refetchData();
        } catch (error) {
            addToast('Xóa thất bại!', 'error');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const columns = [
        { header: 'Tên Vai trò', accessor: 'name' as keyof Role, sortKey: 'name' as keyof Role },
        { header: 'Mô tả', accessor: 'description' as keyof Role, sortKey: 'description' as keyof Role },
    ];

    const renderActions = (item: Role) => (
        <div className="flex space-x-2">
            {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" icon={PencilIcon} onClick={() => handleOpenModal(item)} title={`Chỉnh sửa vai trò ${item.name}`}>Sửa</Button>}
            {!item.isBuiltIn && canDelete && (
                <Button variant="danger" className="text-xs px-2 py-1" icon={TrashIcon} onClick={() => handleRequestDelete(item)} title={`Xóa vai trò ${item.name}`}>Xóa</Button>
            )}
        </div>
    );

    return (
        <div>
            <PageHeader title="Quản lý Vai trò">
                {canAdd && <Button icon={PlusIcon} onClick={() => handleOpenModal()} title="Thêm một vai trò mới">Thêm Vai trò</Button>}
            </PageHeader>
            <Table 
                tableId="roles-management" 
                columns={columns} 
                data={roles} 
                renderActions={canEdit || canDelete ? renderActions : undefined} 
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Chỉnh sửa Vai trò' : 'Thêm Vai trò mới'} size="3xl">
                <RoleForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} />
            </Modal>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Vai trò"
                variant="danger"
            >
                Bạn có chắc chắn muốn xóa vai trò "<strong>{itemToDelete?.name}</strong>"? Hành động này không thể hoàn tác.
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isSaveConfirmOpen}
                onClose={() => setIsSaveConfirmOpen(false)}
                onConfirm={handleConfirmSave}
                title="Xác nhận Lưu Vai trò"
                variant="primary"
            >
                Bạn có chắc chắn muốn lưu những thay đổi này cho vai trò "<strong>{itemToSave?.name || 'mới'}</strong>"? 
                Các thay đổi về quyền sẽ ảnh hưởng đến tất cả người dùng thuộc vai trò này.
            </ConfirmationModal>
        </div>
    );
};

// Form Component
interface RoleFormProps {
    currentItem: Partial<Role> | null;
    onSave: (item: Partial<Role>) => void;
    onClose: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ currentItem, onSave, onClose }) => {
    const [formState, setFormState] = useState(currentItem || {});
    const isBuiltIn = currentItem?.isBuiltIn || false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleCheckboxChange = (moduleKey: string, action: keyof PermissionActions, isChecked: boolean) => {
        setFormState(prev => {
            const permissions = { ...(prev?.permissions || {}) };
            permissions[moduleKey] = { ...permissions[moduleKey], [action]: isChecked };
            return { ...prev, permissions };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };
    
    const inputClass = "w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Tên Vai trò</label>
                    <input id="name" type="text" name="name" value={formState.name || ''} onChange={handleChange} className={inputClass} required disabled={isBuiltIn} />
                </div>
                <div>
                    <label htmlFor="description" className={labelClass}>Mô tả</label>
                    <input id="description" type="text" name="description" value={formState.description || ''} onChange={handleChange} className={inputClass} required />
                </div>
            </div>
            
            <div>
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Quyền truy cập</h3>
                 <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {renderPermissionItems(NAV_ITEMS, formState.permissions || {}, handleCheckboxChange)}
                 </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu Vai trò</Button>
            </div>
        </form>
    );
};

const renderPermissionItems = (
    items: typeof NAV_ITEMS,
    permissions: Permissions,
    onCheckboxChange: (moduleKey: string, action: keyof PermissionActions, isChecked: boolean) => void
): React.ReactNode[] => {
    return items.map(item => {
        if (item.children) {
            const childrenContent = renderPermissionItems(item.children, permissions, onCheckboxChange);
            if (childrenContent.some(c => c !== null)) {
                return (
                    <div key={item.label} className="mt-4 first:mt-0">
                        <h4 className="font-semibold text-md text-gray-800 dark:text-gray-200 mb-2">{item.label}</h4>
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            {childrenContent}
                        </div>
                    </div>
                );
            }
            return null;
        }

        const moduleKey = (item as any).moduleKey;
        if (!moduleKey || ['account'].includes(moduleKey)) {
            return null;
        }

        const modulePermissions = permissions[moduleKey] || {};

        return (
             <div key={item.href} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {actions.map(action => (
                        <label key={action.key} className={`flex items-center space-x-2 p-1 rounded-md cursor-pointer`}>
                            <input
                                type="checkbox"
                                checked={modulePermissions[action.key] || false}
                                onChange={(e) => onCheckboxChange(moduleKey, action.key, e.target.checked)}
                                className="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    });
};

export default RolesManagementPage;