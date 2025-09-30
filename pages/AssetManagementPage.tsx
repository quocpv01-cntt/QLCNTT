import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { ITEquipment, EquipmentStatus, Staff, Manufacturer, EquipmentType, AuthContext, UserRole, Unit } from '../types';
import { itEquipmentApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Barcode from '../components/ui/Barcode';
import { PlusIcon, PencilIcon, TrashIcon, PrinterIcon, ComputerDesktopIcon, GlobeAltIcon, CubeIcon } from '../constants';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BulkActionsBar from '../components/ui/BulkActionsBar';
import { useData } from '../contexts/DataContext';
import Pagination from '../components/ui/Pagination';
import PrintModal from '../components/ui/PrintModal';
import { usePermissions } from '../hooks/usePermissions';
import ExportButton from '../components/ui/ExportButton';
import DatePicker from '../components/ui/DatePicker';


const getIconForEquipmentType = (typeName: string) => {
    const className = "w-5 h-5 text-gray-500 dark:text-gray-400";
    if (!typeName) return <CubeIcon className={className} />;
    const lowerTypeName = typeName.toLowerCase();
    if (['laptop', 'desktop', 'server', 'màn hình'].some(keyword => lowerTypeName.includes(keyword))) {
        return <ComputerDesktopIcon className={className} />;
    }
    if (['switch', 'access point', 'router', 'firewall'].some(keyword => lowerTypeName.includes(keyword))) {
        return <GlobeAltIcon className={className} />;
    }
    return <CubeIcon className={className} />;
};


const EquipmentManagementPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { data, refetchData } = useData();
    const { canAdd, canEdit, canDelete } = usePermissions('equipment');
    
    // UI states
    const [equipment, setEquipment] = useState<ITEquipment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<ITEquipment> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ITEquipment | null>(null);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [itemToSave, setItemToSave] = useState<Partial<ITEquipment> | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [activeEquipment, setActiveEquipment] = useState<ITEquipment | null>(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [itemsToPrint, setItemsToPrint] = useState<ITEquipment[]>([]);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [assignedToFilter, setAssignedToFilter] = useState<string>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const { addToast } = useToast();

    useEffect(() => {
        let equipmentData = data.itEquipment;
        if ((user?.role === UserRole.UNIT_MANAGER || user?.role === UserRole.EMPLOYEE) && user.unit) {
            equipmentData = equipmentData.filter(e => e.unit === user.unit);
        }
        setEquipment(equipmentData);
    }, [data.itEquipment, user]);
    
    // Generate unique options for filters
    const uniqueAssignedTo = useMemo(() => {
        const names = new Set(data.staff.map(s => s.fullName).filter(Boolean));
        return Array.from(names).sort();
    }, [data.staff]);

    const uniqueSuppliers = useMemo(() => {
        const suppliers = new Set(equipment.map(e => e.supplier).filter(Boolean));
        return Array.from(suppliers).sort();
    }, [equipment]);

    const handleOpenModal = (item?: ITEquipment) => {
        setCurrentItem(item || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };
    
    const handleSave = (item: Partial<ITEquipment>) => {
        setItemToSave(item);
        setIsSaveConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!itemToSave) return;
        const isEditing = !!itemToSave.id;
        try {
            if (isEditing) {
                await itEquipmentApi.update(itemToSave.id!, itemToSave);
            } else {
                await itEquipmentApi.add(itemToSave as Omit<ITEquipment, 'id'>);
            }
            addToast(isEditing ? 'Cập nhật thiết bị thành công!' : 'Thêm thiết bị thành công!', 'success');
            await refetchData();
        } catch (error) {
            addToast('Thao tác thất bại!', 'error');
        }
        setIsSaveConfirmOpen(false);
        setItemToSave(null);
        handleCloseModal();
    };
    
    const handleRequestDelete = (item: ITEquipment) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await itEquipmentApi.remove(itemToDelete.id);
            addToast('Xóa thiết bị thành công.', 'success');
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
            await Promise.all(selectedItems.map(id => itEquipmentApi.remove(id)));
            addToast(`Đã xóa ${selectedItems.length} thiết bị.`, 'success');
            await refetchData();
            setSelectedItems([]);
        } catch (error) {
            addToast('Xóa hàng loạt thất bại!', 'error');
        }
        setIsBulkDeleteModalOpen(false);
    };

    const handleRequestPrint = (items: ITEquipment[]) => {
        if (items.length > 0) {
            setItemsToPrint(items);
            setIsPrintModalOpen(true);
        }
    };


    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredEquipment = useMemo(() => {
        return equipment.filter(e => {
            const matchesSearchTerm = !searchTerm || Object.values(e).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = !statusFilter || e.status === statusFilter;
            const matchesAssignedTo = !assignedToFilter || e.assignedTo === assignedToFilter;
            const matchesSupplier = !supplierFilter || e.supplier === supplierFilter;

            return matchesSearchTerm && matchesStatus && matchesAssignedTo && matchesSupplier;
        });
    }, [equipment, searchTerm, statusFilter, assignedToFilter, supplierFilter]);
    
    const totalPages = useMemo(() => {
        return Math.ceil(filteredEquipment.length / itemsPerPage);
    }, [filteredEquipment.length]);

    const paginatedEquipment = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEquipment.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEquipment, currentPage]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, assignedToFilter, supplierFilter]);
    
    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            const pageItemsIds = paginatedEquipment.map(item => item.id);
            setSelectedItems(prev => [...new Set([...prev, ...pageItemsIds])]);
        } else {
            const pageItemsIds = paginatedEquipment.map(item => item.id);
            setSelectedItems(prev => prev.filter(id => !pageItemsIds.includes(id)));
        }
    };

    const handleRowClick = (item: ITEquipment) => {
        if (activeEquipment && activeEquipment.id === item.id) {
            setActiveEquipment(null); // Toggle off if clicking the same row
        } else {
            setActiveEquipment(item);
        }
    };
    
    const handleClosePanel = () => {
        setActiveEquipment(null);
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setAssignedToFilter('');
        setSupplierFilter('');
    };
    
    const getStatusBadge = (status: EquipmentStatus) => {
        const statusClasses: Record<EquipmentStatus, string> = {
            [EquipmentStatus.AVAILABLE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            [EquipmentStatus.IN_USE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            [EquipmentStatus.IN_REPAIR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            [EquipmentStatus.RETIRED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            [EquipmentStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return <span className={`${baseClass} ${statusClasses[status] || ''}`}>{status}</span>;
    };
    
    const columns = [
        { header: 'Tem thiết bị', accessor: (item: ITEquipment) => <Barcode value={item.assetTag} size="small" /> },
        { header: 'Tên thiết bị', accessor: 'deviceName' as keyof ITEquipment, sortKey: 'deviceName' as keyof ITEquipment },
        { 
            header: 'Loại', 
            accessor: (item: ITEquipment) => (
                <div className="flex items-center gap-2">
                    {getIconForEquipmentType(item.deviceType)}
                    <span>{item.deviceType}</span>
                </div>
            ),
            sortKey: 'deviceType' as keyof ITEquipment
        },
        { header: 'Trạng thái', accessor: (item: ITEquipment) => getStatusBadge(item.status) },
        { header: 'Người sử dụng', accessor: 'assignedTo' as keyof ITEquipment, sortKey: 'assignedTo' as keyof ITEquipment },
        { header: 'Đơn vị', accessor: 'unit' as keyof ITEquipment, sortKey: 'unit' as keyof ITEquipment },
        { header: 'Hệ điều hành', accessor: 'operatingSystem' as keyof ITEquipment },
        { header: 'Địa chỉ IP', accessor: 'ipAddress' as keyof ITEquipment },
        { header: 'Nhà cung cấp', accessor: 'supplier' as keyof ITEquipment, sortKey: 'supplier' as keyof ITEquipment },
        { header: 'Hết hạn BH', accessor: 'warrantyEndDate' as keyof ITEquipment, sortKey: 'warrantyEndDate' as keyof ITEquipment },
    ];
    
    const renderActions = (item: ITEquipment) => {
        if (!canEdit && !canDelete) return null;
        return (
            <div className="flex space-x-2">
                {canEdit && <Button variant="secondary" className="text-xs px-2 py-1" icon={PencilIcon} onClick={() => handleOpenModal(item)} title={`Sửa thông tin cho ${item.deviceName}`}>Sửa</Button>}
                {canDelete && <Button variant="danger" className="text-xs px-2 py-1" icon={TrashIcon} onClick={() => handleRequestDelete(item)} title={`Xóa ${item.deviceName}`}>Xóa</Button>}
            </div>
        );
    };
    
    const filterSelectClass = "w-full sm:w-auto flex-grow sm:flex-grow-0 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500";


    return (
        <div>
            <div className={`transition-all duration-300 ease-in-out ${activeEquipment ? 'md:mr-96 lg:mr-[32rem]' : 'mr-0'}`}>
                <PageHeader title="Thiết bị Công Nghệ">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 pl-10 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Tìm kiếm thiết bị"
                    />
                    <ExportButton 
                        filteredData={filteredEquipment}
                        allData={equipment}
                        fileName="danh_sach_thiet_bi"
                    />
                    {canAdd && (
                        <Button icon={PlusIcon} onClick={() => handleOpenModal()} title="Thêm một thiết bị mới">Thêm thiết bị</Button>
                    )}
                </PageHeader>
                
                 {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white/20 dark:bg-gray-800/20 rounded-lg border border-white/10 dark:border-white/5">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={filterSelectClass} aria-label="Lọc theo trạng thái">
                        <option value="">Tất cả Trạng thái</option>
                        {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={assignedToFilter} onChange={e => setAssignedToFilter(e.target.value)} className={filterSelectClass} aria-label="Lọc theo người sử dụng">
                        <option value="">Tất cả Người dùng</option>
                        {uniqueAssignedTo.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className={filterSelectClass} aria-label="Lọc theo nhà cung cấp">
                        <option value="">Tất cả Nhà cung cấp</option>
                        {uniqueSuppliers.map(supplier => <option key={supplier} value={supplier}>{supplier}</option>)}
                    </select>
                    <Button variant="secondary" onClick={handleResetFilters} className="text-sm px-3 py-1.5" title="Xóa tất cả các bộ lọc đã áp dụng">
                        Đặt lại Bộ lọc
                    </Button>
                </div>


                {canDelete && (
                    <BulkActionsBar 
                        selectedCount={selectedItems.length} 
                        onClearSelection={() => setSelectedItems([])}
                    >
                        <Button variant="secondary" onClick={() => {
                                const items = equipment.filter(e => selectedItems.includes(e.id));
                                handleRequestPrint(items);
                            }} icon={PrinterIcon} className="text-xs px-3 py-1.5" title="In tem cho các mục đã chọn">
                            In Tem
                        </Button>
                        <Button variant="danger" onClick={handleRequestBulkDelete} icon={TrashIcon} className="text-xs px-3 py-1.5" title="Xóa tất cả các mục đã chọn">
                            Xóa mục đã chọn
                        </Button>
                    </BulkActionsBar>
                )}
                <Table
                    tableId="asset-management"
                    columns={columns} 
                    data={paginatedEquipment} 
                    renderActions={canEdit || canDelete ? renderActions : undefined} 
                    selectedItems={selectedItems} 
                    onSelectItem={handleSelectItem} 
                    onSelectAll={handleSelectAll}
                    onRowClick={handleRowClick}
                    activeRowId={activeEquipment?.id || null}
                    startIndex={(currentPage - 1) * itemsPerPage}
                />
                <div className="mt-6 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onLastPageNext={() => addToast('Bạn đã ở trang cuối cùng.', 'info')}
                    />
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Sửa thông tin thiết bị' : 'Thêm thiết bị mới'} size="2xl">
                <EquipmentForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                    staffList={data.staff}
                    manufacturerList={data.manufacturers}
                    equipmentTypeList={data.equipmentTypes}
                    unitsList={data.units}
                    allEquipment={equipment}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Thiết bị"
                variant="danger"
            >
                Bạn có chắc chắn muốn xóa thiết bị "<strong>{itemToDelete?.deviceName}</strong>"? Hành động này không thể hoàn tác.
            </ConfirmationModal>

             <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title="Xác nhận Xóa Hàng loạt"
                variant="danger"
            >
                Bạn có chắc chắn muốn xóa <strong>{selectedItems.length}</strong> thiết bị đã chọn? Hành động này không thể hoàn tác.
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isSaveConfirmOpen}
                onClose={() => setIsSaveConfirmOpen(false)}
                onConfirm={handleConfirmSave}
                title="Xác nhận Lưu"
                variant="primary"
                confirmButtonText="Xác nhận"
            >
                Bạn có chắc chắn muốn lưu các thay đổi này không?
            </ConfirmationModal>

            <PrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                itemsToPrint={itemsToPrint}
            />
            
            {/* Panel Container (for overlay on mobile) */}
            {activeEquipment && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={handleClosePanel}></div>}

            {/* Panel */}
            <div className={`
                fixed top-0 right-0 h-full w-11/12 max-w-md md:w-96 lg:w-[32rem] 
                bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl 
                border-l border-gray-200/50 dark:border-gray-700/50 
                shadow-2xl z-40 
                transform transition-transform duration-300 ease-in-out
                ${activeEquipment ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {activeEquipment && (
                    <EquipmentDetailPanel 
                        equipment={activeEquipment} 
                        onClose={handleClosePanel}
                        onEdit={(item) => {
                            handleClosePanel();
                            setTimeout(() => handleOpenModal(item), 150);
                        }}
                        onPrint={(item) => handleRequestPrint([item])}
                    />
                )}
            </div>

        </div>
    );
};

// Form Component
interface FormProps {
    currentItem: Partial<ITEquipment> | null;
    onSave: (item: Partial<ITEquipment>) => void;
    onClose: () => void;
    staffList: Staff[];
    manufacturerList: Manufacturer[];
    equipmentTypeList: EquipmentType[];
    unitsList: Unit[];
    allEquipment: ITEquipment[];
}

const EquipmentForm: React.FC<FormProps> = ({ currentItem, onSave, onClose, staffList, manufacturerList, equipmentTypeList, unitsList, allEquipment }) => {
    const [formState, setFormState] = useState<Partial<ITEquipment>>(currentItem || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        // Validate unique serial number if it exists
        if (formState.serialNumber) {
            const isDuplicate = allEquipment.some(
                eq => eq.serialNumber === formState.serialNumber && eq.id !== formState.id
            );
            if (isDuplicate) {
                newErrors.serialNumber = "Số Serial này đã tồn tại.";
            }
        }

        // Validate date logic
        if (formState.purchaseDate && formState.warrantyEndDate) {
            if (new Date(formState.warrantyEndDate) < new Date(formState.purchaseDate)) {
                newErrors.warrantyEndDate = "Ngày hết hạn bảo hành không thể trước ngày mua.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        if (!formState.id && formState.deviceType) {
            const type = equipmentTypeList.find(t => t.name === formState.deviceType);
            if (!type || !type.prefix) return;

            const year = new Date().getFullYear();
            const prefix = type.prefix;
            const prefixWithYear = `${prefix}-${year}`;

            const relevantTags = allEquipment
                .map(e => e.assetTag)
                .filter(tag => tag.startsWith(prefixWithYear));

            let maxNum = 0;
            relevantTags.forEach(tag => {
                const parts = tag.split('-');
                if (parts.length === 3) {
                    const num = parseInt(parts[2], 10);
                    if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                    }
                }
            });
            
            const nextNum = (maxNum + 1).toString().padStart(3, '0');
            const newAssetTag = `${prefixWithYear}-${nextNum}`;
            
            setFormState(prev => ({ ...prev, assetTag: newAssetTag }));
        }
    }, [formState.deviceType, formState.id, equipmentTypeList, allEquipment]);

    // Auto-populate unit based on assigned staff
    useEffect(() => {
        if (formState.assignedTo) {
            const selectedStaff = staffList.find(s => s.fullName === formState.assignedTo);
            if (selectedStaff && formState.unit !== selectedStaff.unit) {
                setFormState(prev => ({ ...prev, unit: selectedStaff.unit }));
            }
        }
    }, [formState.assignedTo, staffList]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={labelClass}>Tên thiết bị</label>
                    <input type="text" name="deviceName" value={formState.deviceName || ''} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label className={labelClass}>Loại thiết bị</label>
                    <select name="deviceType" value={formState.deviceType || ''} onChange={handleChange} className={inputClass} required>
                        <option value="">-- Chọn loại --</option>
                        {equipmentTypeList.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Tem thiết bị</label>
                    <input type="text" name="assetTag" value={formState.assetTag || ''} onChange={handleChange} className={`${inputClass} bg-gray-100 dark:bg-gray-800`} required readOnly={!formState.id} />
                </div>
                 <div>
                    <label className={labelClass}>Số Serial</label>
                    <input type="text" name="serialNumber" value={formState.serialNumber || ''} onChange={handleChange} className={`${inputClass} ${errors.serialNumber ? errorInputClass : ''}`} />
                    {errors.serialNumber && <p className={errorTextClass}>{errors.serialNumber}</p>}
                </div>
                 <div>
                    <label className={labelClass}>Trạng thái</label>
                    <select name="status" value={formState.status || ''} onChange={handleChange} className={inputClass} required>
                        <option value="">-- Chọn trạng thái --</option>
                        {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClass}>Người sử dụng</label>
                    <select name="assignedTo" value={formState.assignedTo || ''} onChange={handleChange} className={inputClass}>
                         <option value="">-- Bỏ trống --</option>
                        {staffList.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClass}>Đơn vị</label>
                    <select name="unit" value={formState.unit || ''} onChange={handleChange} className={inputClass}>
                         <option value="">-- Chọn đơn vị --</option>
                        {unitsList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClass}>Ngày mua</label>
                    <DatePicker value={formState.purchaseDate || ''} onChange={(date) => setFormState(prev => ({...prev, purchaseDate: date}))} />
                </div>
                 <div>
                    <label className={labelClass}>Hết hạn bảo hành</label>
                    <div className={`${errors.warrantyEndDate ? 'rounded-md ring-1 ring-red-500' : ''}`}>
                       <DatePicker value={formState.warrantyEndDate || ''} onChange={(date) => setFormState(prev => ({...prev, warrantyEndDate: date}))} />
                    </div>
                     {errors.warrantyEndDate && <p className={errorTextClass}>{errors.warrantyEndDate}</p>}
                </div>
                <div>
                    <label className={labelClass}>Nhà cung cấp/sản xuất</label>
                    <input type="text" name="supplier" value={formState.supplier || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Hệ điều hành</label>
                    <input type="text" name="operatingSystem" value={formState.operatingSystem || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Địa chỉ IP</label>
                    <input type="text" name="ipAddress" value={formState.ipAddress || ''} onChange={handleChange} className={inputClass} />
                </div>
                 <div className="md:col-span-2">
                    <label className={labelClass}>Ghi chú</label>
                    <textarea name="notes" value={formState.notes || ''} onChange={handleChange} className={inputClass} rows={3}></textarea>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} title="Đóng cửa sổ này">Hủy</Button>
                <Button type="submit" title="Lưu các thay đổi vào hệ thống">Lưu</Button>
            </div>
        </form>
    );
};

const DetailField: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 break-words">{value || <span className="text-gray-400 dark:text-gray-500">N/A</span>}</dd>
    </div>
);


const EquipmentDetailPanel: React.FC<{
    equipment: ITEquipment;
    onClose: () => void;
    onEdit: (item: ITEquipment) => void;
    onPrint: (item: ITEquipment) => void;
}> = ({ equipment, onClose, onEdit, onPrint }) => {
    const { canEdit } = usePermissions('equipment');

    const getStatusBadge = (status: EquipmentStatus) => {
        const statusClasses: Record<EquipmentStatus, string> = {
            [EquipmentStatus.AVAILABLE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            [EquipmentStatus.IN_USE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            [EquipmentStatus.IN_REPAIR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            [EquipmentStatus.RETIRED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            [EquipmentStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        return <span className={`${baseClass} ${statusClasses[status] || ''}`}>{status}</span>;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate" title={equipment.deviceName}>{equipment.deviceName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{equipment.assetTag}</p>
                </div>
                <div className="flex items-center flex-shrink-0 ml-4">
                    <Button variant="secondary" onClick={() => onPrint(equipment)} icon={PrinterIcon} className="text-xs px-2 py-1 mr-2" title="In tem cho thiết bị này">In Tem</Button>
                    {canEdit && (
                        <Button variant="secondary" onClick={() => onEdit(equipment)} icon={PencilIcon} className="text-xs px-2 py-1 mr-2" title="Chỉnh sửa thông tin thiết bị">Sửa</Button>
                    )}
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Đóng chi tiết" title="Đóng bảng chi tiết">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6">
                <div className="space-y-6">
                     <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-3">Thông tin chung</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                            <DetailField label="Loại thiết bị" value={equipment.deviceType} />
                            <DetailField label="Trạng thái" value={getStatusBadge(equipment.status)} />
                            <DetailField label="Số Serial" value={equipment.serialNumber} fullWidth />
                        </dl>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-3">Thông tin Cấp phát & Bảo hành</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                            <DetailField label="Người sử dụng" value={equipment.assignedTo} />
                            <DetailField label="Đơn vị" value={equipment.unit} />
                            <DetailField label="Nhà cung cấp/sản xuất" value={equipment.supplier} />
                            <DetailField label="Ngày mua" value={equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('vi-VN') : 'N/A'} />
                            <DetailField label="Hết hạn bảo hành" value={equipment.warrantyEndDate ? new Date(equipment.warrantyEndDate).toLocaleDateString('vi-VN') : 'N/A'} />
                        </dl>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-3">Thông tin Hệ thống & Mạng</h4>
                         <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                            <DetailField label="Hệ điều hành" value={equipment.operatingSystem} />
                            <DetailField label="Địa chỉ IP" value={equipment.ipAddress} />
                        </dl>
                    </div>

                     <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-3">Ghi chú</h4>
                         <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                            <DetailField label="" value={equipment.notes} fullWidth />
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentManagementPage;