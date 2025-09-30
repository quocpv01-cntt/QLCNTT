// pages/StaffPage.tsx

import React, { useState, useMemo, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Staff, UserRole, Gender, Unit, AuthContext, Role } from '../types';
import { staffApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { TrashIcon } from '../constants';
import { useData } from '../contexts/DataContext';
import Pagination from '../components/ui/Pagination';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';

const StaffPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { canAdd, canEdit, canDelete } = usePermissions('staff');
    const { data, refetchData } = useData();
    const [staff, setStaff] = useState<Staff[]>(data.staff);
    const [units, setUnits] = useState<Unit[]>(data.units);
    const [roles, setRoles] = useState<Role[]>(data.roles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Staff> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Staff | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setStaff(data.staff);
        setUnits(data.units);
        setRoles(data.roles);
    }, [data.staff, data.units, data.roles]);


    const handleOpenModal = (item?: Staff) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (itemToSave: Partial<Staff>) => {
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await staffApi.update(itemToSave.id!, itemToSave);
            } else {
                await staffApi.add(itemToSave as Omit<Staff, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thông tin cán bộ thành công!' : 'Thêm cán bộ thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        handleCloseModal();
    };

    const handleRequestDelete = (item: Staff) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await staffApi.remove(itemToDelete.id);
            addToast('Xóa cán bộ thành công.', 'success');
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
            await Promise.all(selectedItems.map(id => staffApi.remove(id)));
            addToast(`Đã xóa ${selectedItems.length} cán bộ.`, 'success');
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

    const staffForCurrentUser = useMemo(() => {
        if (!user) return [];
        if (user.role === UserRole.ADMIN) {
            return staff; // Admin sees everyone
        }
        if ((user.role === UserRole.UNIT_MANAGER || user.role === UserRole.EMPLOYEE) && user.unit) {
            return staff.filter(s => s.unit === user.unit);
        }
        return [];
    }, [staff, user]);


    const filteredStaff = useMemo(() => {
        if (!searchTerm) {
            return staffForCurrentUser;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return staffForCurrentUser.filter(s =>
            s.fullName.toLowerCase().includes(lowercasedSearchTerm) ||
            s.employeeId.toLowerCase().includes(lowercasedSearchTerm) ||
            s.unit.toLowerCase().includes(lowercasedSearchTerm) ||
            s.email.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [staffForCurrentUser, searchTerm]);
    
    const totalPages = useMemo(() => {
        return Math.ceil(filteredStaff.length / itemsPerPage);
    }, [filteredStaff.length]);

    const paginatedStaff = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStaff, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            const pageItemsIds = paginatedStaff.map(item => item.id);
            setSelectedItems(prev => [...new Set([...prev, ...pageItemsIds])]);
        } else {
            const pageItemsIds = paginatedStaff.map(item => item.id);
            setSelectedItems(prev => prev.filter(id => !pageItemsIds.includes(id)));
        }
    };
    
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
             setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const getStatusBadge = (status: 'Đang hoạt động' | 'Đã nghỉ việc') => {
        const statusClasses: Record<typeof status, string> = {
            'Đang hoạt động': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'Đã nghỉ việc': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return (
            <span className={`${baseClass} ${statusClasses[status] || ''}`}>
                {status}
            </span>
        );
    };

    const columns = [
        { header: 'Mã cán bộ', accessor: 'employeeId' as keyof Staff, sortKey: 'employeeId' as keyof Staff },
        { header: 'Họ và tên', accessor: (item: Staff) => <Link to={`/staff/${item.id}`} className="text-primary-500 dark:text-primary-400 hover:underline font-semibold">{item.fullName}</Link>, sortKey: 'fullName' as keyof Staff },
        { header: 'Email', accessor: 'email' as keyof Staff, sortKey: 'email' as keyof Staff },
        { header: 'Đơn vị', accessor: 'unit' as keyof Staff, sortKey: 'unit' as keyof Staff },
        { header: 'Giới tính', accessor: 'gender' as keyof Staff, sortKey: 'gender' as keyof Staff },
        { header: 'Chức vụ', accessor: 'position' as keyof Staff, sortKey: 'position' as keyof Staff },
        { header: 'Trạng thái hoạt động', accessor: (item: Staff) => getStatusBadge(item.status), sortKey: 'status' as keyof Staff },
    ];

    const renderActions = (item: Staff) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenModal(item)}>Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleRequestDelete(item)}>Xóa</Button>}
            </div>
        );
    };
    
    const inputClass = "w-full sm:w-80 px-4 py-2 pl-10 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500";
    
    return (
        <div>
            <PageHeader title="Danh sách Cán bộ">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm cán bộ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClass}
                        aria-label="Tìm kiếm cán bộ"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                 <ExportButton 
                    filteredData={filteredStaff}
                    allData={staffForCurrentUser}
                    fileName="danh_sach_can_bo"
                />
                {canAdd && (
                    <Button onClick={() => handleOpenModal()}>Thêm cán bộ</Button>
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
                tableId="staff-list"
                columns={columns} 
                data={paginatedStaff} 
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
                    onPageChange={handlePageChange}
                />
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin cán bộ' : 'Thêm cán bộ mới'}>
                <StaffForm currentItem={currentItem} onSave={handleSave} onClose={handleCloseModal} allStaff={staff} unitsData={units} rolesData={roles} />
            </Modal>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Cán bộ"
            >
                Bạn có chắc chắn muốn xóa cán bộ "<strong>{itemToDelete?.fullName}</strong>"? Hành động này không thể hoàn tác.
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title="Xác nhận Xóa Hàng loạt"
                variant="danger"
            >
                Bạn có chắc chắn muốn xóa <strong>{selectedItems.length}</strong> cán bộ đã chọn? Hành động này không thể hoàn tác.
            </ConfirmationModal>
        </div>
    );
};


