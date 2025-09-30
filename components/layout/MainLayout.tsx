import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const APP_BG_STORAGE_KEY = 'customAppBackground_v1';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);


const MainLayout: React.FC = () => {
    const [appBgSrc, setAppBgSrc] = useState<string | null>(() => localStorage.getItem(APP_BG_STORAGE_KEY));
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === APP_BG_STORAGE_KEY) {
                setAppBgSrc(event.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const mainContentStyle: React.CSSProperties = appBgSrc ? {
        backgroundImage: `url(${appBgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    } : {};

    return (
        <div 
            className="relative flex h-screen bg-white dark:bg-gray-800"
            style={mainContentStyle}
        >
            {/* Background Overlay for text readability */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/50 z-0"></div>

            {/* Sidebar Navigation */}
            <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />
            
            {/* Main Content Area */}
            <div className="relative flex-1 flex flex-col overflow-hidden bg-transparent">
                 <button 
                    onClick={() => setNavOpen(true)} 
                    className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Mở menu"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
                    <div className="container mx-auto px-4 sm:px-6 py-8 pt-20 md:py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;