import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { EquipmentStatus } from '../../types';
import { useData } from '../../contexts/DataContext';

const STATUS_COLORS: Record<EquipmentStatus, string> = {
    [EquipmentStatus.AVAILABLE]: '#00C49F', // Green
    [EquipmentStatus.IN_USE]: '#0088FE',    // Blue
    [EquipmentStatus.IN_REPAIR]: '#FFBB28', // Yellow
    [EquipmentStatus.RETIRED]: '#8884d8',   // Gray/Purple
    [EquipmentStatus.LOST]: '#FF8042',      // Red/Orange
};

const AssetStatusChart: React.FC = () => {
    const { theme } = useTheme();
    const { data: appData, isLoading } = useData();

    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipBorder = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';

    const data = useMemo(() => {
        if (isLoading || !appData) return [];
        const statusCounts = appData.itEquipment.reduce((acc, equipment) => {
            acc[equipment.status] = (acc[equipment.status] || 0) + 1;
            return acc;
        }, {} as Record<EquipmentStatus, number>);
        
        return Object.values(EquipmentStatus).map(status => ({
            name: status,
            value: statusCounts[status] || 0,
        }));
    }, [isLoading, appData]);

  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Thống kê thiết bị theo Trạng thái</h3>
        <div className="flex-grow min-h-[300px]">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">Đang tải biểu đồ...</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                        <XAxis type="number" tick={{ fill: tickColor, fontSize: 12 }} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: tickColor, fontSize: 12 }} width={100} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                            cursor={{fill: 'rgba(113, 113, 122, 0.2)'}}
                        />
                        <Bar dataKey="value" name="Số lượng">
                            {data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name as EquipmentStatus]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    </div>
  );
}

export default AssetStatusChart;