import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../types';
import { EyeIcon, EyeSlashIcon } from '../constants';

const LOGIN_BG_STORAGE_KEY = 'customLoginBackground_v1';
const defaultLoginPageBackgroundData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoGBxMUExYUFBQYGBYZGhocGRkYGhoaHxoeHx8aHxwaHhweHysiHyAoHhsdLTgtJjU3PDcxOysxRDgvPzE/OjcBCwsLDw4PHRERHTAnIig7Lzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/AABEIAZ8C3QMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EAEsQAAIBAgQDBgMGAwcJBQkAAAECEQADBBIhMQVBUQYTImFxgZGhMrEUI0JScsHR8AcWJDNigqKy4VOCorPS0+LxJENjk8MlNXP/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQIDBAUG/8QALxEAAgIBAwIDBgYDAAAAAAAAAAECEQMSITEEQVFhgfAFInGREzKhscHR4ULxI//aAAwDAQACEQMRAD8A9UqVKnQCVKkaAOFSpUqAJUqR2oAkDU6UqAJ0qVKaAJ0qVKgCVKkDQBKnSpUAJUqVKgCVKlSoA1KlSoAARpUqVACVKlSoAlSpUqAOFSpUqAJUqVKgCVKkDQBKlSpUASpUjQAqVKlQBKlSpUAJUqVKgCVKkDQBKlSpUAJUqVKgCVKlSoAlSpUqAOFSpUqAJUqVKgCVKkDQBKlSpUAJUqRoAlSpUqAJUqVKgCVKkDQBKlSpUAalSpUAJUqRoAlSpUqAFSpUqAJ0qVKgCVKlSoAlSpUqAJUqVKgCVKkDQBKnSpUAJUqRoA4VKlSoAVKlSoAlSpUqAFSpUqAFSpUqAJUqRoA4VKlSoAlSpUqAFSpUqAJUqVKgCVKlSoAlSpUqAOFSpUqAI0qVKgCVOkaFAFSpUqAJUqVKgCVKkDQBKnSpUAJUqRoAVKlSoA4VKlSoAlSpUqAJUqVKgCVKlSoA4VKlSoAVKlSoAlSpUqAJUqRoA4VKlSoAVKlSoAlSpUqAFSpUqAJUqRoA4VKlSoAlSpUqAFSpUqAJUqVKgCVKlSoAlSpUqAI0qVKgCVOkaFAFWpUqAFSpUqAJUqRoA4VKlSoAVKlSoAlSpUqAFSpUqAJUqRoA4VKlSoAVKlSoAlSpUqAFSpUqAJUqVKgCVKkDQBKlSpUAalSpUAJUqRoAlSpUqAJUqRoA4VKlSoAlSpUqAJUqVKgBKnSpUAJUqRoAVKlSoA4VKlSoAlSpUqAFSpUqAFSpUqAFSpUqAI0qVKgBKnSNKACVakDQCpUqVAEo1KmgCVKlSoA4VKlSoAVKlSoAlSpUqAJUqVKgCVKkDQBKnSpUAalSpUAJUqRoAlSpUqAJUqVKAJUqRoA4VKlSoAVKlSoAlSpUqAJUqVKgCVKlSoA4VKlSoAlSpUqAJUqRoAlSpUqAJUqRoA4VKlSoAVKlSoAlSpUqAJUqVKgCVKkDQBKnSpUAalSpUAJUqRoAlSpUqAFSpUqAJUqRoA4VKlSoAlSpUqAJUqRoAVKnSoA4VKlSoAVKnSgCVKkaAKlSpUAa1KmjQAqVKlQAaVKlQAaVKnQBWlSpUAalSpUAalSpUAalSpUANSpUqAGpUqVADpUqVAEaVKlQBKlSNACpUqVADpUqVADUqRoAlSpUqAGpUqVAEaVKnQB2o0qVAEaVKmgB0qR2oAVKlToAlSpUqAFSpUqAJUqVKgDUqRoAlSpUqAGpUqVAEaVKlQA6VI0AKlSpUAalSpUANSpUqAJUqRoAdKlSoAVKkaAOlSpUAalSNACpUqVADpUqVADUqRoAlSpUqAGpUqVAEaVKlQAaVKnQB2o0qVAEaVKmgB0qR2oAVKlToAlSpUqAFSpUqAJUqVKgDUqRoAlSpUqAGpUqVAEaVKlQA6VI0AKlSpUAalSpUANSpUqAJUqRoAVKlSoAdKkaAFSpUqANSpGgCpUqVADpUqVAEaVKlQAaVKnQB2o0qVAEaVKmgB0qR2oAVKlToAlSpUqAFSpUqAJUqVKgDUqRoAlSpUqAGpUqVAEaVKlQA6VI0AKlSpUAalSpUANSpUqAJUqRoAVKlSoAlSNKAJUqVKgCVKlQAaVKmgB0qVKgB0qRoAVKnSoAVKnSgBUqVKgC1CkaAFTpGgBGlSoAnSq1KlACpUqVAEqVKmgDUqVKgB0qVKgBUqVKgB0qVKgB0qRoAlSpUqAFSpUqAI0qRoAVKkKFAEqVKnQBKlSNACpUqVAEqVKlQAqVKlQBKlSNACpUqVADpUqVADpUaVADpUqRoAlSpUqAFSpUqAI0qRoAUKlSpUASpUqdAEqRoUAKlSpUASpUqVADpUjQAqVKnQBKlSoAnSo0qAI0qVAEqVJpUAOlSNACpUqVAEaVKlQBKlSpUAKlSpUAalSpUAOlSNADpUqVAEaVI0AKlRo0AOlSpUAaVIUaAGjSo0qAI0qRoAVKkKFAEqVKnQBKlSNACpUqVAEqVKlQAqVKlQBKlSNACpUqVADpUqVADpUaVADpUjSoAlSpUqAFSpUqAI0qRoAVKkKFAEqVKnQBKlSNACpUqVAEqVKlQAqVKlQBKlSNACpUqVADpUqVADpUjQoAVKlSpUAaVI0AKlSpUAKlSpUAalSNACpUqVADpUjQAqVKlQAaVI0AKlRo0AOlSpUAalSpUAaNGlRoAUKlSoAdKkaAFSpUqAJUqNKgBUqRoAVKnSoAlSpUqAJUqNAEqVKlQAqVI0ANSpUqAFSpUqAFSo0qAJUqVKgB0qRoAVKkaFGgCVKnSoAVKlSpUAOlSpUAKlSpUAOlSpUAalSpUAKlSNACpUqVADpUqVACpUqVAEo0qFAEqVKnQBKlSNACpUqVACpUjQAqVKnQAqVKlB0qVKnQBKlSNACpUqVACpUjQAqVKnQBKnQoUAKlSoA//Z";
const LOGO_STORAGE_KEY_V11 = 'customAppLogo_v1';
const defaultLogoImageData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN2b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFFNEVEOzsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDEwMCkiPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjkwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZzQpIiBzdHJva2Utd2lkdGg9IjEwIiAvPgogICAgPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KICAgICAgPGNpcmNsZSBjeD0iMCIgY3k9Ii01MCIgcj0iMTUiIGZpbGw9IiNmZmYiLz4KICAgICAgPGNpcmNsZSBjeD0iNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgICA8Y2lyY2xlIGN4PSItNDMuMyIgY3k9IjI1IiByPSIxNSIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+";
 
 const LoginPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [employeeIdError, setEmployeeIdError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
      
    const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem(LOGO_STORAGE_KEY_V11) || defaultLogoImageData);
    const [backgroundSrc, setBackgroundSrc] = useState(() => localStorage.getItem(LOGIN_BG_STORAGE_KEY) || defaultLoginPageBackgroundData);
  
     useEffect(() => {
         const handleStorageChange = (event: StorageEvent) => {
            if (event.key === LOGO_STORAGE_KEY_V11) {
                 setLogoSrc(event.newValue || defaultLogoImageData);
             }
             if (event.key === LOGIN_BG_STORAGE_KEY) {
                 setBackgroundSrc(event.newValue || defaultLoginPageBackgroundData);
             }
         };
 
         window.addEventListener('storage', handleStorageChange);
         return () => window.removeEventListener('storage', handleStorageChange);
     }, []);
  
  
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setEmployeeIdError('');
        setPasswordError('');

        let isValid = true;
        if (!employeeId) {
            setEmployeeIdError('Vui lòng nhập mã cán bộ.');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Vui lòng nhập mật khẩu.');
            isValid = false;
        }

        if (!isValid) return;

        if (!auth) {
            setError('Lỗi xác thực. Vui lòng làm mới trang và thử lại.');
            return;
        }

        setIsLoggingIn(true);
        const success = await auth.login(employeeId, password, rememberMe);
        setIsLoggingIn(false);

        if (!success) {
            setError('Tài khoản hoặc mật khẩu không chính xác.');
        }
    };

    if (!auth) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                Lỗi: Không tìm thấy ngữ cảnh xác thực.
            </div>
        );
    }
  
      return (
          <div 
              className="flex items-center justify-center md:justify-end min-h-screen px-4 md:pr-16 lg:pr-24"
              style={{
                  backgroundImage: `url(${backgroundSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
              }}
          >
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative p-8 space-y-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 w-full max-w-sm">
                  <div className="text-center space-y-2">
                      <div className="flex justify-center">
                          <img src={logoSrc} alt="Logo" className="h-20 w-20 rounded-full object-cover border-2 border-white/50 shadow-lg" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
                      <p className="text-gray-600 dark:text-gray-300">Chào mừng trở lại!</p>
                  </div>
                  
                  {error && <p className="text-sm text-red-500 bg-red-100/50 dark:bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
  
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mã cán bộ</label>
                              <input
                                  id="employeeId"
                                  type="text"
                                  value={employeeId}
                                  onChange={(e) => { setEmployeeId(e.target.value); if (employeeIdError) setEmployeeIdError(''); }}
                                  placeholder="Ví dụ: admin"
                                  className="w-full px-4 py-2 text-gray-900 dark:text-gray-200 bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-500/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                 disabled={isLoggingIn}
                                  required
                              />
                              {employeeIdError && <p className="text-xs text-red-400 mt-1">{employeeIdError}</p>}
                          </div>
                          <div className="relative">
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mật khẩu</label>
                              <input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  value={password}
                                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                                  placeholder="••••••••"
                                  className="w-full px-4 py-2 pr-10 text-gray-900 dark:text-gray-200 bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-500/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                 disabled={isLoggingIn}
                                  required
                              />
                               <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword 
                                        ? <EyeSlashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" /> 
                                        : <EyeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    }
                                </button>
                              {passwordError && <p className="text-xs text-red-400 mt-1">{passwordError}</p>}
                          </div>

                          <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary-600 bg-white/50 dark:bg-gray-900/50 border-gray-300/50 dark:border-gray-500/50 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>
  
                          <button
                              type="submit"
                             className="w-full px-4 py-3 mt-2 text-md font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transform hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed"
                             disabled={isLoggingIn}
                          >
                             {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                          </button>
                      </form>
                </div>
            </div>
    );
};

export default LoginPage;