import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const user = await base44.auth.me();
            const notifications = await base44.entities.Notification.filter({ recipient_user_id: user.id });
            const unread = notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshNotifications: loadUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
