"use client";

import { useEffect } from "react";
import { MoreHorizontal, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationCenterProps {
    onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAllAsRead,
        refresh,
    } = useNotifications();

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={refresh}>
                                Refresh
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Separator />

            <div className="max-h-96">
                <ScrollArea className="h-full">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex space-x-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            <p>Failed to load notifications</p>
                            <Button variant="ghost" size="sm" onClick={refresh} className="mt-2">
                                Try again
                            </Button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <div className="text-4xl mb-2">🔔</div>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClose={onClose}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
} 