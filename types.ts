// types.ts

import React, { useContext } from 'react';

export type PermissionActions = {
  view?: boolean;
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
};

export type Permissions = {
  [moduleKey: string]: PermissionActions;
};

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
    UNIT_MANAGER = 'UNIT_MANAGER',
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permissions;
    isBuiltIn?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions?: Permissions;
    unit?: string;
}

export interface AuthContextType {
    user: User | null;
    login: (employeeId: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export interface StatCardData {
    title: string;
    value: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    change: string;
    changeType: 'increase' | 'decrease';
}

export enum EquipmentStatus {
    AVAILABLE = 'Sẵn sàng',
    IN_USE = 'Đang sử dụng',
    IN_REPAIR = 'Đang sửa chữa',
    RETIRED = 'Đã thanh lý',
    LOST = 'Thất lạc',
}

export interface ITEquipment {
    id: string;
    assetTag: string;
    deviceName: string;
    deviceType: string;
    serialNumber: string;
    assignedTo: string;
    status: EquipmentStatus;
    purchaseDate: string;
    warrantyEndDate: string;
    supplier: string;
    operatingSystem: string;
    ipAddress: string;
    notes?: string;
    unit?: string;
}

export interface EquipmentType {
    id: string;
    name: string;
    prefix: string;
    category: string;
    notes: string;
}

export enum Gender {
    MALE = 'Nam',
    FEMALE = 'Nữ',
    OTHER = 'Khác',
}

export interface Staff {
    id: string;
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    unit: string; // Đơn vị/Phòng ban
    position: string; // Chức vụ
    role: string;
    joinDate: string;
    status: 'Đang hoạt động' | 'Đã nghỉ việc';
    gender: Gender;
    permissions?: Permissions;
    mustChangePassword?: boolean;
}

export interface Manufacturer {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    website: string;
}

export interface Unit {
    id: string;
    name: string;
    manager: string;
    description: string;
}

export enum LicenseStatus {
    ACTIVE = 'Đang hoạt động',
    EXPIRED = 'Đã hết hạn',
    INACTIVE = 'Không hoạt động',
}

export interface License {
    id: string;
    softwareName: string;
    productKey: string;
    purchaseDate: string;
    expiryDate: string;
    totalSeats: number;
    assignedSeats: number;
    status: LicenseStatus;
}

export enum AllocationStatus {
    ALLOCATED = 'Đã cấp phát',
    RETURNED = 'Đã thu hồi',
    PENDING = 'Chờ phê duyệt',
    REJECTED = 'Bị từ chối',
}


export interface Allocation {
    id: string;
    assetName: string;
    staffName: string;
    allocationDate: string;
    returnDate: string;
    status: AllocationStatus;
}

export enum MaintenanceStatus {
    SCHEDULED = 'Đã lên lịch',
    IN_PROGRESS = 'Đang tiến hành',
    COMPLETED = 'Đã hoàn thành',
    CANCELLED = 'Đã hủy',
}

export interface Maintenance {
    id: string;
    assetName: string;
    maintenanceType: 'Sửa chữa' | 'Nâng cấp' | 'Bảo trì định kỳ';
    startDate: string;
    endDate: string;
    status: MaintenanceStatus;
    notes: string;
    unit?: string;
}

export interface Transfer {
    id: string;
    assetName: string;
    fromStaff: string;
    toStaff: string;
    transferDate: string;
    notes: string;
}

export interface UsageHistory {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    asset: string;
    details: string;
}