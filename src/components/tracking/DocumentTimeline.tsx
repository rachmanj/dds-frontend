'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, MapPin, User, FileText } from 'lucide-react';
import { useDocumentTimeline } from '@/hooks/useDocumentTracking';
import { DocumentTrackingService } from '@/services/documentTrackingService';
import { TimelineEvent } from '@/types/tracking';

interface DocumentTimelineProps {
    documentType: 'invoice' | 'additional_document';
    documentId: number;
    className?: string;
}

export const DocumentTimeline: React.FC<DocumentTimelineProps> = ({
    documentType,
    documentId,
    className = '',
}) => {
    const { timeline, loading, error, refetch } = useDocumentTimeline(documentType, documentId);

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Document Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Document Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Document Timeline
                    <Badge variant="secondary" className="ml-auto">
                        {timeline.length} events
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    {timeline.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No timeline events found</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                            <div className="space-y-6">
                                {timeline.map((event, index) => (
                                    <TimelineEventItem
                                        key={`${event.type}-${event.date}-${index}`}
                                        event={event}
                                        isLast={index === timeline.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

interface TimelineEventItemProps {
    event: TimelineEvent;
    isLast: boolean;
}

const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ event, isLast }) => {
    const eventText = DocumentTrackingService.formatTimelineEvent(event);
    const eventIcon = DocumentTrackingService.getEventIcon(event);
    const eventColor = DocumentTrackingService.getEventColor(event);
    const relativeTime = DocumentTrackingService.formatRelativeTime(event.date);

    const colorClasses = {
        blue: 'bg-blue-500 border-blue-200',
        green: 'bg-green-500 border-green-200',
        yellow: 'bg-yellow-500 border-yellow-200',
        red: 'bg-red-500 border-red-200',
        purple: 'bg-purple-500 border-purple-200',
        orange: 'bg-orange-500 border-orange-200',
        teal: 'bg-teal-500 border-teal-200',
        emerald: 'bg-emerald-500 border-emerald-200',
        gray: 'bg-gray-500 border-gray-200',
    };

    return (
        <div className="relative flex items-start gap-3">
            <div className={`
        relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background text-xs
        ${colorClasses[eventColor as keyof typeof colorClasses] || colorClasses.gray}
      `}>
                {eventIcon}
            </div>

            <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">
                        {eventText}
                    </p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {relativeTime}
                    </time>
                </div>

                <div className="space-y-1">
                    {event.type === 'location_change' && (
                        <>
                            {event.moved_by && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>Moved by: {event.moved_by}</span>
                                </div>
                            )}
                            {event.distribution_number && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    <span>Distribution: {event.distribution_number}</span>
                                </div>
                            )}
                            {event.reason && (
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Reason:</span> {event.reason}
                                </div>
                            )}
                        </>
                    )}

                    {event.type === 'tracking_event' && (
                        <>
                            {event.user && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>By: {event.user}</span>
                                </div>
                            )}
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    <details className="mt-1">
                                        <summary className="cursor-pointer hover:text-foreground">
                                            View details
                                        </summary>
                                        <pre className="mt-1 text-xs bg-muted p-2 rounded text-muted-foreground overflow-x-auto">
                                            {JSON.stringify(event.metadata, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                    {new Date(event.date).toLocaleString()}
                </div>
            </div>
        </div>
    );
}; 