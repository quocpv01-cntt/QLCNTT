import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext, UserRole } from '../../types';
import { NAV_ITEMS } from '../../constants';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const NavItem: React.FC<{ item: (typeof NAV_ITEMS)[0], closeMobileMenu: () => void, hasBackground: boolean }> = ({ item, closeMobileMenu, hasBackground }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Close dropdown on route change for desktop view
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const isActiveParent = item.children ? item.children.some(child => location.pathname.startsWith(child.href)) : false;
    
    const inactiveClasses = hasBackground
        ? `text-white hover:bg-white/20`
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50';
    
    const activeParentClasses = hasBackground
        ? `text-white bg-white/10`
        : 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20';

    if (item.children) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    title={item.label} // Tooltip for tablet view
                    className={`flex items-center justify-between w-full md:w-auto md:justify-center px-4 py-3 md:px-3 md:py-2 text-sm font-medium tracking-wider transition-colors duration-200 md:rounded-md ${
                        isActiveParent ? activeParentClasses : inactiveClasses
                    } focus:outline-none`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3 md:mr-0 lg:mr-2 flex-shrink-0" />
                        <span className="md:hidden lg:inline whitespace-nowrap">{item.label}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Mobile Dropdown */}
                <div className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden md:hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    {item.children.map(child => (
                        <NavItem key={child.href} item={child} closeMobileMenu={closeMobileMenu} hasBackground={hasBackground} />
                    ))}
                </div>

                {/* Desktop Dropdown */}
                <div className={`
                    absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 
                    hidden md:block transition-all duration-200 ease-out
                    ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
                `}>
                    <div className="py-1">
                        {item.children.map(child => (
                            <NavItem key={child.href} item={child} closeMobileMenu={closeMobileMenu} hasBackground={false} /> // Dropdown items don't have main background
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Normal nav link
    return (
        <NavLink
            to={item.href}
            title={item.label} // Tooltip for tablet view
            onClick={() => {
                 if (window.innerWidth < 768) {
                    closeMobileMenu();
                }
            }}
            className={({ isActive }) =>
                `flex items-center w-full md:justify-center px-4 py-3 md:px-3 md:py-2 text-sm font-medium tracking-wider transition-colors duration-200 md:rounded-md ${
                    isActive
                        ? `bg-primary-600 text-white shadow-inner`
                        : inactiveClasses
                } md:mx-0.5`
            }
        >
            <item.icon className="w-5 h-5 mr-3 md:mr-0 lg:mr-2 flex-shrink-0" />
            <span className="md:hidden lg:inline whitespace-nowrap">{item.label}</span>
        </NavLink>
    );
};

interface TopNavBarProps {
    navOpen: boolean;
    setNavOpen: (open: boolean) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ navOpen, setNavOpen }) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const hasAccess = (item: (typeof NAV_ITEMS)[0]): boolean => {
        if (!user) return false;
        if (user.role === UserRole.ADMIN) return item.roles.includes(UserRole.ADMIN);
        if (item.children?.length) return item.children.some(child => hasAccess(child));
        return item.roles.includes(UserRole.EMPLOYEE) && (user.permissions?.[item.href] === true || item.href === '/dashboard' || item.href === '/settings');
    };

    const closeMobileMenu = () => setNavOpen(false);

    if (!user) return null;
    
    const mobileHeaderTextColor = 'text-gray-800 dark:text-gray-200';
    const mobileCloseButtonColor = 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200';

    return (
        <>
            {/* Overlay for mobile */}
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden transition-opacity duration-300 ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeMobileMenu}></div>

            {/* Main Nav Container */}
            <nav className={`
                bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
                md:shadow-sm border-b border-gray-900/10 dark:border-gray-50/10 
                transition-transform duration-300 ease-in-out 
                md:transform-none md:static md:w-auto md:h-auto
                fixed top-0 left-0 w-64 h-full z-40 bg-white dark:bg-gray-800
                ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="relative z-10 h-full flex flex-col">
                    {/* Mobile Menu Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/50 md:hidden flex-shrink-0">
                        <h3 className={`font-semibold text-lg ${mobileHeaderTextColor}`}>Menu</h3>
                        <button onClick={closeMobileMenu} className={mobileCloseButtonColor}>
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col md:flex-row md:items-center p-2 md:px-4 md:py-1 overflow-y-auto md:overflow-visible">
                        {NAV_ITEMS.filter(hasAccess).map(item => (
                            <NavItem key={item.label} item={item} closeMobileMenu={closeMobileMenu} hasBackground={false} />
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default TopNavBar;