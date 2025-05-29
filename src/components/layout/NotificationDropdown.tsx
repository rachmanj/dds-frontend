'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Eye, Trash2, AlertTriangle, CheckCircle, Package, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Notification, mockNotifications } from '@/lib/api/notifications';

// Simple time ago function to replace date-fns
const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
};

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Load notifications (using mock data for now)
    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            // Using mock data for demonstration
            // In real implementation: const data = await notificationService.getAll({ limit: 10 });
            const data = mockNotifications;
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const markAsRead = async (notification: Notification) => {
        if (notification.read) return;

        try {
            // In real implementation: await notificationService.markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // In real implementation: await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

    const deleteNotification = async (notification: Notification, event: React.MouseEvent) => {
        event.stopPropagation();

        try {
            // In real implementation: await notificationService.delete(notification.id);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            if (!notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification);
        setIsOpen(false);

        // Navigate based on notification type
        if (notification.type.includes('distribution') && notification.data?.distribution_id) {
            router.push(`/distributions/${notification.data.distribution_id}`);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'distribution_discrepancy':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'distribution_completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'distribution_received':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'distribution_sent':
                return <Send className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string, read: boolean) => {
        if (read) return 'bg-muted/30';

        switch (type) {
            case 'distribution_discrepancy':
                return 'bg-orange-50 border-l-4 border-l-orange-500';
            case 'distribution_completed':
                return 'bg-green-50 border-l-4 border-l-green-500';
            case 'distribution_received':
                return 'bg-blue-50 border-l-4 border-l-blue-500';
            case 'distribution_sent':
                return 'bg-purple-50 border-l-4 border-l-purple-500';
            default:
                return 'bg-gray-50';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <BellRing className="h-[1.2rem] w-[1.2rem]" />
                    ) : (
                        <Bell className="h-[1.2rem] w-[1.2rem]" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">View notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-1 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`p-0 ${getNotificationColor(notification.type, notification.read)}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="w-full p-3 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getNotificationIcon(notification.type)}
                                                <span className="font-medium text-sm">{notification.title}</span>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto w-auto p-1 opacity-60 hover:opacity-100"
                                                onClick={(e) => deleteNotification(notification, e)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {timeAgo(notification.created_at)}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center text-sm text-muted-foreground cursor-pointer"
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/notifications');
                            }}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 