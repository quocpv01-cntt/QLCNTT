import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
// Fix: Import ITEquipment type for explicit map typing.
import { MaintenanceStatus, AuthContext, UserRole, ITEquipment } from '../types';
import { useData } from './DataContext';

export interface Notification {
  id: string;
  message: string;
  link: string;
  type: 'warning' | 'info';
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isLoading: isDataLoading } = useData();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDataLoading || !data || !user) {
        setIsLoading(true);
        return;
    }

    const { itEquipment: itEquipmentData, maintenance: maintenanceData } = data;
    // Fix: Explicitly type the Map to ensure TypeScript correctly infers the type of its values.
    const equipmentMapByName = new Map<string, ITEquipment>(itEquipmentData.map(e => [e.deviceName, e]));

    const generateNotifications = () => {
        try {
            const generatedNotifications: Notification[] = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Check for warranty expirations (within 30 days)
            itEquipmentData.forEach(item => {
                let isRelevant = false;
                if (user.role === UserRole.ADMIN) {
                    isRelevant = true;
                } else if (user.role === UserRole.UNIT_MANAGER && user.unit && item.unit === user.unit) {
                    isRelevant = true;
                } else if (user.role === UserRole.EMPLOYEE && item.assignedTo === user.name) {
                    isRelevant = true;
                }
                if (!isRelevant) return;

                if (!item.warrantyEndDate) return;
                const warrantyDate = new Date(item.warrantyEndDate);
                warrantyDate.setHours(0,0,0,0);

                const diffTime = warrantyDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 30) {
                    generatedNotifications.push({
                        id: `warranty-${item.id}`,
                        message: `Thiết bị "${item.deviceName}" sắp hết hạn bảo hành trong ${diffDays} ngày.`,
                        link: `/equipment`, 
                        type: 'warning',
                        read: false,
                        timestamp: new Date()
                    });
                }
            });

            // 2. Check for newly scheduled maintenance tasks
            maintenanceData.forEach(task => {
                const relatedEquipment = equipmentMapByName.get(task.assetName);
                if (!relatedEquipment) return;
                
                let isRelevant = false;
                if (user.role === UserRole.ADMIN) {
                    isRelevant = true;
                } else if (user.role === UserRole.UNIT_MANAGER && user.unit && task.unit === user.unit) {
                    isRelevant = true;
                } else if (user.role === UserRole.EMPLOYEE && relatedEquipment.assignedTo === user.name) {
                    isRelevant = true;
                }
                if (!isRelevant) return;

                if (task.status === MaintenanceStatus.SCHEDULED) {
                    generatedNotifications.push({
                        id: `maint-${task.id}`,
                        message: `Bảo trì "${task.maintenanceType}" cho "${task.assetName}" đã được lên lịch.`,
                        link: `/maintenance`,
                        type: 'info',
                        read: false,
                        timestamp: new Date(task.startDate)
                    });
                }
            });
            
            generatedNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setNotifications(generatedNotifications);
        } catch (error) {
            console.error("Failed to generate notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    generateNotifications();
  }, [data, isDataLoading, user]);
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
