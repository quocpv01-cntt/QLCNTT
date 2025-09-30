import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import EquipmentChart from '../components/dashboard/AssetChart';
import AssetStatusChart from '../components/dashboard/AssetStatusChart';
import { StatCardData } from '../types';
import { CubeIcon, UsersIcon, BuildingFactoryIcon, WrenchScrewdriverIcon } from '../constants';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useData } from '../contexts/DataContext';
import { EquipmentByUserChart } from './ReportsPage';

const WIDGET_LAYOUT_KEY = 'dashboardLayout_v2';

const DragHandleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
);


const DashboardPage: React.FC = () => {
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [dashboardWidgets, setDashboardWidgets] = useState<(any)[]>([]);
    
    const { data: allData, isLoading } = useData();

    const ALL_WIDGETS = useMemo(() => {
        if (!allData) return [];
        const stats: StatCardData[] = [
            { title: 'Tổng số thiết bị', value: allData.itEquipment.length.toString(), icon: CubeIcon, change: '12.5%', changeType: 'increase' },
            { title: 'Cán bộ đang hoạt động', value: allData.staff.filter(s => s.status === 'Đang hoạt động').length.toString(), icon: UsersIcon, change: '2.1%', changeType: 'increase' },
            { title: 'Nhà sản xuất', value: allData.manufacturers.length.toString(), icon: BuildingFactoryIcon, change: '1.2%', changeType: 'decrease' },
            { title: 'Thiết bị đang bảo trì', value: allData.maintenance.filter(m => m.status === 'Đang tiến hành').length.toString(), icon: WrenchScrewdriverIcon, change: '5.0%', changeType: 'increase' },
        ];
        return [
            { id: 'stat-total-equipment', type: 'StatCard', data: stats[0] },
            { id: 'stat-active-staff', type: 'StatCard', data: stats[1] },
            { id: 'stat-manufacturers', type: 'StatCard', data: stats[2] },
            { id: 'stat-maintenance', type: 'StatCard', data: stats[3] },
            { id: 'chart-equipment-overview', type: 'EquipmentChart', title: 'Tổng quan Thiết bị mới' },
            { id: 'chart-asset-status', type: 'AssetStatusChart', title: 'Thống kê thiết bị theo Trạng thái' },
            { id: 'chart-equipment-by-user', type: 'EquipmentByUserChart', title: 'Thiết bị theo Cán bộ' },
        ];
    }, [allData]);

    // Drag and drop state
    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (isLoading || ALL_WIDGETS.length === 0) return;
        
        const savedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY);
        let initialWidgets: any[];

        if (savedLayout) {
            try {
                const visibleIds = JSON.parse(savedLayout);
                const widgetMap = new Map(ALL_WIDGETS.map(w => [w.id, w]));
                initialWidgets = visibleIds.map((id: string) => widgetMap.get(id)).filter(Boolean);
            } catch (e) {
                initialWidgets = ALL_WIDGETS;
            }
        } else {
            initialWidgets = ALL_WIDGETS;
            localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(ALL_WIDGETS.map(w => w.id)));
        }
        setDashboardWidgets(initialWidgets);
    }, [isLoading, ALL_WIDGETS]);
    

    const handleSaveCustomization = (newVisibleIds: string[]) => {
         const orderedVisibleWidgets = dashboardWidgets.filter(w => newVisibleIds.includes(w.id));
        const currentVisibleIds = new Set(orderedVisibleWidgets.map(w => w.id));
        const newlyAddedWidgets = ALL_WIDGETS.filter(w => newVisibleIds.includes(w.id) && !currentVisibleIds.has(w.id));
        const finalWidgets = [...orderedVisibleWidgets, ...newlyAddedWidgets];
        setDashboardWidgets(finalWidgets);
        localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(finalWidgets.map(w => w.id)));
        setIsCustomizeModalOpen(false);
    };

    const handleDragStart = useCallback((index: number) => { dragItemIndex.current = index; setDragging(true); }, []);
    const handleDragEnter = useCallback((index: number) => { dragOverItemIndex.current = index; }, []);
    
    const handleDrop = useCallback(() => {
        if (dragItemIndex.current === null || dragOverItemIndex.current === null) return;
        const widgetsCopy = [...dashboardWidgets];
        const draggedItem = widgetsCopy.splice(dragItemIndex.current, 1)[0];
        widgetsCopy.splice(dragOverItemIndex.current, 0, draggedItem);
        setDashboardWidgets(widgetsCopy);
        localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(widgetsCopy.map(w => w.id)));
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        setDragging(false);
    }, [dashboardWidgets]);

    if (isLoading) {
        return <div>Đang tải trang chủ...</div>;
    }

    return (
        <div>
            <PageHeader title="TRANG CHỦ">
                <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)}>Tùy chỉnh</Button>
            </PageHeader>
            <div 
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {dashboardWidgets.map((widget, index) => {
                     const isChart = widget.type === 'EquipmentChart' || widget.type === 'AssetStatusChart' || widget.type === 'EquipmentByUserChart';
                     const widgetContent = widget.type === 'StatCard' 
                         ? <StatCard {...(widget.data as StatCardData)} /> 
                         : widget.type === 'EquipmentChart' 
                            ? <EquipmentChart />
                            : widget.type === 'AssetStatusChart' 
                                ? <AssetStatusChart />
                                : widget.type === 'EquipmentByUserChart'
                                    ? <EquipmentByUserChart />
                                    : null;
                    
                     return (
                        <div
                            key={widget.id}
                            className={`relative group transition-shadow duration-300 ${isChart ? 'sm:col-span-2 lg:col-span-4' : ''} ${dragging && dragItemIndex.current === index ? 'opacity-40 shadow-2xl' : 'shadow-md'}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={() => setDragging(false)}
                        >
                            <div className="absolute top-2 right-2 p-1.5 bg-gray-300/50 dark:bg-gray-900/50 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Kéo để di chuyển widget">
                                <DragHandleIcon className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
                            </div>
                            {widgetContent}
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)} title="Tùy chỉnh Trang chủ">
                <CustomizeDashboardForm
                    allWidgets={ALL_WIDGETS}
                    visibleWidgetIds={dashboardWidgets.map(w => w.id)}
                    onSave={handleSaveCustomization}
                />
            </Modal>
        </div>
    );
};

interface CustomizeFormProps {
    allWidgets: any[];
    visibleWidgetIds: string[];
    onSave: (newVisibleIds: string[]) => void;
}

const CustomizeDashboardForm: React.FC<CustomizeFormProps> = ({ allWidgets, visibleWidgetIds, onSave }) => {
    const [localVisibleIds, setLocalVisibleIds] = useState(visibleWidgetIds);
    const handleToggle = (id: string) => setLocalVisibleIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(localVisibleIds); };
    const getWidgetTitle = (widget: any) => {
        if (widget.type === 'StatCard') return (widget.data as StatCardData).title;
        return widget.title || widget.id;
    }

    return (
        <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Chọn các widget bạn muốn hiển thị trên trang chủ.</p>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {allWidgets.map(widget => (
                    <label key={widget.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input type="checkbox" className="h-5 w-5" checked={localVisibleIds.includes(widget.id)} onChange={() => handleToggle(widget.id)} />
                        <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">{getWidgetTitle(widget)}</span>
                    </label>
                ))}
            </div>
            <div className="flex justify-end pt-6">
                <Button type="submit">Lưu thay đổi</Button>
            </div>
        </form>
    );
};

export default DashboardPage;