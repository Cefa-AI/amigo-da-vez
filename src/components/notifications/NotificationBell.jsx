import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './NotificationProvider';

export function NotificationBell() {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();

    return (
        <button
            onClick={() => navigate('/Notificacoes')}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
            )}
        </button>
    );
}
