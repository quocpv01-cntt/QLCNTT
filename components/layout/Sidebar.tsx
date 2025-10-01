
import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AuthContext, UserRole } from '../../types';
import { NAV_ITEMS, ChevronDownIcon } from '../../constants';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const LOGO_STORAGE_KEY = 'customAppLogo_v1';
const AVATAR_STORAGE_KEY_PREFIX = 'customUserAvatar_v1_';
const defaultLogoImageData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN2b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFFNEVEOzsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDEwMCkiPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjkwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZzQpIiBzdHJva2Utd2lkdGg9IjEwIiAvPgogICAgPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KICAgICAgPGNpcmNsZSBjeD0iMCIgY3k9Ii01MCIgcj0iMTUiIGZpbGw9IiNmZmYiLz4KICAgICAgPGNpcmNsZSBjeD0iNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgICA8Y2lyY2xlIGN4PSItNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+";


const iconProps = { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" };

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const SpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface SidebarProps {
    navOpen: boolean;
    setNavOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navOpen, setNavOpen }) => {
    const auth = useContext(AuthContext);
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem(LOGO_STORAGE_KEY) || defaultLogoImageData);
    const [avatarSrc, setAvatarSrc] = useState('');
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const user = auth?.user;
    const location = useLocation();

    useEffect(() => {
        const findOpenMenus = () => {
            const newOpenMenus: Record<string, boolean> = {};
            const checkItems = (items: typeof NAV_ITEMS) => {
                for (const item of items) {
                    if (item.children) {
                        const isChildActive = item.children.some(child => 
                            location.pathname === child.href || 
                            (child.href !== '/' && location.pathname.startsWith(child.href))
                        );
                        if (isChildActive) {
                            newOpenMenus[item.label] = true;
                        }
                    }
                }
            };
            checkItems(NAV_ITEMS);
            setOpenMenus(newOpenMenus);
        };
        findOpenMenus();
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            const storageKey = `${AVATAR_STORAGE_KEY_PREFIX}${user.id}`;
            const savedAvatar = localStorage.getItem(storageKey);
            setAvatarSrc(savedAvatar || `https://i.pravatar.cc/150?u=${user.id}`);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) setNotificationDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === LOGO_STORAGE_KEY) {
                setLogoSrc(event.newValue || defaultLogoImageData);
            }
            if (user && event.key === `${AVATAR_STORAGE_KEY_PREFIX}${user.id}`) {
                setAvatarSrc(event.newValue || `https://i.pravatar.cc/150?u=${user.id}`);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user]);

    const handleNotificationClick = (notificationId: string) => {
        markAsRead(notificationId);
        setNotificationDropdownOpen(false); // Close dropdown after click
    };

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({...prev, [label]: !prev[label]}));
    };
    
    const hasAccess = (item: any): boolean => {
        if (!user) return false;
    
        if (item.children && item.children.length > 0) {
            return item.children.some(child => hasAccess(child));
        }
    
        const moduleKey = item.moduleKey;
        if (!moduleKey) {
            return false; 
        }
        
        return user.permissions?.[moduleKey]?.view === true;
    };

    const renderNavItems = (items: typeof NAV_ITEMS) => {
        return items.filter(hasAccess).map(item => {
            if (item.children) {
                const isMenuOpen = openMenus[item.label] ?? false;
                return (
                    <div key={item.label}>
                        <button onClick={() => toggleMenu(item.label)} className="w-full flex justify-between items-center py-2.5 px-4 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition duration-200" aria-expanded={isMenuOpen}>
                            <div className="flex items-center">
                                <item.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`pl-8 mt-1 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
                            {renderNavItems(item.children)}
                        </div>
                    </div>
                );
            }
            return (
                <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setNavOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center py-2.5 px-4 rounded-md transition duration-200 ${
                            isActive
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-300 hover:bg-black/10 dark:hover:bg-white/10'
                        }`
                    }
                >
                    <item.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                </NavLink>
            );
        });
    };

    if (!user || !auth) return null;

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setNavOpen(false)}
                aria-hidden="true"
            ></div>

            <div className={`fixed top-0 left-0 w-64 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border-r border-white/10 dark:border-white/5 h-full z-40 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className="flex items-center justify-between py-6 border-b border-white/10 dark:border-white/5 flex-shrink-0">
                    <div className="flex items-center px-4">
                        <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                        <div className="ml-3 flex flex-col items-start leading-tight">
                            <span className="text-sm font-semibold tracking-wide text-gray-800 dark:text-white">PHẦN MỀM QUẢN LÝ</span>
                            <span className="text-sm font-semibold tracking-wide text-gray-800 dark:text-white">CÔNG NGHỆ THÔNG TIN</span>
                        </div>
                    </div>
                    {/* Close Button on Mobile */}
                    <button onClick={() => setNavOpen(false)} className="md:hidden p-2 mr-2 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span className="sr-only">Đóng menu</span>
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {/* Nav Items */}
                <nav className="flex-grow px-2 py-4 space-y-2 overflow-y-auto">
                    {renderNavItems(NAV_ITEMS)}
                </nav>

                {/* Notification Section */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 dark:border-white/5">
                    <div className="relative" ref={notificationDropdownRef}>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => setNotificationDropdownOpen(prev => !prev)}
                                className="relative text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-50"
                                aria-label="Thông báo"
                                aria-haspopup="true"
                                aria-expanded={notificationDropdownOpen}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <SpinnerIcon className="h-6 w-6" />
                                ) : (
                                    <>
                                        <BellIcon className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                        {notificationDropdownOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl shadow-lg z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
                                <div className="p-2.5 flex justify-between items-center border-b border-white/10 dark:border-white/5">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Thông báo</h4>
                                    {unreadCount > 0 && ( <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:underline">Đánh dấu tất cả đã đọc</button> )}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <Link to={n.link} key={n.id} onClick={() => handleNotificationClick(n.id)}>
                                            <div className={`p-2.5 border-b border-white/10 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 ${!n.read ? 'bg-primary-500/10 dark:bg-primary-500/10' : ''}`}>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </Link>
                                    )) : ( <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Không có thông báo mới.</p> )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Controls */}
                <div className="px-4 py-3 border-t border-white/10 dark:border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <Link to="/account" className="flex items-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 flex-grow overflow-hidden">
                            <img className="h-9 w-9 rounded-full object-cover flex-shrink-0" src={avatarSrc} alt="Ảnh đại diện của bạn" />
                            <div className="ml-2 flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{auth.user.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{auth.user.role}</p>
                            </div>
                        </Link>
                        <button 
                            onClick={auth.logout} 
                            className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
                            aria-label="Đăng xuất"
                        >
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;