interface FormProps {
    currentItem: Partial<Staff> | null;
    onSave: (item: Partial<Staff>) => void;
    onClose: () => void;
    allStaff: Staff[];
    unitsData: Unit[];
    rolesData: Role[];
}

const StaffForm: React.FC<FormProps> = ({ currentItem, onSave, onClose, allStaff, unitsData, rolesData }) => {
    const [formState, setFormState] = useState<Partial<Staff>>(currentItem || {});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (formState.email && !/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = "Định dạng email không hợp lệ.";
        } else if (formState.email && allStaff.some(s => s.email.toLowerCase() === formState.email!.toLowerCase() && s.id !== formState.id)) {
            newErrors.email = "Email này đã tồn tại.";
        }
        
        if (formState.phone && !/^0\d{9}$/.test(formState.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0).";
        }
        
        if (!formState.id && formState.employeeId) {
            if (allStaff.some(s => s.employeeId.toLowerCase() === formState.employeeId!.toLowerCase())) {
                newErrors.employeeId = "Mã cán bộ này đã tồn tại.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const availableRoles = useMemo(() => {
        if (user?.role === UserRole.ADMIN) {
            return rolesData;
        }
        return rolesData.filter(r => r.name !== UserRole.ADMIN);
    }, [rolesData, user]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Mã cán bộ</label>
                <input type="text" name="employeeId" value={formState.employeeId || ''} onChange={handleChange} className={`${inputClass} ${errors.employeeId ? errorInputClass : ''}`} required />
                {errors.employeeId && <p className={errorTextClass}>{errors.employeeId}</p>}
            </div>
             <div>
                <label className={labelClass}>Họ và tên</label>
                <input type="text" name="fullName" value={formState.fullName || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={formState.email || ''} onChange={handleChange} className={`${inputClass} ${errors.email ? errorInputClass : ''}`} required />
                {errors.email && <p className={errorTextClass}>{errors.email}</p>}
            </div>
            <div>
                <label className={labelClass}>Số điện thoại</label>
                <input type="tel" name="phone" placeholder="Ví dụ: 0912345678" value={formState.phone || ''} onChange={handleChange} className={`${inputClass} ${errors.phone ? errorInputClass : ''}`} />
                 {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
            </div>
            <div>
                <label className={labelClass}>Đơn vị</label>
                <select name="unit" value={formState.unit || ''} onChange={handleChange} className={inputClass} required>
                    <option value="" disabled>Chọn đơn vị</option>
                    {unitsData.map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className={labelClass}>Giới tính</label>
                <select name="gender" value={formState.gender || ''} onChange={handleChange} className={inputClass} required>
                    <option value="" disabled>Chọn giới tính</option>
                    {Object.values(Gender).map(genderValue => (
                        <option key={genderValue} value={genderValue}>{genderValue}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className={labelClass}>Chức vụ</label>
                <input type="text" name="position" value={formState.position || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
                <label className={labelClass}>Vai trò</label>
                <select name="role" value={formState.role || ''} onChange={handleChange} className={inputClass} required>
                    <option value="" disabled>-- Chọn vai trò --</option>
                    {availableRoles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                <Button type="submit">Lưu</Button>
            </div>
        </form>
    );
};

export default StaffPage;