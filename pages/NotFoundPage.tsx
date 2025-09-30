import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-primary-500">404</h1>
      <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">Không tìm thấy trang</p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
      <Link to="/dashboard">
        <button className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 transition">
          Về TRANG CHỦ
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;