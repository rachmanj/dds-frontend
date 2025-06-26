"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/notification";
import notificationService from "@/services/notificationService";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: Notification;
    onClose: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const router = useRouter();
    const { markAsRead, deleteNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);

    const isUnread = notificationService.isUnread(notification);
    const icon = notificationService.getNotificationIcon(notification.type);
    const timeAgo = notificationService.formatNotificationTime(notification.created_at);

    const handleClick = async () => {
        if (isUnread) {
            await markAsRead(notification.id);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteNotification(notification.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex items-start space-x-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                isUnread && "bg-blue-50/50 dark:bg-blue-950/20",
                isLoading && "opacity-50"
            )}
            onClick={handleClick}
        >
            <div className="flex-shrink-0 text-lg mt-0.5">{icon}</div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            "text-sm font-medium truncate",
                            isUnread && "font-semibold"
                        )}>
                            {notification.title}
                        </p>
                        {notification.message && (
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                        {isUnread && (
                            <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-blue-500" />
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground">{timeAgo}</div>
            </div>
        </div>
    );
} 