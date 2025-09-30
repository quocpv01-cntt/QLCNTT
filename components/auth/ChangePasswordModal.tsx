import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { staffApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ChangePasswordModalProps {
    isOpen: boolean;
    userId: string;
    onSuccess: (userId: string) => void;
}

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);
const XIcon = () => (
     <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, userId, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validation, setValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        notCommon: true,
        match: false,
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const commonPasswords = ['12345678', 'password', '113', '115', 'admin123'];

    useEffect(() => {
        const length = newPassword.length >= 8 && newPassword.length <= 15;
        const uppercase = /[A-Z]/.test(newPassword);
        const lowercase = /[a-z]/.test(newPassword);
        const number = /\d/.test(newPassword);
        const special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        const notCommon = !commonPasswords.includes(newPassword.toLowerCase());
        const match = newPassword !== '' && newPassword === confirmPassword;

        setValidation({ length, uppercase, lowercase, number, special, notCommon, match });
    }, [newPassword, confirmPassword]);

    const isFormValid = useMemo(() => {
        return Object.values(validation).every(v => v === true);
    }, [validation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Vui lòng đảm bảo tất cả các yêu cầu về mật khẩu được đáp ứng.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await onSuccess(userId);
            addToast('Đổi mật khẩu thành công!', 'success');
        } catch (err) {
            addToast('Đổi mật khẩu thất bại.', 'error');
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400";
    
    return (
        <Modal isOpen={isOpen} onClose={() => {}} title="Yêu cầu đổi mật khẩu" size="lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Để tăng cường bảo mật, bạn phải đổi mật khẩu trong lần đăng nhập đầu tiên.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass} htmlFor="new-password">Mật khẩu mới</label>
                    <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass} htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
                    <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} required />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Yêu cầu mật khẩu:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <li className="flex items-center">{validation.length ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Từ 8 đến 15 ký tự</span></li>
                        <li className="flex items-center">{validation.uppercase ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Ít nhất một chữ in hoa</span></li>
                        <li className="flex items-center">{validation.lowercase ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Ít nhất một chữ thường</span></li>
                        <li className="flex items-center">{validation.number ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Ít nhất một chữ số</span></li>
                        <li className="flex items-center">{validation.special ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Ít nhất một ký tự đặc biệt</span></li>
                        <li className="flex items-center">{validation.notCommon ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Không phải là mật khẩu phổ biến</span></li>
                        <li className="flex items-center">{validation.match ? <CheckIcon/> : <XIcon/>} <span className="ml-2">Mật khẩu phải trùng khớp</span></li>
                    </ul>
                     <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                        * Gợi ý: Không sử dụng thông tin cá nhân (ngày sinh, SĐT,...) hoặc thông tin dễ đoán.
                    </p>
                </div>
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" isSubmitting={isSubmitting} disabled={!isFormValid || isSubmitting}>
                        Lưu mật khẩu mới
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
