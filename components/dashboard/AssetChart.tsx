import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const data = [
  { name: 'Thg 1', 'Laptop': 40, 'Desktop': 24, 'Thiết bị mạng': 12 },
  { name: 'Thg 2', 'Laptop': 30, 'Desktop': 13, 'Thiết bị mạng': 15 },
  { name: 'Thg 3', 'Laptop': 20, 'Desktop': 98, 'Thiết bị mạng': 20 },
  { name: 'Thg 4', 'Laptop': 27, 'Desktop': 39, 'Thiết bị mạng': 25 },
  { name: 'Thg 5', 'Laptop': 18, 'Desktop': 48, 'Thiết bị mạng': 30 },
  { name: 'Thg 6', 'Laptop': 23, 'Desktop': 38, 'Thiết bị mạng': 28 },
  { name: 'Thg 7', 'Laptop': 34, 'Desktop': 43, 'Thiết bị mạng': 22 },
];

const EquipmentChart: React.FC = () => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipBorder = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';
    const tooltipColor = theme === 'dark' ? '#d1d5db' : '#374151';
    const legendColor = theme === 'dark' ? '#d1d5db' : '#374151';


  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tổng quan Thiết bị mới</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: tickColor }} />
                <YAxis tick={{ fill: tickColor }} />
                <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor, borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}
                    cursor={{fill: 'rgba(113, 113, 122, 0.2)'}}
                />
                <Legend wrapperStyle={{ color: legendColor }} />
                <Bar dataKey="Laptop" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Desktop" stackId="a" fill="#1d4ed8" />
                <Bar dataKey="Thiết bị mạng" fill="#60a5fa" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}

export default EquipmentChart;