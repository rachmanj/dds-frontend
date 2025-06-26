'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationBadgeProps {
    locationCode: string;
    departmentName?: string;
    isCurrentLocation?: boolean;
    lastMoved?: string;
    className?: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
    locationCode,
    departmentName,
    isCurrentLocation = false,
    lastMoved,
    className = '',
    variant = 'default',
}) => {
    const displayText = departmentName
        ? `${departmentName} (${locationCode})`
        : locationCode;

    const badgeVariant = isCurrentLocation ? 'default' : variant;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Badge
                variant={badgeVariant}
                className={cn(
                    'flex items-center gap-1',
                    isCurrentLocation && 'bg-green-500 hover:bg-green-600 text-white'
                )}
            >
                <MapPin className="h-3 w-3" />
                {displayText}
                {isCurrentLocation && (
                    <span className="ml-1 text-xs">• Current</span>
                )}
            </Badge>

            {lastMoved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(lastMoved)}</span>
                </div>
            )}
        </div>
    );
};

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
} 