import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, AuthContextType, AuthContext } from './types';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import EquipmentManagementPage from './pages/AssetManagementPage';
import EquipmentTypesPage from './pages/EquipmentTypesPage';
import StaffPage from './pages/StaffPage';
import StaffProfilePage from './pages/StaffProfilePage';
import ManufacturersPage from './pages/ManufacturersPage';
import UnitsPage from './pages/UnitsPage';
import NotFoundPage from './pages/NotFoundPage';
import LicensesPage from './pages/LicensesPage';
import NetworkPage from './pages/NetworkPage';
import AllocationPage from './pages/AllocationPage';
import MaintenancePage from './pages/MaintenancePage';
import RepairsPage from './pages/RepairsPage';
import TransfersPage from './pages/TransfersPage';
import UsageHistoryPage from './pages/UsageHistoryPage';
import ReportsPage from './pages/ReportsPage';
import PermissionsPage from './pages/PermissionsPage';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import { staffApi } from './services/api';
import DetailedReportsPage from './pages/DetailedReportsPage';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';
import DatabaseExplorerPage from './pages/DatabaseExplorerPage';
import RolesManagementPage from './pages/RolesManagementPage';
import ChangePasswordModal from './components/auth/ChangePasswordModal';

const REMEMBERED_USER_KEY = 'it_system_remembered_user_v1';
const DEFAULT_PASSWORD = 'Admin@345';
const ADMIN_PASSWORD = 'Admin@345'; // Centralize admin password for consistency

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

    const login = useCallback(async (employeeIdToLogin: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
        if (!password) {
            console.error('Đăng nhập thất bại: Mật khẩu không được để trống.');
            return false;
        }

        const staffData = await staffApi.getAll();
        const staffMember = staffData.find(
            staff => staff.employeeId.toLowerCase() === employeeIdToLogin.toLowerCase()
        );

        if (!staffMember) {
            console.error(`Đăng nhập thất bại: Không tìm thấy cán bộ với employeeId '${employeeIdToLogin}'.`);
            return false;
        }
        
        const isAdmin = staffMember.employeeId.toLowerCase() === 'admin';
        if (isAdmin) {
            if (password !== ADMIN_PASSWORD) {
                console.error(`Đăng nhập thất bại: Mật khẩu cho tài khoản admin không chính xác.`);
                return false;
            }
        } else {
             if (staffMember.mustChangePassword) {
                if (password !== DEFAULT_PASSWORD) {
                    console.error(`Đăng nhập thất bại: Mật khẩu mặc định cho tài khoản ${employeeIdToLogin} không chính xác.`);
                    return false;
                }
            } else {
                // Trong môi trường thực tế, bạn sẽ xác thực mật khẩu đã hash.
                // Ở đây, chúng ta mô phỏng rằng bất kỳ mật khẩu nào không phải là mật khẩu mặc định đều hợp lệ sau khi đã thay đổi.
                if (password === DEFAULT_PASSWORD) {
                     console.error(`Đăng nhập thất bại: Vui lòng sử dụng mật khẩu mới của bạn.`);
                     return false;
                }
            }
        }
        
        const loggedInUser: User = {
            id: staffMember.id,
            name: staffMember.fullName,
            email: staffMember.email,
            role: staffMember.role,
            permissions: staffMember.permissions,
            unit: staffMember.unit,
        };

        setUser(loggedInUser);

        if (staffMember.mustChangePassword && !isAdmin) {
            setShowPasswordChangeModal(true);
        } else {
            setShowPasswordChangeModal(false);
        }


        if (rememberMe) {
            const encodedPassword = btoa(password);
            localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify({ employeeId: employeeIdToLogin, password: encodedPassword }));
        } else {
            localStorage.removeItem(REMEMBERED_USER_KEY);
        }
        return true;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setShowPasswordChangeModal(false);
        localStorage.removeItem(REMEMBERED_USER_KEY);
    }, []);
    
    const handlePasswordChanged = async (userId: string) => {
        await staffApi.changePassword(userId, 'new_mock_password');
        setShowPasswordChangeModal(false);
    };

    useEffect(() => {
        const autoLogin = async () => {
            const rememberedUserJson = localStorage.getItem(REMEMBERED_USER_KEY);
            if (rememberedUserJson) {
                try {
                    const { employeeId, password: encodedPassword } = JSON.parse(rememberedUserJson);
                    if (employeeId && encodedPassword) {
                        const password = atob(encodedPassword);
                        await login(employeeId, password, true);
                    }
                } catch (e) {
                    console.error("Failed to auto-login:", e);
                    localStorage.removeItem(REMEMBERED_USER_KEY);
                }
            }
            setIsAuthLoading(false);
        };
        autoLogin();
    }, [login]);

    const authContextValue: AuthContextType = {
        user,
        login,
        logout
    };
    
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-gray-900">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Đang kiểm tra phiên đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <AuthContext.Provider value={authContextValue}>
                {!user ? (
                    <LoginPage />
                ) : (
                    <DataProvider>
                        <ToastProvider>
                            <NotificationProvider>
                                <HashRouter>
                                    <Routes>
                                        <Route path="/" element={<MainLayout />}>
                                            <Route index element={<Navigate to="/dashboard" replace />} />
                                            
                                            {/* Routes available to any logged-in user */}
                                            <Route path="account" element={<AccountPage />} />

                                            {/* Protected Routes based on user permissions */}
                                            {user.permissions?.dashboard?.view && <Route path="dashboard" element={<DashboardPage />} />}
                                            {user.permissions?.equipment?.view && <Route path="equipment" element={<EquipmentManagementPage />} />}
                                            {user.permissions?.['equipment-types']?.view && <Route path="equipment-types" element={<EquipmentTypesPage />} />}
                                            {user.permissions?.staff?.view && <Route path="staff" element={<StaffPage />} />}
                                            {user.permissions?.staff?.view && <Route path="staff/:staffId" element={<StaffProfilePage />} />}
                                            {user.permissions?.manufacturers?.view && <Route path="manufacturers" element={<ManufacturersPage />} />}
                                            {user.permissions?.units?.view && <Route path="units" element={<UnitsPage />} />}
                                            {user.permissions?.licenses?.view && <Route path="licenses" element={<LicensesPage />} />}
                                            {user.permissions?.network?.view && <Route path="network" element={<NetworkPage />} />}
                                            {user.permissions?.allocation?.view && <Route path="allocation" element={<AllocationPage />} />}
                                            {user.permissions?.maintenance?.view && <Route path="maintenance" element={<MaintenancePage />} />}
                                            {user.permissions?.repairs?.view && <Route path="repairs" element={<RepairsPage />} />}
                                            {user.permissions?.['usage-history']?.view && <Route path="usage-history" element={<UsageHistoryPage />} />}
                                            {user.permissions?.transfers?.view && <Route path="transfers" element={<TransfersPage />} />}
                                            {user.permissions?.reports?.view && <Route path="reports" element={<ReportsPage />} />}
                                            {user.permissions?.reports?.view && <Route path="reports/detailed" element={<DetailedReportsPage />} />}
                                            {user.permissions?.settings?.view && <Route path="settings" element={<SettingsPage />} />}
                                            
                                            {/* Admin/Special permission routes */}
                                            {user.permissions?.permissions?.view && <Route path="permissions" element={<PermissionsPage />} />}
                                            {user.permissions?.roles?.view && <Route path="roles" element={<RolesManagementPage />} />}
                                            {user.permissions?.['database-explorer']?.view && <Route path="database-explorer" element={<DatabaseExplorerPage />} />}
                                            
                                            <Route path="*" element={<NotFoundPage />} />
                                        </Route>
                                    </Routes>
                                </HashRouter>
                                <ChangePasswordModal 
                                    isOpen={showPasswordChangeModal}
                                    userId={user.id}
                                    onSuccess={handlePasswordChanged}
                                />
                            </NotificationProvider>
                        </ToastProvider>
                    </DataProvider>
                )}
            </AuthContext.Provider>
        </ThemeProvider>
    );
};

export default App;