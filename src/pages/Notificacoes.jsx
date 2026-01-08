import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export default function Notificacoes() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, filter]);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const allNotifications = await base44.entities.Notification.filter({ recipient_user_id: user.id });
            setNotifications(allNotifications.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterNotifications = () => {
        if (filter === 'all') {
            setFilteredNotifications(notifications);
        } else if (filter === 'unread') {
            setFilteredNotifications(notifications.filter(n => !n.is_read));
        } else {
            setFilteredNotifications(notifications.filter(n => n.type === 'ride_request'));
        }
    };

    const handleMarkAsRead = async (notification) => {
        try {
            await base44.entities.Notification.update(notification.id, { is_read: true });
            loadNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            for (const notification of notifications.filter(n => !n.is_read)) {
                await base44.entities.Notification.update(notification.id, { is_read: true });
            }
            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notification) => {
        try {
            await base44.entities.Notification.delete(notification.id);
            loadNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification);
        }
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Notificações</h1>
                    {notifications.some(n => !n.is_read) && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="w-full bg-white p-1 grid grid-cols-3 mb-6">
                        <TabsTrigger value="all" className="rounded-xl">Todas</TabsTrigger>
                        <TabsTrigger value="unread" className="rounded-xl">Não Lidas</TabsTrigger>
                        <TabsTrigger value="rides" className="rounded-xl">Corridas</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-3">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma notificação</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${!notification.is_read ? 'border-l-4 border-amber-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-gray-900">{notification.title}</h3>
                                                {!notification.is_read && (
                                                    <Badge className="bg-amber-100 text-amber-700">Nova</Badge>
                                                )}
                                                {notification.priority === 'urgent' && (
                                                    <Badge className="bg-red-100 text-red-700">Urgente</Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">{notification.message}</p>
                                            <p className="text-xs text-gray-400">{moment(notification.created_date).fromNow()}</p>
                                        </div>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notification);
                                            }}
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
