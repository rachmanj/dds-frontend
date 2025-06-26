"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationCenter } from "./NotificationCenter";

interface NotificationBellProps {
    unreadCount: number;
    className?: string;
}

export function NotificationBell({ unreadCount, className }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`relative ${className}`}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-96 p-0"
                align="end"
                sideOffset={8}
            >
                <NotificationCenter onClose={() => setIsOpen(false)} />
            </PopoverContent>
        </Popover>
    );
} 