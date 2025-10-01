import React, { useState, useEffect, useContext } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useTheme, colorPalettes } from '../contexts/ThemeContext';
import { AuthContext, UserRole } from '../types';
import { ImageUploadModal } from '../components/ui/ImageUploadModal';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const LOGO_STORAGE_KEY = 'customAppLogo_v1';
const defaultLogoImageData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN2b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFFNEVEOzsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDEwMCkiPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjkwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZzQpIiBzdHJva2Utd2lkdGg9IjEwIiAvPgogICAgPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KICAgICAgPGNpcmNsZSBjeD0iMCIgY3k9Ii01MCIgcj0iMTUiIGZpbGw9IiNmZmYiLz4KICAgICAgPGNpcmNsZSBjeD0iNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgICA8Y2lyY2xlIGN4PSItNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+";

const LOGIN_BG_STORAGE_KEY = 'customLoginBackground_v1';
const defaultLoginPageBackgroundData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAJgAmADASIAAhEBAxEB/8QAGwABAQADAQEBAAAAAAAAAAAAAAECBgcDBAX/xAAyEAABBQEBAQEBAQEBAQAAAAAAAQIDBAUREhMhFDEyQXGRIjRRYnWhwUJDgYIzkqL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+iQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-";
const APP_BG_STORAGE_KEY = 'customAppBackground_v1';
const NOTIFICATION_EMAIL_KEY = 'notificationEmail_v1';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-white/10 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {title}
        </h3>
        <div className="p-4 sm:p-6">
            {children}
        </div>
    </div>
);

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Chế độ tối</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bật hoặc tắt giao diện tối cho ứng dụng.</p>
            </div>
            <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    id="theme-toggle"
                    className="sr-only peer"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
        </div>
    );
};

