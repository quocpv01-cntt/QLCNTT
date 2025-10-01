import React from 'react';
import { UserRole } from './types';

// Icons from Heroicons (https://heroicons.com/)

const iconProps = { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" };

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v9.75a1.5 1.5 0 001.5 1.5h3.75a1.5 1.5 0 001.5-1.5V15a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v5.25a1.5 1.5 0 001.5 1.5h3.75a1.5 1.5 0 001.5-1.5V10.5M8.25 21V15" /></svg>;
export const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25" /></svg>;
export const ComputerDesktopIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>;
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.106c3.172-3.172 4.254-7.618 4.254-11.217a3.375 3.375 0 013.375-3.375h.004c1.155 0 2.25.43 3.076 1.155a3.375 3.375 0 01.523 4.637c-.36.44-.79.805-1.265 1.125M15 19.128A2.625 2.625 0 0012.375 21a2.625 2.625 0 00-2.625-1.872" /></svg>;
export const BuildingFactoryIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v1.5H3V3z" /></svg>;
export const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.414-1.414M6.096 15.096l1.414-1.414m.707-8.457l-1.414 1.414M17.904 9.096l-1.414 1.414M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;
export const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12.033m-15.686 0A8.959 8.959 0 003 12.033" /></svg>;
export const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM9 15h.008v.008H9V15zm.008-3h-.008v.008h.008V12zm0 6h-.008v.008h.008V18z" /></svg>;
export const ArrowsRightLeftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>;
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>;
export const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" /></svg>;
export const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.26.716.54.992l.942.942c.47.47.706 1.098.706 1.725v2.592c0 .627-.237 1.255-.707 1.725l-.942.942a1.996 1.996 0 00-.54.992l-.213 1.281c-.09.543-.56.941-1.11.941h-2.593c-.55 0-1.02-.398-1.11-.941l-.213-1.281a1.996 1.996 0 00-.54-.992l-.942-.942a2.43 2.43 0 01-.707-1.725v-2.592c0-.627.237-1.255.707-1.725l.942-.942c.28-.276.477-.618.54-.992l.213-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
export const AdjustmentsHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
export const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 3.329m0 0l6.828 5.66m-6.828-5.66l6.828 5.66m0 0l6.828-5.66m-6.828 5.66L18 3.329m0 0L12 9m6-5.671a42.415 42.415 0 010 10.56m0 0l6 5.66m-6-5.66l-6.828-5.66m6.828 5.66l-6.828-5.66" /></svg>;
export const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75zM9 4.5h.008v.008H9V4.5zm.75 0a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H9.75zM9 9.75h.008v.008H9V9.75zm.75 0a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H9.75zM3.75 9.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H3.75zM15 4.5h.008v.008H15V4.5zm.75 0a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H15.75zM15 9.75h.008v.008H15V9.75zm.75 0a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H15.75zM15 15h.008v.008H15V15zm.75 0a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H15.75zM3.75 15a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H3.75zM9 15h.008v.008H9V15z" /></svg>;
export const QuestionMarkCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;
export const CircleStackIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>;
export const TagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
export const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
export const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
export const TableCellsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3.75 12h16.5M12 3.75v16.5" /></svg>;
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
export const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;
export const QueueListIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...iconProps} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>;


export const NAV_ITEMS = [
    { href: '/dashboard', label: 'Trang chủ', icon: HomeIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'dashboard' },
    {
        label: 'Quản lý Thiết bị',
        icon: CubeIcon,
        href: '#',
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER],
        children: [
            { href: '/equipment', label: 'Thiết bị Công Nghệ', icon: ComputerDesktopIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'equipment' },
            { href: '/equipment-types', label: 'Loại thiết bị', icon: ComputerDesktopIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'equipment-types' },
            { href: '/manufacturers', label: 'Nhà sản xuất', icon: BuildingFactoryIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'manufacturers' },
            { href: '/network', label: 'Thiết bị Mạng', icon: GlobeAltIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'network' },
        ],
    },
    {
        label: 'Quản lý Cấp phát',
        icon: ClipboardDocumentListIcon,
        href: '#',
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
        children: [
            { href: '/allocation', label: 'Lịch sử Cấp phát', icon: ClipboardDocumentListIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'allocation' },
            { href: '/transfers', label: 'Điều chuyển Thiết bị', icon: ArrowsRightLeftIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'transfers' },
        ],
    },
    {
        label: 'Quản lý Công tác',
        icon: WrenchScrewdriverIcon,
        href: '#',
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
        children: [
            { href: '/maintenance', label: 'Lịch sử Bảo trì', icon: WrenchScrewdriverIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'maintenance' },
            { href: '/repairs', label: 'Yêu cầu Sửa chữa', icon: WrenchScrewdriverIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'repairs' },
        ],
    },
     {
        label: 'Quản lý Cán bộ',
        icon: UsersIcon,
        href: '#',
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER],
        children: [
            { href: '/staff', label: 'Danh sách Cán bộ', icon: UsersIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'staff' },
            { href: '/units', label: 'Danh sách Đơn vị', icon: BuildingFactoryIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.UNIT_MANAGER], moduleKey: 'units' },
        ],
    },
    { href: '/licenses', label: 'Bản quyền Phần mềm', icon: KeyIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'licenses' },
    { href: '/reports', label: 'Báo cáo', icon: ChartPieIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'reports' },
    {
        href: '#',
        label: 'Cài đặt',
        icon: Cog6ToothIcon,
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
        children: [
            { href: '/settings', label: 'Cài đặt chung', icon: AdjustmentsHorizontalIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'settings' },
            { href: '/usage-history', label: 'Lịch sử sử dụng', icon: ClockIcon, roles: [UserRole.ADMIN, UserRole.EMPLOYEE], moduleKey: 'usage-history' },
            { href: '/permissions', label: 'Phân quyền Người dùng', icon: ShieldCheckIcon, roles: [UserRole.ADMIN], moduleKey: 'permissions' },
            { href: '/roles', label: 'Quản lý Vai trò', icon: TagIcon, roles: [UserRole.ADMIN], moduleKey: 'roles' },
            { href: '/database-explorer', label: 'Quản lý Dữ liệu', icon: CircleStackIcon, roles: [UserRole.ADMIN], moduleKey: 'database-explorer' },
        ]
    },
];