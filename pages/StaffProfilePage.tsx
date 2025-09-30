import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Table from '../components/ui/Table';
import { ITEquipment, Staff } from '../types';
import { useData } from '../contexts/DataContext';

const StaffProfilePage: React.FC = () => {
    const { staffId } = useParams<{ staffId: string }>();
    const { data, isLoading } = useData();
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [assignedEquipment, setAssignedEquipment] = useState<ITEquipment[]>([]);
    
    useEffect(() => {
        if (!staffId || isLoading) return;

        const staff = data.staff.find(s => s.id === staffId);
        if (staff) {
            setStaffMember(staff);
            const equipment = data.itEquipment.filter(e => e.assignedTo === staff.fullName);
            setAssignedEquipment(equipment);
        } else {
            setStaffMember(null);
        }

    }, [staffId, isLoading, data]);

    if (isLoading) {
        return <div>Đang tải hồ sơ...</div>;
    }

    if (!staffMember) {
        return (
            <div className="text-center">
                <PageHeader title="Không tìm thấy cán bộ" />
                <p className="text-gray-600 dark:text-gray-400">Không thể tìm thấy thông tin cho cán bộ này.</p>
                <Link to="/staff">
                    <button className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 transition">
                        Quay lại danh sách
                    </button>
                </Link>
            </div>
        );
    }

    const equipmentColumns = [
        { header: 'Tem thiết bị', accessor: 'assetTag' as keyof ITEquipment },
        { header: 'Tên thiết bị', accessor: 'deviceName' as keyof ITEquipment },
        { header: 'Loại', accessor: 'deviceType' as keyof ITEquipment },
        { header: 'Trạng thái', accessor: 'status' as keyof ITEquipment },
    ];

    const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-md font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    );

    return (
        <div>
            <PageHeader title={staffMember.fullName}>
                <Link to="/staff">
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 transition">
                        Quay lại
                    </button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg text-center">
                        <img 
                            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary-500"
                            src={`https://i.pravatar.cc/150?u=${staffMember.id}`} 
                            alt={`Ảnh đại diện của ${staffMember.fullName}`}
                        />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{staffMember.fullName}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{staffMember.position}</p>
                        <p className={`mt-2 px-3 py-1 inline-block text-xs font-semibold rounded-full ${staffMember.status === 'Đang hoạt động' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {staffMember.status}
                        </p>
                    </div>
                </div>

                {/* Info and Assets */}
                <div className="md:col-span-2">
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-3 mb-4">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoField label="Mã cán bộ" value={staffMember.employeeId} />
                            <InfoField label="Email" value={staffMember.email} />
                            <InfoField label="Số điện thoại" value={staffMember.phone} />
                            <InfoField label="Đơn vị" value={staffMember.unit} />
                            <InfoField label="Giới tính" value={staffMember.gender} />
                            <InfoField label="Ngày vào làm" value={staffMember.joinDate} />
                            <InfoField label="Vai trò hệ thống" value={staffMember.role} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thiết bị được cấp phát</h3>
                        <Table tableId={`staff-profile-assets-${staffId}`} columns={equipmentColumns} data={assignedEquipment} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfilePage;