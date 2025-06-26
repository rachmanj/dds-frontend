"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";
import { useWebSocket } from "@/hooks/useWebSocket";

export function NotificationDropdown() {
    const { data: session } = useSession();
    const { unreadCount, addNotification, updateNotification, refresh } = useNotifications();
    const websocket = useWebSocket(session?.user?.id ? Number(session.user.id) : undefined);

    // Handle real-time notifications only if WebSocket is available
    useEffect(() => {
        if (!session?.user?.id || !websocket.isConnected) return;

        const handleNewNotification = (notification: any) => {
            console.log('New notification received:', notification);
            addNotification(notification);
        };

        const handleNotificationRead = (data: { id: number }) => {
            console.log('Notification read:', data);
            updateNotification(data.id, { read_at: new Date().toISOString() });
        };

        const handleAllNotificationsRead = () => {
            console.log('All notifications marked as read');
            refresh();
        };

        // Only set up event handlers if WebSocket is connected
        if (websocket.onNotification && websocket.isConnected) {
            websocket.onNotification(handleNewNotification);
        }

        if (websocket.onNotificationRead && websocket.isConnected) {
            websocket.onNotificationRead(handleNotificationRead);
        }

        if (websocket.onAllNotificationsRead && websocket.isConnected) {
            websocket.onAllNotificationsRead(handleAllNotificationsRead);
        }

        // Note: No cleanup needed as useWebSocket handles it internally
    }, [
        session?.user?.id,
        websocket.isConnected,
        websocket.onNotification,
        websocket.onNotificationRead,
        websocket.onAllNotificationsRead,
        addNotification,
        updateNotification,
        refresh,
    ]);

    return <NotificationBell unreadCount={unreadCount} />;
} 