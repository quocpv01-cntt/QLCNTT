import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { EquipmentStatus } from '../types';

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        {children}
    </div>
);

const STATUS_COLORS: Record<EquipmentStatus, string> = {
    [EquipmentStatus.AVAILABLE]: '#10B981', // emerald-500
    [EquipmentStatus.IN_USE]: '#3B82F6',    // blue-500
    [EquipmentStatus.IN_REPAIR]: '#F59E0B', // amber-500
    [EquipmentStatus.RETIRED]: '#6B7280',   // gray-500
    [EquipmentStatus.LOST]: '#EF4444',      // red-500
};

const DetailedReportsPage: React.FC = () => {
    const { theme } = useTheme();
    const { data, isLoading } = useData();

    const { equipmentStatusByTypeData, maintenanceHistoryData } = useMemo(() => {
        if (isLoading || !data) {
            return { equipmentStatusByTypeData: [], maintenanceHistoryData: [] };
        }

        // 1. Process data for Equipment Status by Type chart
        const statusByType: Record<string, Record<EquipmentStatus, number>> = {};
        for (const item of data.itEquipment) {
            if (!statusByType[item.deviceType]) {
                statusByType[item.deviceType] = {
                    [EquipmentStatus.AVAILABLE]: 0,
                    [EquipmentStatus.IN_USE]: 0,
                    [EquipmentStatus.IN_REPAIR]: 0,
                    [EquipmentStatus.RETIRED]: 0,
                    [EquipmentStatus.LOST]: 0,
                };
            }
            statusByType[item.deviceType][item.status]++;
        }
        const equipmentStatusByTypeData = Object.entries(statusByType).map(([type, statuses]) => ({
            type,
            ...statuses,
        }));

        // 2. Process data for Maintenance History chart
        const history: Record<string, { total: number }> = {};
        for (const task of data.maintenance) {
            const monthYear = new Date(task.startDate).toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' });
            if (!history[monthYear]) {
                history[monthYear] = { total: 0 };
            }
            history[monthYear].total++;
        }
        const maintenanceHistoryData = Object.entries(history)
            .map(([month, counts]) => ({ month, ...counts }))
            .sort((a, b) => {
                const [monthA, yearA] = a.month.split('/');
                const [monthB, yearB] = b.month.split('/');
                return new Date(Number(yearA), Number(monthA) - 1).getTime() - new Date(Number(yearB), Number(monthB) - 1).getTime();
            });

        return { equipmentStatusByTypeData, maintenanceHistoryData };
    }, [isLoading, data]);

    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipBorder = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';
    const primaryChartColor = `rgb(var(--color-primary-500))`;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Đang tải báo cáo chi tiết...</p>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Báo cáo Chi tiết">
                <Link to="/reports">
                    <Button variant="secondary">Quay lại Báo cáo chung</Button>
                </Link>
            </PageHeader>

            <div className="space-y-8">
                <ReportCard title="Trạng thái Thiết bị theo Loại">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={equipmentStatusByTypeData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="type" tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: tickColor, fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                                cursor={{ fill: 'rgba(113, 113, 122, 0.2)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            {Object.values(EquipmentStatus).map(status => (
                                <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

                <ReportCard title="Thống kê Bảo trì hàng tháng">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={maintenanceHistoryData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: tickColor, fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                                cursor={{ stroke: primaryChartColor, strokeWidth: 1 }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line type="monotone" dataKey="total" name="Số lượng công việc" stroke={primaryChartColor} strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ReportCard>
            </div>
        </div>
    );
};

export default DetailedReportsPage;
