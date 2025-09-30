import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-500">
            <p>&copy; {new Date().getFullYear()} PHẦN MỀM HỆ THỐNG CÔNG NGHỆ THÔNG TIN. All Rights Reserved.</p>
        </footer>
    );
};

export default Footer;