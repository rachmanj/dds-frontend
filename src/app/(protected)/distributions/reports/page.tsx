'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { DistributionReports } from '@/components/distribution/DistributionReports';

export default function DistributionReportsPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Distributions
                </Button>
            </div>

            {/* Reports Component */}
            <DistributionReports />
        </div>
    );
} 