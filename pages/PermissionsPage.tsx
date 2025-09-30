import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { NAV_ITEMS, ShieldCheckIcon, QueueListIcon } from '../constants';
import { UserRole, Permissions, Staff, PermissionActions, AuthContext } from '../types';
import { useToast } from '../contexts/ToastContext';
import { permissionsApi } from '../services/api';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import Modal from '../components/ui/Modal';

const actions: { key: keyof PermissionActions; label: string }[] = [
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' },
];

const PermissionsPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const currentUser = auth?.user;
    const { data, refetchData, isLoading } = useData();
    const [allStaff, setAllStaff] = useState<Staff[]>(data.staff);
    const { addToast } = useToast();

    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [localPermissions, setLocalPermissions] = useState<Permissions | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
    
    const editableStaffList = allStaff.filter(s => s.id !== currentUser?.id);

    useEffect(() => {
        setAllStaff(data.staff);
    }, [data.staff]);
    
    useEffect(() => {
        if (!isLoading && editableStaffList.length > 0 && !selectedStaffId) {
            setSelectedStaffId(editableStaffList[0].id);
        }
        if (selectedStaffId) {
            const selectedStaff = allStaff.find(s => s.id === selectedStaffId);
            if (selectedStaff?.role === UserRole.ADMIN) {
                const adminRoleTemplate = data.roles.find(r => r.name === UserRole.ADMIN);
                setLocalPermissions(adminRoleTemplate ? { ...adminRoleTemplate.permissions } : (selectedStaff?.permissions || {}));
            } else {
                setLocalPermissions(selectedStaff?.permissions || {});
            }
        } else {
            setLocalPermissions(null);
        }
    }, [selectedStaffId, allStaff, isLoading, editableStaffList, data.roles]);
    
    const selectedStaffMember = allStaff.find(s => s.id === selectedStaffId);

    const handleCheckboxChange = (moduleKey: string, action: keyof PermissionActions, isChecked: boolean) => {
        if (!localPermissions) return;
        setLocalPermissions(prev => ({
            ...prev!,
            [moduleKey]: { ...prev![moduleKey], [action]: isChecked },
        }));
    };
    
    const handleRequestSaveChanges = () => {
        if (!selectedStaffId || !localPermissions) return;
        setIsConfirmOpen(true);
    };

    const handleConfirmSaveChanges = async () => {
        if (!selectedStaffId || !localPermissions) return;
        setIsSubmitting(true);
        setIsConfirmOpen(false);
        try {
            await permissionsApi.updateStaffPermissions(selectedStaffId, localPermissions);
            await refetchData();
            addToast('Phân quyền đã được cập nhật thành công!', 'success');
        } catch (error) {
            addToast('Cập nhật thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRequestReset = () => {
        setIsResetConfirmOpen(true);
    };

    const handleConfirmReset = async () => {
        if (!selectedStaffMember) return;
        setIsResetConfirmOpen(false);
        setIsSubmitting(true);
    
        const roleTemplate = data.roles.find(r => r.name === selectedStaffMember.role);
        const defaultPerms = roleTemplate ? roleTemplate.permissions : null;
    
        if (defaultPerms) {
            try {
                await permissionsApi.updateStaffPermissions(selectedStaffMember.id, defaultPerms);
                await refetchData(); 
                setLocalPermissions({ ...defaultPerms }); 
                addToast(`Quyền cho "${selectedStaffMember.fullName}" đã được đặt lại thành công!`, 'success');
            } catch (error) {
                addToast(`Đặt lại quyền thất bại cho "${selectedStaffMember.fullName}".`, 'error');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            addToast(`Không tìm thấy mẫu quyền cho vai trò "${selectedStaffMember.role}".`, 'error');
            setIsSubmitting(false);
        }
    };

    const handleOpenOverview = () => {
        if (selectedStaffId && localPermissions) {
            setIsOverviewModalOpen(true);
        }
    };
    

    const renderPermissionItems = (
        items: typeof NAV_ITEMS,
        isDisabled: boolean
    ): React.ReactNode[] => {
        return items.map(item => {
            if (item.children) {
                const childrenContent = renderPermissionItems(item.children, isDisabled);
                if (childrenContent.some(c => c !== null)) {
                    return (
                        <div key={item.label} className="mt-6 first:mt-0">
                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">{item.label}</h4>
                            <div className="space-y-3">
                                {childrenContent}
                            </div>
                        </div>
                    );
                }
                return null;
            }

            const moduleKey = (item as any).moduleKey;
            if (!moduleKey || ['dashboard', 'settings', 'account'].includes(moduleKey)) {
                return null;
            }

            if (!localPermissions) return null;
            const modulePermissions = localPermissions[moduleKey] || {};

            return (
                 <div key={item.href} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                        {actions.map(action => (
                            <label key={action.key} className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    checked={isDisabled || modulePermissions[action.key] || false}
                                    onChange={(e) => handleCheckboxChange(moduleKey, action.key, e.target.checked)}
                                    className="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-500 rounded focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isDisabled}
                                />
                                <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }).filter(Boolean); 
    };
    
    if (isLoading) {
        return <div>Đang tải...</div>;
    }
    
    return (
        <div>
            <PageHeader title="Phân quyền Người dùng" />
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 lg:w-1/4">
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/5 shadow-lg overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200/50 dark:border-gray-700/50">Danh sách Người dùng</h3>
                        <div className="max-h-[65vh] overflow-y-auto">
                            {editableStaffList.length > 0 ? (
                                editableStaffList.map(staff => (
                                    <button key={staff.id} onClick={() => setSelectedStaffId(staff.id)} className={`w-full text-left p-4 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 transition-colors duration-150 ${selectedStaffId === staff.id ? 'bg-primary-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-300'}`}>
                                        <p className="font-semibold">{staff.fullName}</p>
                                        <p className="text-sm opacity-80">{staff.employeeId} ({staff.role})</p>
                                    </button>
                                ))
                            ) : <p className="p-4 text-gray-500 dark:text-gray-400">Không có người dùng nào để quản lý.</p>}
                        </div>
                    </div>
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                    {selectedStaffId && localPermissions ? (
                         <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/5 shadow-lg">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200/50 dark:border-gray-700/50">Phân quyền cho: <span className="text-primary-500 dark:text-primary-400">{selectedStaffMember?.fullName}</span></h3>
                            <div className="p-6">
                                <div className="space-y-4">{renderPermissionItems(NAV_ITEMS, false)}</div>
                            </div>
                        </div>
                    ) : <div className="flex items-center justify-center h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/5 shadow-lg p-8"><p className="text-gray-500 dark:text-gray-400">Vui lòng chọn một người dùng.</p></div>}
                    {selectedStaffId && <div className="mt-6 flex justify-end items-center gap-4 flex-wrap">
                        <Button variant="secondary" onClick={handleOpenOverview} icon={QueueListIcon} title="Xem tổng quan tất cả quyền của người dùng này">Xem tổng quan</Button>
                        <Button variant="secondary" onClick={handleRequestReset} title="Đặt lại quyền về mặc định theo vai trò của người dùng">Đặt lại theo Vai trò</Button>
                        <Button onClick={handleRequestSaveChanges} isSubmitting={isSubmitting} icon={ShieldCheckIcon} title="Lưu lại tất cả thay đổi về quyền">Lưu thay đổi</Button>
                    </div>}
                </div>
            </div>
            
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmSaveChanges} title="Xác nhận Thay đổi Quyền" variant="primary" confirmButtonText="Xác nhận" isConfirming={isSubmitting}>Bạn có chắc chắn muốn lưu các thay đổi về quyền cho người dùng "<strong>{selectedStaffMember?.fullName}</strong>"?</ConfirmationModal>
            <ConfirmationModal isOpen={isResetConfirmOpen} onClose={() => setIsResetConfirmOpen(false)} onConfirm={handleConfirmReset} title="Xác nhận Đặt lại Quyền" variant="danger" isConfirming={isSubmitting}>Bạn có chắc chắn muốn đặt lại quyền cho "<strong>{selectedStaffMember?.fullName}</strong>" về mẫu mặc định của vai trò không? Hành động này sẽ được lưu ngay lập tức.</ConfirmationModal>

            <PermissionsOverviewModal
                isOpen={isOverviewModalOpen}
                onClose={() => setIsOverviewModalOpen(false)}
                staffName={selectedStaffMember?.fullName || ''}
                permissions={localPermissions}
            />
        </div>
    );
};

const flattenNavItems = (items: typeof NAV_ITEMS): { moduleKey: string; label: string }[] => {
    const flattened: { moduleKey: string; label: string }[] = [];
    items.forEach(item => {
        if (item.children) {
            flattened.push(...flattenNavItems(item.children));
        } else if (item.moduleKey && !['dashboard', 'settings', 'account'].includes(item.moduleKey)) {
            flattened.push({ moduleKey: item.moduleKey, label: item.label });
        }
    });
    return flattened;
};

const PermissionsOverviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    staffName: string;
    permissions: Permissions | null;
}> = ({ isOpen, onClose, staffName, permissions }) => {
    const allModules = useMemo(() => flattenNavItems(NAV_ITEMS), []);
    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Tổng quan Quyền cho ${staffName}`} size="3xl">
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                            {actions.map(action => (
                                <th key={action.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{action.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                        {allModules.map(({ moduleKey, label }) => {
                            const modulePerms = permissions?.[moduleKey] || {};
                            return (
                                <tr key={moduleKey} className="hover:bg-black/5 dark:hover:bg-white/10">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{label}</td>
                                    {actions.map(action => (
                                        <td key={action.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <div className="flex justify-center">
                                                {modulePerms[action.key] ? <CheckIcon /> : <XIcon />}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};


export default PermissionsPage;