const ColorPalettePicker = () => {
    const { primaryColor, setPrimaryColor } = useTheme();

    return (
        <div className="space-y-3">
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Màu sắc chủ đạo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chọn màu sắc nhấn cho các nút, icon và các thành phần khác.</p>
            </div>
            <div className="flex flex-wrap gap-4">
                {Object.entries(colorPalettes).map(([name, palette]) => (
                    <button
                        key={name}
                        onClick={() => setPrimaryColor(name as keyof typeof colorPalettes)}
                        className="flex items-center gap-3 p-2 rounded-lg border-2 transition-colors"
                        style={{ borderColor: name === primaryColor ? `rgb(${palette[500]})` : 'transparent' }}
                    >
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `rgb(${palette[500]})` }}></div>
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

interface CustomizationItemProps {
  title: string;
  description: string;
  onOpenModal: () => void;
  onRemove: () => void;
  isRemovable: boolean;
  previewElement: React.ReactNode;
}

const CustomizationItem: React.FC<CustomizationItemProps> = ({ title, description, onOpenModal, onRemove, isRemovable, previewElement }) => (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div className="flex-grow">
            <p className="font-medium text-gray-800 dark:text-gray-200">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto flex-shrink-0">
            {previewElement}
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onOpenModal}>Thay đổi</Button>
                {isRemovable && (
                    <Button variant="secondary" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50" onClick={onRemove}>Xóa</Button>
                )}
            </div>
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const { addToast } = useToast();
    const { theme, primaryColor } = useTheme();
    const [activeTab, setActiveTab] = useState('interface');

    const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem(LOGO_STORAGE_KEY) || defaultLogoImageData);
    const [loginBgSrc, setLoginBgSrc] = useState(() => localStorage.getItem(LOGIN_BG_STORAGE_KEY) || defaultLoginPageBackgroundData);
    const [appBgSrc, setAppBgSrc] = useState(() => localStorage.getItem(APP_BG_STORAGE_KEY) || '');

    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isLoginBgModalOpen, setIsLoginBgModalOpen] = useState(false);
    const [isAppBgModalOpen, setIsAppBgModalOpen] = useState(false);
    
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isLoginBgPreviewModalOpen, setIsLoginBgPreviewModalOpen] = useState(false);
    const [isLogoPreviewModalOpen, setIsLogoPreviewModalOpen] = useState(false);

    const [notificationEmail, setNotificationEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const [pendingLogo, setPendingLogo] = useState<string | null>(null);
    const [pendingLoginBg, setPendingLoginBg] = useState<string | null>(null);
    const [pendingAppBg, setPendingAppBg] = useState<string | null>(null);
    const [pendingEmail, setPendingEmail] = useState<string>('');

    const [isLogoConfirmOpen, setIsLogoConfirmOpen] = useState(false);
    const [isLoginBgConfirmOpen, setIsLoginBgConfirmOpen] = useState(false);
    const [isAppBgConfirmOpen, setIsAppBgConfirmOpen] = useState(false);
    const [isEmailConfirmOpen, setIsEmailConfirmOpen] = useState(false);
    const [isDefaultConfirmOpen, setIsDefaultConfirmOpen] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem(NOTIFICATION_EMAIL_KEY);
        if (savedEmail) {
            setNotificationEmail(savedEmail);
        }
    }, []);

    const handleSetSystemDefault = () => {
        setIsDefaultConfirmOpen(true);
    };
    
    const handleConfirmSetSystemDefault = () => {
        localStorage.setItem('systemDefaultTheme_v1', theme);
        localStorage.setItem('systemDefaultColor_v1', primaryColor);
        addToast('Đã đặt giao diện mặc định cho toàn hệ thống.', 'success');
        setIsDefaultConfirmOpen(false);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationEmail(e.target.value);
        if (emailError) setEmailError('');
    };

    const handleRequestEmailSave = (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (notificationEmail && !emailRegex.test(notificationEmail)) {
            setEmailError('Định dạng email không hợp lệ.');
            return;
        }
        setPendingEmail(notificationEmail);
        setIsEmailConfirmOpen(true);
    };

    const handleConfirmEmailSave = () => {
        localStorage.setItem(NOTIFICATION_EMAIL_KEY, pendingEmail);
        addToast('Đã lưu email nhận thông báo!', 'success');
        setIsEmailConfirmOpen(false);
    };

    const handleRemoveImage = (storageKey: string, setSrcState: React.Dispatch<React.SetStateAction<string>>, defaultValue: string = '') => {
        localStorage.removeItem(storageKey);
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: null }));
        setSrcState(defaultValue);
        addToast('Đã xóa hình ảnh tùy chỉnh và quay về mặc định.', 'success');
    };

    const handleRequestLogoSave = (imageData: string) => {
        setPendingLogo(imageData);
        setIsLogoModalOpen(false);
        setIsLogoConfirmOpen(true);
    };

    const handleConfirmLogoSave = () => {
        if (pendingLogo) {
            localStorage.setItem(LOGO_STORAGE_KEY, pendingLogo);
            window.dispatchEvent(new StorageEvent('storage', { key: LOGO_STORAGE_KEY, newValue: pendingLogo }));
            setLogoSrc(pendingLogo);
            addToast('Cập nhật logo thành công!', 'success');
        }
        setIsLogoConfirmOpen(false);
        setPendingLogo(null);
    };

    const handleRequestLoginBgSave = (imageData: string) => {
        setPendingLoginBg(imageData);
        setIsLoginBgModalOpen(false);
        setIsLoginBgConfirmOpen(true);
    };
    
    const handleConfirmLoginBgSave = () => {
        if (pendingLoginBg) {
            localStorage.setItem(LOGIN_BG_STORAGE_KEY, pendingLoginBg);
            window.dispatchEvent(new StorageEvent('storage', { key: LOGIN_BG_STORAGE_KEY, newValue: pendingLoginBg }));
            setLoginBgSrc(pendingLoginBg);
            addToast('Cập nhật ảnh nền đăng nhập thành công!', 'success');
        }
        setIsLoginBgConfirmOpen(false);
        setPendingLoginBg(null);
    };

    const handleRequestAppBgSave = (imageData: string) => {
        setPendingAppBg(imageData);
        setIsAppBgModalOpen(false);
        setIsAppBgConfirmOpen(true);
    };

    const handleConfirmAppBgSave = () => {
        if (pendingAppBg) {
            localStorage.setItem(APP_BG_STORAGE_KEY, pendingAppBg);
            window.dispatchEvent(new StorageEvent('storage', { key: APP_BG_STORAGE_KEY, newValue: pendingAppBg }));
            setAppBgSrc(pendingAppBg);
            addToast('Cập nhật ảnh nền ứng dụng thành công!', 'success');
        }
        setIsAppBgConfirmOpen(false);
        setPendingAppBg(null);
    };

    const tabs = [
        { id: 'interface', label: 'Giao diện & Chủ đề' },
        ...(user?.role === UserRole.ADMIN ? [{ id: 'appearance', label: 'Tùy chỉnh Giao diện' }] : []),
        { id: 'account', label: 'Tài khoản & Thông báo' },
        { id: 'about', label: 'Thông tin Ứng dụng' },
    ];

    return (
        <div>
            <PageHeader title="Cài đặt chung" />
            
            <div className="mb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-8">
                {activeTab === 'interface' && (
                    <SettingsCard title="Giao diện & Chủ đề">
                        <ThemeToggle />
                        <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-4"></div>
                        <ColorPalettePicker />

                        {user?.role === UserRole.ADMIN && (
                            <>
                                <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-6"></div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Giao diện Mặc định Toàn hệ thống</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Áp dụng cài đặt chủ đề và màu sắc hiện tại của bạn làm mặc định cho tất cả người dùng mới hoặc những người dùng chưa tùy chỉnh giao diện của họ.
                                    </p>
                                    <Button variant="secondary" onClick={handleSetSystemDefault} className="mt-4">
                                        Đặt làm mặc định
                                    </Button>
                                </div>
                            </>
                        )}
                    </SettingsCard>
                )}

                {activeTab === 'appearance' && user?.role === UserRole.ADMIN && (
                    <SettingsCard title="Tùy chỉnh Giao diện">
                        <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            <CustomizationItem
                                title="Logo Ứng dụng"
                                description="Logo ở thanh bên và trang đăng nhập."
                                onOpenModal={() => setIsLogoModalOpen(true)}
                                onRemove={() => handleRemoveImage(LOGO_STORAGE_KEY, setLogoSrc, defaultLogoImageData)}
                                isRemovable={logoSrc !== defaultLogoImageData}
                                previewElement={
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={logoSrc} alt="Logo hiện tại" className="h-16 w-16 rounded-full object-cover bg-gray-200 dark:bg-gray-700" />
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setIsLogoPreviewModalOpen(true); }} className="text-xs px-3 py-1.5">Xem trước</Button>
                                    </div>
                                }
                            />
                            <CustomizationItem
                                title="Ảnh nền Trang đăng nhập"
                                description="Thay đổi ảnh nền cho trang đăng nhập."
                                onOpenModal={() => setIsLoginBgModalOpen(true)}
                                onRemove={() => handleRemoveImage(LOGIN_BG_STORAGE_KEY, setLoginBgSrc, defaultLoginPageBackgroundData)}
                                isRemovable={loginBgSrc !== defaultLoginPageBackgroundData}
                                previewElement={
                                    <div className="w-full sm:w-64 h-36 rounded-lg bg-gray-200 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${loginBgSrc})` }}>
                                         <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setIsLoginBgPreviewModalOpen(true); }} className="bg-white/30 backdrop-blur-sm">Xem trước</Button>
                                    </div>
                                }
                            />
                            <CustomizationItem
                                title="Ảnh nền Ứng dụng"
                                description="Thay đổi ảnh nền chính của ứng dụng."
                                onOpenModal={() => setIsAppBgModalOpen(true)}
                                onRemove={() => handleRemoveImage(APP_BG_STORAGE_KEY, setAppBgSrc)}
                                isRemovable={!!appBgSrc}
                                previewElement={
                                    <div className="w-full sm:w-64 h-36 rounded-lg bg-gray-200 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-cover bg-center" style={appBgSrc ? { backgroundImage: `url(${appBgSrc})` } : {}}>
                                        {!appBgSrc ? <span className="text-xs text-gray-500 dark:text-gray-400">Chưa có ảnh nền</span> : 
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setIsPreviewModalOpen(true); }} className="bg-white/30 backdrop-blur-sm">Xem trước</Button>}
                                    </div>
                                }
                            />
                        </div>
                    </SettingsCard>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-8">
                        {user?.role === UserRole.ADMIN && (
                            <SettingsCard title="Thông báo">
                                <form onSubmit={handleRequestEmailSave} className="space-y-3">
                                    <div>
                                        <label htmlFor="notification-email" className="font-medium text-gray-800 dark:text-gray-200">Email nhận thông báo</label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cung cấp địa chỉ email để nhận các cảnh báo quan trọng của hệ thống.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start gap-2">
                                        <div className="w-full">
                                            <input
                                                id="notification-email"
                                                type="email"
                                                placeholder="admin@example.com"
                                                value={notificationEmail}
                                                onChange={handleEmailChange}
                                                className={`w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-500/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${emailError ? 'border-red-500' : ''}`}
                                            />
                                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                                        </div>
                                        <Button type="submit">Lưu</Button>
                                    </div>
                                </form>
                            </SettingsCard>
                        )}
                        <SettingsCard title="Tài khoản">
                            {user ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Họ và tên</label>
                                        <input type="text" value={user.name} disabled className="mt-1 w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                        <input type="email" value={user.email} disabled className="mt-1 w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed" />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Không thể tải thông tin người dùng.</p>
                            )}
                        </SettingsCard>
                    </div>
                )}
                
                {activeTab === 'about' && (
                     <SettingsCard title="Thông tin Ứng dụng">
                        <div className="text-gray-600 dark:text-gray-400 space-y-2">
                            <p><strong>Tên ứng dụng:</strong> PHẦN MỀM QUẢN LÝ CÔNG NGHỆ THÔNG TIN</p>
                            <p><strong>Phiên bản:</strong> 1.0.0</p>
                            <p><strong>Mô tả:</strong> Phần mềm toàn diện để quản lý thiết bị công nghệ thông tin của đơn vị.</p>
                        </div>
                    </SettingsCard>
                )}
            </div>
            
            <ImageUploadModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} onSave={handleRequestLogoSave} title="Tải lên Logo mới" aspectRatioClass="aspect-square" />
            <ImageUploadModal isOpen={isLoginBgModalOpen} onClose={() => setIsLoginBgModalOpen(false)} onSave={handleRequestLoginBgSave} title="Tải lên Ảnh nền Đăng nhập mới" aspectRatioClass="aspect-video" />
            <ImageUploadModal isOpen={isAppBgModalOpen} onClose={() => setIsAppBgModalOpen(false)} onSave={handleRequestAppBgSave} title="Tải lên Ảnh nền Ứng dụng mới" aspectRatioClass="aspect-video" />
            
            <ConfirmationModal isOpen={isLogoConfirmOpen} onClose={() => setIsLogoConfirmOpen(false)} onConfirm={handleConfirmLogoSave} title="Xác nhận thay đổi Logo" variant="primary">Bạn có chắc chắn muốn lưu logo mới này không?</ConfirmationModal>
            <ConfirmationModal isOpen={isLoginBgConfirmOpen} onClose={() => setIsLoginBgConfirmOpen(false)} onConfirm={handleConfirmLoginBgSave} title="Xác nhận thay đổi Ảnh nền Đăng nhập" variant="primary">Bạn có chắc chắn muốn lưu ảnh nền mới này không?</ConfirmationModal>
            <ConfirmationModal isOpen={isAppBgConfirmOpen} onClose={() => setIsAppBgConfirmOpen(false)} onConfirm={handleConfirmAppBgSave} title="Xác nhận thay đổi Ảnh nền Ứng dụng" variant="primary">Bạn có chắc chắn muốn lưu ảnh nền mới này không?</ConfirmationModal>
            <ConfirmationModal isOpen={isEmailConfirmOpen} onClose={() => setIsEmailConfirmOpen(false)} onConfirm={handleConfirmEmailSave} title="Xác nhận lưu Email" variant="primary">Bạn có chắc chắn muốn lưu địa chỉ email mới để nhận thông báo?</ConfirmationModal>
            <ConfirmationModal
                isOpen={isDefaultConfirmOpen}
                onClose={() => setIsDefaultConfirmOpen(false)}
                onConfirm={handleConfirmSetSystemDefault}
                title="Xác nhận Đặt Mặc định"
                variant="primary"
            >
                Bạn có chắc chắn muốn áp dụng chủ đề <strong>{theme === 'dark' ? 'Tối' : 'Sáng'}</strong> và màu <strong>{primaryColor}</strong> làm mặc định cho toàn hệ thống không?
                Hành động này sẽ không ghi đè lên các tùy chỉnh của người dùng hiện tại.
            </ConfirmationModal>

            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Xem trước Ảnh nền Ứng dụng" size="3xl">
                <div 
                    className="relative w-full h-[60vh] bg-cover bg-center rounded-lg overflow-hidden border border-white/10 bg-gray-100 dark:bg-gray-900"
                    style={appBgSrc ? { backgroundImage: `url(${appBgSrc})` } : {}}
                >
                    {appBgSrc ? (
                        <>
                            <div className="absolute inset-0 bg-black/30"></div>
                            <div className="relative z-10 flex h-full pointer-events-none">
                                <div className="w-1/4 h-full bg-white/10 backdrop-blur-sm border-r border-white/5 p-4">
                                    <div className="h-8 w-8 bg-gray-400/50 rounded-full mb-6"></div>
                                    <div className="space-y-4">
                                        <div className="h-4 w-3/4 bg-gray-400/50 rounded"></div>
                                        <div className="h-4 w-full bg-gray-400/50 rounded"></div>
                                        <div className="h-4 w-1/2 bg-gray-400/50 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-3/4 h-full p-6">
                                    <div className="h-8 w-1/3 bg-gray-400/50 rounded mb-6"></div>
                                    <div className="h-40 w-full bg-gray-400/50 rounded"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-center text-gray-500 dark:text-gray-400">Không có ảnh nền để xem trước.</p>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isLogoPreviewModalOpen} onClose={() => setIsLogoPreviewModalOpen(false)} title="Xem trước Logo Ứng dụng" size="3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-center text-gray-800 dark:text-gray-200">Trang Đăng nhập</h4>
                        <div className="relative p-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-96">
                            <div className="relative p-8 space-y-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 w-full max-w-xs">
                                <div className="text-center space-y-2">
                                    <div className="flex justify-center">
                                        <img src={logoSrc} alt="Logo" className="h-20 w-20 rounded-full object-cover border-2 border-white/50 shadow-lg" />
                                    </div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div className="h-10 bg-primary-500/50 rounded-xl mt-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-center text-gray-800 dark:text-gray-200">Thanh điều hướng</h4>
                        <div className="relative p-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-96">
                            <div className="w-64 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/10 h-full rounded-lg flex flex-col">
                                <div className="flex items-center justify-center py-6 border-b border-white/10 flex-shrink-0">
                                    <div className="flex items-center px-4">
                                        <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                                        <div className="ml-3 flex flex-col items-start leading-tight space-y-1">
                                            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                            <div className="h-3 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                     <div className="h-8 bg-primary-500/50 rounded-md"></div>
                                     <div className="h-8 bg-gray-300/50 dark:bg-gray-600/50 rounded-md"></div>
                                     <div className="h-8 bg-gray-300/50 dark:bg-gray-600/50 rounded-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isLoginBgPreviewModalOpen} onClose={() => setIsLoginBgPreviewModalOpen(false)} title="Xem trước Ảnh nền Đăng nhập" size="3xl">
                <div
                    className="relative w-full h-[60vh] bg-cover bg-center rounded-lg overflow-hidden border border-white/10 flex items-center justify-center"
                    style={{ backgroundImage: `url(${loginBgSrc})` }}
                >
                    <div className="relative p-8 space-y-4 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-sm">
                        <div className="text-center space-y-2">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 rounded-full bg-gray-400/50 flex items-center justify-center text-xs text-white">LOGO</div>
                            </div>
                            <div className="h-4 bg-gray-400/50 rounded w-3/4 mx-auto"></div>
                            <div className="h-3 bg-gray-400/50 rounded w-1/2 mx-auto"></div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="h-8 bg-gray-400/50 rounded"></div>
                            <div className="h-8 bg-gray-400/50 rounded"></div>
                            <div className="h-10 bg-primary-500/80 rounded-xl mt-2"></div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SettingsPage;