import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext, UserRole, Staff } from '../types';
import { staffApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import { NAV_ITEMS } from '../constants';
import { ImageUploadModal } from '../components/ui/ImageUploadModal';
import { useToast } from '../contexts/ToastContext';

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const AVATAR_STORAGE_KEY_PREFIX = 'customUserAvatar_v1_';

const InfoField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-md text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
     <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-3 mb-4">
            {title}
        </h3>
        {children}
    </div>
);

const AccountPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const { addToast } = useToast();
    const user = auth?.user;

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [avatarSrc, setAvatarSrc] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            staffApi.getById(user.id)
                .then(data => {
                    if (data) {
                        setStaffMember(data);
                        const storageKey = `${AVATAR_STORAGE_KEY_PREFIX}${user.id}`;
                        const savedAvatar = localStorage.getItem(storageKey);
                        setAvatarSrc(savedAvatar || `https://i.pravatar.cc/150?u=${data.email}`);
                    }
                })
                .catch(() => addToast('Không thể tải thông tin tài khoản.', 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [user, addToast]);
    
    const handleSaveAvatar = (newImage: string) => {
        if (!user) return;
        
        const storageKey = `${AVATAR_STORAGE_KEY_PREFIX}${user.id}`;
        localStorage.setItem(storageKey, newImage);
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: newImage }));
        
        setAvatarSrc(newImage);
        addToast('Cập nhật ảnh đại diện thành công!', 'success');
        setIsAvatarModalOpen(false); // Close the modal
    };

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Tài khoản" />
                <p>Đang tải thông tin người dùng...</p>
            </div>
        );
    }
    
    if (!user || !staffMember) {
        return (
            <div>
                <PageHeader title="Lỗi" />
                <p>Không tìm thấy thông tin chi tiết cho tài khoản này.</p>
            </div>
        );
    }
    
    // Fix: Use reduce to flatten the nav items to avoid complex type inference issues with flatMap.
    const flattenedNavItems = NAV_ITEMS.reduce<any[]>((acc, item) => {
        if (item.children) {
            acc.push(...item.children);
        } else {
            acc.push(item);
        }
        return acc;
    }, []);
    const permissionModuleMap = flattenedNavItems.reduce((acc, item) => {
        if (item.moduleKey && item.href !== '#') {
            acc[item.moduleKey] = item.label;
        }
        return acc;
    }, {} as Record<string, string>);


    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

    const renderPermissions = () => {
        if (user.role === UserRole.ADMIN) {
            return <p className="text-gray-600 dark:text-gray-400">Quản trị viên có toàn quyền truy cập hệ thống.</p>;
        }
        const userPermissions = user.permissions || {};
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                {Object.entries(permissionModuleMap)
                    .filter(([moduleKey]) => !['dashboard', 'settings', 'account'].includes(moduleKey))
                    .map(([moduleKey, label]) => (
                        <div key={moduleKey} className="flex items-center">
                            {userPermissions[moduleKey]?.view ? <CheckIcon /> : <XIcon />}
                            <span className="ml-2 text-gray-700 dark:text-gray-300">{label as string}</span>
                        </div>
                    ))
                }
            </div>
        );
    };

    return (
        <div>
            <PageHeader title="Thông tin Tài khoản" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg text-center">
                        <div className="relative group w-32 h-32 mx-auto mb-4">
                            <img 
                                className="w-full h-full rounded-full object-cover border-4 border-primary-500/80 shadow-lg"
                                src={avatarSrc} 
                                alt={`Avatar of ${staffMember.fullName}`}
                            />
                            <button 
                                onClick={() => setIsAvatarModalOpen(true)}
                                className="absolute inset-0 w-full h-full bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Change avatar"
                            >
                                <CameraIcon className="w-8 h-8" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{staffMember.fullName}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{staffMember.position}</p>
                        <p className={`mt-3 px-3 py-1 inline-block text-xs font-semibold rounded-full ${staffMember.status === 'Đang hoạt động' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {staffMember.status}
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title="Thông tin cá nhân">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <InfoField label="Email" value={staffMember.email} />
                            <InfoField label="Số điện thoại" value={staffMember.phone} />
                            <InfoField label="Giới tính" value={staffMember.gender} />
                        </div>
                    </InfoCard>
                    
                    <InfoCard title="Thông tin công việc">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <InfoField label="Mã cán bộ" value={staffMember.employeeId} />
                            <InfoField label="Đơn vị" value={staffMember.unit} />
                            <InfoField label="Ngày vào làm" value={staffMember.joinDate} />
                            <InfoField label="Vai trò hệ thống" value={
                                <span className={`font-semibold ${staffMember.role === UserRole.ADMIN ? 'text-primary-500 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {staffMember.role}
                                </span>
                            } />
                        </div>
                    </InfoCard>

                    <InfoCard title="Quyền truy cập hệ thống">
                        {renderPermissions()}
                    </InfoCard>
                </div>
            </div>
            
            <ImageUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleSaveAvatar}
                title="Thay đổi ảnh đại diện"
                aspectRatioClass="aspect-square"
            />
        </div>
    );
};

export default AccountPage;