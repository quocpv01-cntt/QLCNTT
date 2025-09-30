// services/api.ts

import { 
    ITEquipment, EquipmentStatus, EquipmentType, Staff, UserRole, Manufacturer, Unit, 
    License, LicenseStatus, Allocation, AllocationStatus, Maintenance, MaintenanceStatus, 
    Transfer, UsageHistory, Gender, Permissions, Role
} from '../types';

// Dữ liệu ban đầu - đóng vai trò là "cơ sở dữ liệu" trong bộ nhớ

const allModules = [
    'dashboard', 'equipment', 'equipment-types', 'manufacturers', 'network',
    'allocation', 'transfers', 'maintenance', 'repairs', 'staff', 'units',
    'licenses', 'reports', 'settings', 'usage-history', 'permissions', 'roles',
    'database-explorer', 'account'
];

const adminPermissions: Permissions = allModules.reduce((acc, moduleKey) => {
    acc[moduleKey] = { view: true, add: true, edit: true, delete: true };
    return acc;
}, {} as Permissions);


const employeePermissions: Permissions = {
    dashboard: { view: true },
    equipment: { view: true, add: false, edit: false, delete: false },
    'equipment-types': { view: true, add: false, edit: false, delete: false },
    manufacturers: { view: true, add: false, edit: false, delete: false },
    network: { view: true, add: false, edit: false, delete: false },
    allocation: { view: true, add: false, edit: false, delete: false },
    transfers: { view: true, add: false, edit: false, delete: false },
    maintenance: { view: true, add: false, edit: false, delete: false },
    repairs: { view: true, add: true, edit: false, delete: false },
    staff: { view: true, add: false, edit: false, delete: false },
    units: { view: true, add: false, edit: false, delete: false },
    licenses: { view: true, add: false, edit: false, delete: false },
    reports: { view: true },
    settings: { view: true },
    account: { view: true },
    'usage-history': { view: false },
    permissions: { view: false },
    roles: { view: false },
    'database-explorer': { view: false },
};

const unitManagerPermissions: Permissions = {
    ...employeePermissions,
    equipment: { view: true, add: true, edit: true, delete: false },
    allocation: { view: true, add: true, edit: false, delete: false },
    transfers: { view: true, add: true, edit: false, delete: false },
    maintenance: { view: true, add: true, edit: true, delete: false },
    repairs: { view: true, add: true, edit: true, delete: false },
};

let rolesData: Role[] = [
    { 
        id: 'role-1', 
        name: UserRole.ADMIN, 
        description: 'Quản trị viên hệ thống, có toàn quyền truy cập.', 
        permissions: adminPermissions,
        isBuiltIn: true 
    },
    { 
        id: 'role-2', 
        name: UserRole.EMPLOYEE, 
        description: 'Cán bộ nhân viên, có quyền xem và yêu cầu cơ bản.', 
        permissions: employeePermissions,
        isBuiltIn: true 
    },
    { 
        id: 'role-3', 
        name: UserRole.UNIT_MANAGER, 
        description: 'Trưởng đơn vị, có quyền quản lý tài sản và nhân sự trong đơn vị của mình.', 
        permissions: unitManagerPermissions,
        isBuiltIn: true 
    },
];

