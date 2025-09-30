





import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import Table from '../components/ui/Table';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import { DocumentTextIcon } from '../constants';
import { ITEquipment, LicenseStatus } from '../types';
import { useData } from '../contexts/DataContext';
import AssetStatusChart from '../components/dashboard/AssetStatusChart';

const COLORS_USER_CHART = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442ff', '#ff42b3', '#a242ff'];

export const EquipmentByUserChart: React.FC = () => {
    const { theme } = useTheme();
    const { data: appData, isLoading } = useData();

    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipBorder = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';

    const data = useMemo(() => {
        if (isLoading || !appData) return [];
        
        const userEquipmentCount = appData.itEquipment.reduce<Record<string, number>>((acc, equipment) => {
            if (equipment.assignedTo) {
                acc[equipment.assignedTo] = (acc[equipment.assignedTo] || 0) + 1;
            }
            return acc;
        }, {});
        
        // Fix: Use Object.keys() for more robust type inference than Object.entries() in some TypeScript environments.
        return Object.keys(userEquipmentCount)
            .map(name => ({ name, value: userEquipmentCount[name] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [isLoading, appData]);

    return (
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 10 Cán bộ được cấp phát nhiều thiết bị</h3>
            <div className="flex-grow min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">Đang tải biểu đồ...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" tick={{ fill: tickColor, fontSize: 12 }} allowDecals={false} />
                            <YAxis dataKey="name" type="category" tick={{ fill: tickColor, fontSize: 12, width: 100 }} width={120} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                                cursor={{fill: 'rgba(113, 113, 122, 0.2)'}}
                            />
                            <Bar dataKey="value" name="Số lượng thiết bị">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_USER_CHART[index % COLORS_USER_CHART.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};


interface ReportCardProps {
  title: string;
  children: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, children }) => (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg">
        {children}
    </div>
);

const ReportsPage: React.FC = () => {
    const { theme, primaryColor } = useTheme();
    const { data, isLoading } = useData();
    const [chartColors, setChartColors] = useState({ primary: '#3b82f6', accents: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442ff'] });

    useEffect(() => {
        const getThemeColor = (shade: number): string => {
            try {
                const colorValue = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--color-primary-${shade}`)
                    .trim();
                if (colorValue) return `rgb(${colorValue})`;
            } catch (e) {
                console.error("Could not get theme color from CSS variables.", e);
            }
            return '#3b82f6';
        };

        setChartColors({
            primary: getThemeColor(500),
            accents: [
                getThemeColor(500),
                getThemeColor(400),
                getThemeColor(600),
                getThemeColor(300),
                getThemeColor(700),
            ]
        });
    }, [primaryColor]);
    
     const equipmentByTypeData = useMemo(() => {
        if (isLoading || !data) return [];
        const counts = data.itEquipment.reduce((acc, item) => {
            acc[item.deviceType] = (acc[item.deviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [isLoading, data]);

    const licenseStatusData = useMemo(() => {
        if (isLoading || !data) return [];
        const counts = data.licenses.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<LicenseStatus, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [isLoading, data]);

    const expiringWarrantyData = useMemo(() => {
        if (isLoading || !data) return [];
        const days = 90;
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return data.itEquipment.filter(item => {
            if (!item.warrantyEndDate) return false;
            const expiryDate = new Date(item.warrantyEndDate);
            return expiryDate >= today && expiryDate <= futureDate;
        }).sort((a, b) => new Date(a.warrantyEndDate).getTime() - new Date(b.warrantyEndDate).getTime());
    }, [isLoading, data]);


    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipBorder = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';

    if (isLoading) {
        return <div>Đang tải báo cáo...</div>;
    }

    const warrantyColumns: { header: string, accessor: keyof ITEquipment | ((item: ITEquipment) => React.ReactNode) }[] = [
        { header: 'Tên thiết bị', accessor: 'deviceName' },
        { header: 'Tem thiết bị', accessor: 'assetTag' },
        { header: 'Người sử dụng', accessor: 'assignedTo' },
        {
            header: 'Ngày hết hạn BH',
            accessor: (item: ITEquipment) => item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString('vi-VN') : 'N/A'
        },
    ];


    return (
        <div>
            <PageHeader title="Báo cáo & Thống kê">
                 <Link to="/reports/detailed">
                    <Button variant="secondary" icon={DocumentTextIcon}>Xem báo cáo chi tiết</Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Equipment by Type Chart */}
                <ReportCard title="Phân bổ thiết bị theo loại">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Phân bổ thiết bị theo loại</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={equipmentByTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: tickColor }} />
                            <YAxis tick={{ fill: tickColor }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                                cursor={{ fill: 'rgba(113, 113, 122, 0.2)' }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill={chartColors.primary} name="Số lượng" />
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* License Status Chart */}
                <ReportCard title="Tổng quan trạng thái bản quyền">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tổng quan trạng thái bản quyền</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={licenseStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {licenseStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors.accents[index % chartColors.accents.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ReportCard>

                 {/* Asset Status Chart */}
                <div className="lg:col-span-2">
                    <AssetStatusChart />
                </div>
                
                {/* Equipment by User Chart */}
                <div className="lg:col-span-2">
                    <EquipmentByUserChart />
                </div>

                {/* Expiring Warranty Table */}
                <div className="lg:col-span-2">
                    <ReportCard title="Thiết bị sắp hết hạn bảo hành (90 ngày tới)">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thiết bị sắp hết hạn bảo hành (90 ngày tới)</h3>
                        </div>
                        <Table
                            tableId="expiring-warranty-report"
                            columns={warrantyColumns}
                            data={expiringWarrantyData}
                        />
                         {expiringWarrantyData.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Không có thiết bị nào sắp hết hạn bảo hành trong 90 ngày tới.</p>
                        )}
                    </ReportCard>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;