let staffDataSeed: Staff[] = [
    { id: '1', employeeId: 'admin', fullName: 'Admin Quản trị', email: 'admin@itcore.vn', phone: '0912345678', unit: 'Ban Giám đốc', position: 'Quản trị hệ thống', role: UserRole.ADMIN, joinDate: '2020-01-15', status: 'Đang hoạt động', gender: Gender.MALE, permissions: adminPermissions, mustChangePassword: false },
    { id: '2', employeeId: 'KD001', fullName: 'Nguyễn Văn An', email: 'annv@itcore.vn', phone: '0987654321', unit: 'Phòng Kinh doanh', position: 'Nhân viên Kinh doanh', role: UserRole.EMPLOYEE, joinDate: '2021-03-20', status: 'Đang hoạt động', gender: Gender.MALE, permissions: { ...employeePermissions, equipment: { view: true, add: true, edit: true, delete: false } }, mustChangePassword: true },
    { id: '3', employeeId: 'MKT002', fullName: 'Trần Thị Bình', email: 'binhtt@itcore.vn', phone: '0905123456', unit: 'Phòng Marketing', position: 'Trưởng phòng Marketing', role: UserRole.EMPLOYEE, joinDate: '2019-07-11', status: 'Đang hoạt động', gender: Gender.FEMALE, permissions: { ...employeePermissions }, mustChangePassword: true },
    { id: '4', employeeId: 'NS003', fullName: 'Lê Thị Cẩm', email: 'camlt@itcore.vn', phone: '0934567890', unit: 'Phòng Nhân sự', position: 'Chuyên viên Tuyển dụng', role: UserRole.EMPLOYEE, joinDate: '2022-11-01', status: 'Đang hoạt động', gender: Gender.FEMALE, permissions: { ...employeePermissions }, mustChangePassword: true },
];

const unitsForSeed = ['Phòng Kinh doanh', 'Phòng Marketing', 'Phòng Nhân sự', 'Phòng Kỹ thuật', 'Phòng Kế toán', 'Ban Giám đốc'];
const positionsForSeed = ['Nhân viên', 'Chuyên viên', 'Trưởng nhóm', 'Phó phòng', 'Trưởng phòng'];
const gendersForSeed = [Gender.MALE, Gender.FEMALE];
const statusesForSeed = ['Đang hoạt động', 'Đang hoạt động', 'Đang hoạt động', 'Đang hoạt động', 'Đã nghỉ việc'] as ('Đang hoạt động' | 'Đã nghỉ việc')[];
const firstNames = ['Anh', 'Bảo', 'Châu', 'Dũng', 'Giang', 'Hà', 'Huy', 'Khánh', 'Linh', 'Minh', 'Ngọc', 'Phúc', 'Quân', 'Sơn', 'Thảo', 'Trang', 'Tú', 'Vân', 'Xuân', 'Yến'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Phan', 'Trương', 'Bùi', 'Đặng', 'Đỗ'];

for (let i = 5; i <= 50; i++) {
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const midName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const fullName = `${lastName} ${midName} ${firstName}`;
    const email = `${firstName.toLowerCase()}${i}@itcore.vn`;
    
    staffDataSeed.push({
        id: `${i}`,
        employeeId: `NV${i.toString().padStart(3, '0')}`,
        fullName: fullName,
        email: email,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        unit: unitsForSeed[Math.floor(Math.random() * unitsForSeed.length)],
        position: positionsForSeed[Math.floor(Math.random() * positionsForSeed.length)],
        role: UserRole.EMPLOYEE,
        joinDate: `202${Math.floor(Math.random() * 4)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
        status: statusesForSeed[Math.floor(Math.random() * statusesForSeed.length)],
        gender: gendersForSeed[Math.floor(Math.random() * gendersForSeed.length)],
        permissions: { ...employeePermissions },
        mustChangePassword: true,
    });
}

staffDataSeed.push({ 
  id: '51', 
  employeeId: 'QL001', 
  fullName: 'Phan Thị Dung', 
  email: 'dungpt@itcore.vn', 
  phone: '0911223344', 
  unit: 'Phòng Kinh doanh', // Manager of this unit
  position: 'Trưởng phòng Kinh doanh', 
  role: UserRole.UNIT_MANAGER, // The new role
  joinDate: '2018-05-10', 
  status: 'Đang hoạt động', 
  gender: Gender.FEMALE,
  permissions: { ...unitManagerPermissions },
  mustChangePassword: true,
});


let staffData: Staff[] = staffDataSeed;

let equipmentTypesData: EquipmentType[] = [
    { id: '1', name: 'Laptop', prefix: 'LT', category: 'Máy tính', notes: 'Máy tính xách tay cá nhân' },
    { id: '2', name: 'Desktop', prefix: 'DT', category: 'Máy tính', notes: 'Máy tính để bàn' },
    { id: '3', name: 'Màn hình', prefix: 'MH', category: 'Thiết bị ngoại vi', notes: 'Màn hình máy tính các loại' },
    { id: '4', name: 'Switch', prefix: 'SW', category: 'Thiết bị mạng', notes: 'Thiết bị chuyển mạch' },
    { id: '5', name: 'Access Point', prefix: 'AP', category: 'Thiết bị mạng', notes: 'Thiết bị phát sóng Wifi' },
    { id: '6', name: 'Router', prefix: 'RT', category: 'Thiết bị mạng', notes: 'Thiết bị định tuyến' },
    { id: '7', name: 'Firewall', prefix: 'FW', category: 'Thiết bị mạng', notes: 'Thiết bị tường lửa' },
    { id: '8', name: 'Server', prefix: 'SRV', category: 'Máy tính', notes: 'Máy chủ vật lý' },
];

let manufacturersData: Manufacturer[] = [
    { id: '1', name: 'Dell', contactPerson: 'Nguyễn Văn A', phone: '028-12345678', website: 'https://www.dell.com' },
    { id: '2', name: 'HP', contactPerson: 'Trần Thị B', phone: '028-87654321', website: 'https://www.hp.com' },
    { id: '3', name: 'Apple', contactPerson: 'Lê Văn C', phone: '028-11223344', website: 'https://www.apple.com' },
    { id: '4', name: 'Cisco', contactPerson: 'Phạm Thị D', phone: '028-55667788', website: 'https://www.cisco.com' },
];

let unitsData: Unit[] = [
    { id: '1', name: 'Phòng Công nghệ thông tin', manager: '', description: 'Quản lý hạ tầng CNTT của công ty.' },
    { id: '2', name: 'Phòng Kinh doanh', manager: 'Phan Thị Dung', description: 'Chịu trách nhiệm về hoạt động kinh doanh và bán hàng.' },
    { id: '3', name: 'Phòng Marketing', manager: 'Trần Thị Bình', description: 'Thực hiện các chiến dịch quảng bá sản phẩm.' },
    { id: '4', name: 'Phòng Nhân sự', manager: 'Phạm Văn F', description: 'Quản lý các vấn đề về nhân sự và tuyển dụng.' },
    { id: '5', name: 'Phòng Kỹ thuật', manager: 'Nguyễn Văn An', description: 'Phát triển và bảo trì sản phẩm.' },
    { id: '6', name: 'Phòng Kế toán', manager: 'Lê Thị Cẩm', description: 'Quản lý tài chính công ty.' },
    { id: '7', name: 'Ban Giám đốc', manager: 'Admin Quản trị', description: 'Ban lãnh đạo công ty.' },
];

let itEquipmentData: ITEquipment[] = [
    { id: '1', assetTag: 'LT-2023-001', deviceName: 'Dell Latitude 7420', deviceType: 'Laptop', serialNumber: 'SN12345DELL', assignedTo: 'Nguyễn Văn An', unit: 'Phòng Kinh doanh', status: EquipmentStatus.IN_USE, purchaseDate: '2023-01-10', warrantyEndDate: '2025-01-10', supplier: 'Dell', operatingSystem: 'Windows 11 Pro', ipAddress: '192.168.1.101' },
    { id: '2', assetTag: 'DT-2023-001', deviceName: 'HP EliteDesk 800 G9', deviceType: 'Desktop', serialNumber: 'SN67890HP', assignedTo: 'Trần Thị Bình', unit: 'Phòng Marketing', status: EquipmentStatus.IN_USE, purchaseDate: '2023-02-15', warrantyEndDate: '2024-02-15', supplier: 'HP', operatingSystem: 'Windows 11 Pro', ipAddress: '192.168.1.102' },
    { id: '3', assetTag: 'LT-2023-002', deviceName: 'MacBook Pro 14"', deviceType: 'Laptop', serialNumber: 'SNAPPLEMAC01', assignedTo: 'Lê Thị Cẩm', unit: 'Phòng Nhân sự', status: EquipmentStatus.IN_USE, purchaseDate: '2023-03-20', warrantyEndDate: '2026-03-20', supplier: 'Apple', operatingSystem: 'macOS Sonoma', ipAddress: '192.168.1.103' },
    { id: '4', assetTag: 'MH-2022-001', deviceName: 'Dell UltraSharp U2721DE', deviceType: 'Màn hình', serialNumber: 'SNDELLMON01', assignedTo: 'Trần Thị Bình', unit: 'Phòng Marketing', status: EquipmentStatus.IN_USE, purchaseDate: '2022-05-12', warrantyEndDate: '2023-05-12', supplier: 'Dell', operatingSystem: '', ipAddress: '' },
    { id: '5', assetTag: 'SW-2024-001', deviceName: 'Cisco Catalyst 9200', deviceType: 'Switch', serialNumber: 'SNCISCOSW01', assignedTo: 'Admin Quản trị', unit: 'Ban Giám đốc', status: EquipmentStatus.AVAILABLE, purchaseDate: '2024-01-05', warrantyEndDate: '2027-01-05', supplier: 'Cisco', operatingSystem: 'Cisco IOS XE', ipAddress: '192.168.1.254' },
    { id: '6', assetTag: 'LT-2021-001', deviceName: 'Lenovo ThinkPad T14', deviceType: 'Laptop', serialNumber: 'SNLENOVO01', assignedTo: 'Lê Thị Cẩm', unit: 'Phòng Nhân sự', status: EquipmentStatus.IN_REPAIR, purchaseDate: '2021-08-30', warrantyEndDate: '2024-08-30', supplier: 'Lenovo', operatingSystem: 'Windows 10 Pro', ipAddress: '' },
    { id: '7', assetTag: 'SRV-2022-001', deviceName: 'Server Dell PowerEdge', deviceType: 'Server', serialNumber: 'SNDELLSRV01', assignedTo: 'Admin Quản trị', unit: 'Ban Giám đốc', status: EquipmentStatus.IN_USE, purchaseDate: '2022-01-01', warrantyEndDate: '2025-01-01', supplier: 'Dell', operatingSystem: 'Windows Server 2022', ipAddress: '192.168.1.10' },
];

let licensesData: License[] = [
    { id: '1', softwareName: 'Microsoft 365 Business Standard', productKey: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', totalSeats: 50, assignedSeats: 45, status: LicenseStatus.ACTIVE },
    { id: '2', softwareName: 'Adobe Creative Cloud', productKey: 'YYYYY-YYYYY-YYYYY-YYYYY-YYYYY', purchaseDate: '2023-06-15', expiryDate: '2024-06-15', totalSeats: 10, assignedSeats: 8, status: LicenseStatus.ACTIVE },
    { id: '3', softwareName: 'Windows Server 2022', productKey: 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ', purchaseDate: '2023-03-10', expiryDate: '2028-03-10', totalSeats: 1, assignedSeats: 1, status: LicenseStatus.ACTIVE },
    { id: '4', softwareName: 'Old Antivirus Pro', productKey: 'AAAAA-AAAAA-AAAAA-AAAAA-AAAAA', purchaseDate: '2022-05-20', expiryDate: '2023-05-20', totalSeats: 50, assignedSeats: 50, status: LicenseStatus.EXPIRED },
];

let allocationsData: Allocation[] = [
    { id: '1', assetName: 'Dell Latitude 7420', staffName: 'Nguyễn Văn An', allocationDate: '2023-01-12', returnDate: '', status: AllocationStatus.ALLOCATED },
    { id: '2', assetName: 'HP EliteDesk 800 G9', staffName: 'Trần Thị Bình', allocationDate: '2023-02-16', returnDate: '', status: AllocationStatus.ALLOCATED },
    { id: '3', assetName: 'Old Laptop', staffName: 'Nhân viên cũ', allocationDate: '2021-05-10', returnDate: '2023-01-05', status: AllocationStatus.RETURNED },
    { id: '4', assetName: 'Màn hình Dell 24"', staffName: 'Lê Thị Cẩm', allocationDate: '2024-07-28', returnDate: '', status: AllocationStatus.PENDING },
    { id: '5', assetName: 'Lenovo ThinkPad T14', staffName: 'Nguyễn Văn An', allocationDate: '2024-07-25', returnDate: '', status: AllocationStatus.REJECTED },
];

let maintenanceData: Maintenance[] = [
    { id: '1', assetName: 'Lenovo ThinkPad T14', maintenanceType: 'Sửa chữa', startDate: '2024-07-20', endDate: '2024-07-28', status: MaintenanceStatus.IN_PROGRESS, notes: 'Lỗi màn hình xanh', unit: 'Phòng Nhân sự' },
    { id: '2', assetName: 'Cisco Catalyst 9200', maintenanceType: 'Nâng cấp', startDate: '2024-08-01', endDate: '2024-08-01', status: MaintenanceStatus.SCHEDULED, notes: 'Nâng cấp firmware', unit: 'Phòng Công nghệ thông tin' },
    { id: '3', assetName: 'Server Dell PowerEdge', maintenanceType: 'Bảo trì định kỳ', startDate: '2024-06-30', endDate: '2024-06-30', status: MaintenanceStatus.COMPLETED, notes: 'Vệ sinh, kiểm tra phần cứng', unit: 'Phòng Công nghệ thông tin' },
];

let transfersData: Transfer[] = [
    { id: '1', assetName: 'Dell Latitude 5400', fromStaff: 'Nhân viên A', toStaff: 'Nhân viên B', transferDate: '2023-11-15', notes: 'Luân chuyển do thay đổi vị trí công việc' },
    { id: '2', assetName: 'Màn hình Dell 24"', fromStaff: 'Kho', toStaff: 'Trần Thị Bình', transferDate: '2023-02-16', notes: 'Cấp phát màn hình thứ 2' },
];

let usageHistoryData: UsageHistory[] = [
    { id: '1', timestamp: '2024-07-26 10:30:15', user: 'Admin Quản trị', action: 'Tạo mới', asset: 'SW-2024-001', details: 'Thêm mới thiết bị Switch Cisco Catalyst 9200' },
    { id: '2', timestamp: '2024-07-25 14:05:00', user: 'Admin Quản trị', action: 'Cập nhật', asset: 'LT-2023-001', details: 'Thay đổi trạng thái từ Sẵn sàng sang Đang sử dụng' },
    { id: '3', timestamp: '2024-07-25 09:15:22', user: 'Lê Thị Cẩm', action: 'Yêu cầu', asset: 'LT-2023-002', details: 'Yêu cầu cài đặt phần mềm Adobe Photoshop' },
];

const API_DELAY = 200; // Reduced delay for better UX

const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), API_DELAY);
    });
};

// Generic CRUD operations
const createApiCRUD = <T extends { id: string }>(dataStore: () => T[], setDataStore: (data: T[]) => void) => ({
    getAll: () => simulateRequest(dataStore()),
    getById: (id: string) => simulateRequest(dataStore().find(item => item.id === id) || null),
    add: (item: Omit<T, 'id'>) => {
        const currentData = dataStore();
        const newItem = { ...item, id: Date.now().toString() } as T;
        setDataStore([newItem, ...currentData]);
        return simulateRequest(newItem);
    },
    update: (id: string, updates: Partial<T>) => {
        const currentData = dataStore();
        const index = currentData.findIndex(item => item.id === id);
        if (index > -1) {
            currentData[index] = { ...currentData[index], ...updates };
            setDataStore([...currentData]);
            return simulateRequest(currentData[index]);
        }
        return Promise.reject(new Error('Item not found'));
    },
    remove: (id: string) => {
        const currentData = dataStore();
        const index = currentData.findIndex(item => item.id === id);
        if (index > -1) {
            const [removedItem] = currentData.splice(index, 1);
            setDataStore([...currentData]);
            return simulateRequest(removedItem);
        }
        return Promise.reject(new Error('Item not found'));
    },
});

export const globalApi = {
    getAllData: () => simulateRequest({
        staff: staffData,
        itEquipment: itEquipmentData,
        equipmentTypes: equipmentTypesData,
        manufacturers: manufacturersData,
        units: unitsData,
        licenses: licensesData,
        allocations: allocationsData,
        maintenance: maintenanceData,
        transfers: transfersData,
        usageHistory: usageHistoryData,
        roles: rolesData,
    })
};

// Staff API with cascading updates
const staffApiCRUD = createApiCRUD(() => staffData, (d) => staffData = d);
export const staffApi = {
    ...staffApiCRUD,
    add: (item: Omit<Staff, 'id'>) => {
        const roleName = item.role || UserRole.EMPLOYEE;
        const roleTemplate = rolesData.find(r => r.name === roleName);
        const defaultPermissions = roleTemplate ? { ...roleTemplate.permissions } : {};
        const newItem = { 
            ...item, 
            id: Date.now().toString(),
            permissions: item.permissions || defaultPermissions,
            mustChangePassword: true,
        } as Staff;
        staffData.unshift(newItem);
        return simulateRequest(newItem);
    },
    update: (id: string, updates: Partial<Staff>) => {
        const originalStaff = staffData.find(s => s.id === id);
        if (!originalStaff) return Promise.reject(new Error('Staff not found'));
        const originalFullName = originalStaff.fullName;

        const index = staffData.findIndex(item => item.id === id);
        staffData[index] = { ...staffData[index], ...updates };
        const updatedStaff = staffData[index];

        if (updates.fullName && updates.fullName !== originalFullName) {
            itEquipmentData = itEquipmentData.map(eq => eq.assignedTo === originalFullName ? { ...eq, assignedTo: updatedStaff.fullName } : eq);
            unitsData = unitsData.map(u => u.manager === originalFullName ? { ...u, manager: updatedStaff.fullName } : u);
            allocationsData = allocationsData.map(a => a.staffName === originalFullName ? { ...a, staffName: updatedStaff.fullName } : a);
            transfersData = transfersData.map(t => {
                if (t.fromStaff === originalFullName) t.fromStaff = updatedStaff.fullName;
                if (t.toStaff === originalFullName) t.toStaff = updatedStaff.fullName;
                return t;
            });
        }
        return simulateRequest(updatedStaff);
    },
    remove: (id: string) => {
        const index = staffData.findIndex(item => item.id === id);
        if (index > -1) {
            const [removedStaff] = staffData.splice(index, 1);
            itEquipmentData = itEquipmentData.map(eq => eq.assignedTo === removedStaff.fullName ? { ...eq, assignedTo: '' } : eq);
            unitsData = unitsData.map(u => u.manager === removedStaff.fullName ? { ...u, manager: '' } : u);
            return simulateRequest(removedStaff);
        }
        return Promise.reject(new Error('Staff not found'));
    },
    changePassword: (staffId: string, newPassword: string) => {
        const index = staffData.findIndex(item => item.id === staffId);
        if (index > -1) {
            staffData[index].mustChangePassword = false;
            return simulateRequest(staffData[index]);
        }
        return Promise.reject(new Error('Staff member not found'));
    }
};

// Equipment Types API with cascading updates
const equipmentTypesApiCRUD = createApiCRUD(() => equipmentTypesData, d => equipmentTypesData = d);
export const equipmentTypesApi = {
    ...equipmentTypesApiCRUD,
    update: (id: string, updates: Partial<EquipmentType>) => {
        const originalType = equipmentTypesData.find(t => t.id === id);
        if (!originalType) return Promise.reject(new Error('Type not found'));
        const originalName = originalType.name;
        
        const index = equipmentTypesData.findIndex(item => item.id === id);
        equipmentTypesData[index] = { ...equipmentTypesData[index], ...updates };
        const updatedType = equipmentTypesData[index];

        if (updates.name && updates.name !== originalName) {
            itEquipmentData = itEquipmentData.map(eq => eq.deviceType === originalName ? { ...eq, deviceType: updatedType.name } : eq);
        }
        return simulateRequest(updatedType);
    }
};

// Units API with cascading updates
const unitsApiCRUD = createApiCRUD(() => unitsData, d => unitsData = d);
export const unitsApi = {
    ...unitsApiCRUD,
    update: (id: string, updates: Partial<Unit>) => {
        const originalUnit = unitsData.find(u => u.id === id);
        if (!originalUnit) return Promise.reject(new Error('Unit not found'));
        const originalName = originalUnit.name;

        const index = unitsData.findIndex(item => item.id === id);
        unitsData[index] = { ...unitsData[index], ...updates };
        const updatedUnit = unitsData[index];

        if (updates.name && updates.name !== originalName) {
            staffData = staffData.map(s => s.unit === originalName ? { ...s, unit: updatedUnit.name } : s);
            itEquipmentData = itEquipmentData.map(eq => eq.unit === originalName ? { ...eq, unit: updatedUnit.name } : eq);
            maintenanceData = maintenanceData.map(m => m.unit === originalName ? { ...m, unit: updatedUnit.name } : m);
        }
        return simulateRequest(updatedUnit);
    }
};

export const manufacturersApi = createApiCRUD(() => manufacturersData, d => manufacturersData = d);
export const itEquipmentApi = createApiCRUD(() => itEquipmentData, d => itEquipmentData = d);
export const licensesApi = createApiCRUD(() => licensesData, d => licensesData = d);
export const allocationsApi = createApiCRUD(() => allocationsData, d => allocationsData = d);
export const maintenanceApi = createApiCRUD(() => maintenanceData, d => maintenanceData = d);
export const transfersApi = createApiCRUD(() => transfersData, d => transfersData = d);
export const usageHistoryApi = createApiCRUD(() => usageHistoryData, d => usageHistoryData = d);

export const rolesApi = {
    ...createApiCRUD(() => rolesData, d => rolesData = d),
    update: (id: string, updates: Partial<Role>) => {
        const index = rolesData.findIndex(role => role.id === id);
        if (index === -1) return Promise.reject(new Error('Role not found'));

        const originalRole = { ...rolesData[index] };
        const updatedRole = { ...originalRole, ...updates };
        rolesData[index] = updatedRole;

        const permissionsChanged = updates.permissions && JSON.stringify(updates.permissions) !== JSON.stringify(originalRole.permissions);
        const nameChanged = updates.name && updates.name !== originalRole.name;

        if (permissionsChanged || nameChanged) {
            staffData = staffData.map(staff => {
                if (staff.role === originalRole.name) {
                    const newStaffData = { ...staff };
                    if (permissionsChanged) newStaffData.permissions = { ...updatedRole.permissions };
                    if (nameChanged) newStaffData.role = updatedRole.name!;
                    return newStaffData;
                }
                return staff;
            });
        }
        
        return simulateRequest(updatedRole);
    },
};

export const permissionsApi = {
    getStaffWithPermissions: () => staffApi.getAll(),
    updateStaffPermissions: (staffId: string, permissions: Permissions) => staffApi.update(staffId, { permissions }),
};

export const reportsApi = {
    getEquipmentCountByType: (): Promise<{ name: string; value: number }[]> => {
        const counts = itEquipmentData.reduce((acc, item) => {
            acc[item.deviceType] = (acc[item.deviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return simulateRequest(Object.entries(counts).map(([name, value]) => ({ name, value })));
    },
    getLicenseCountByStatus: (): Promise<{ name: string; value: number }[]> => {
        const counts = licensesData.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<LicenseStatus, number>);
        return simulateRequest(Object.entries(counts).map(([name, value]) => ({ name, value })));
    },
    getExpiringWarranties: (days = 90): Promise<ITEquipment[]> => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        const data = itEquipmentData.filter(item => {
            if (!item.warrantyEndDate) return false;
            const expiryDate = new Date(item.warrantyEndDate);
            return expiryDate >= today && expiryDate <= futureDate;
        }).sort((a, b) => new Date(a.warrantyEndDate).getTime() - new Date(b.warrantyEndDate).getTime());
        return simulateRequest(data);
    }
};

export const apiMap: Record<string, any> = {
    staff: staffApi,
    itEquipment: itEquipmentApi,
    equipmentTypes: equipmentTypesApi,
    manufacturers: manufacturersApi,
    units: unitsApi,
    licenses: licensesApi,
    allocations: allocationsApi,
    maintenance: maintenanceApi,
    transfers: transfersApi,
    usageHistory: usageHistoryApi,
    roles: rolesApi,
};