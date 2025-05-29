'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { DistributionForm } from '@/components/distribution/DistributionForm';
import {
    Distribution,
    DistributionType,
    Department,
    UpdateDistributionRequest,
} from '@/types/distribution';
import { distributionService, distributionTypeService } from '@/lib/api/distribution';
import { departmentService } from '@/lib/api/departments';

export default function EditDistributionPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const distributionId = parseInt(params.id as string);

    const [distribution, setDistribution] = useState<Distribution | null>(null);
    const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load required data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load distribution and required data in parallel
                const [distributionData, typesData, departmentsData] = await Promise.all([
                    distributionService.getById(distributionId),
                    distributionTypeService.getAll(),
                    departmentService.getAll()
                ]);

                // Check if distribution can be edited (only draft status)
                if (distributionData.status !== 'draft') {
                    setError('This distribution cannot be edited. Only draft distributions can be modified.');
                    return;
                }

                setDistribution(distributionData);
                setDistributionTypes(typesData);
                setDepartments(departmentsData as Department[]);
            } catch (error: any) {
                console.error('Failed to load data:', error);
                setError(error.message || 'Failed to load distribution data');
                toast.error('Failed to load distribution data');
            } finally {
                setLoading(false);
            }
        };

        if (distributionId) {
            loadData();
        } else {
            setError('Invalid distribution ID');
            setLoading(false);
        }
    }, [distributionId]);

    // Handle form submission
    const handleSubmit = async (data: UpdateDistributionRequest) => {
        try {
            const updatedDistribution = await distributionService.update(distributionId, data);
            toast.success('Distribution updated successfully');
            router.push(`/distributions/${updatedDistribution.id}`);
        } catch (error: any) {
            console.error('Failed to update distribution:', error);
            toast.error(error.message || 'Failed to update distribution');
            throw error; // Re-throw to let form handle the error state
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push(`/distributions/${distributionId}`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Loading distribution...</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-destructive font-medium">{error}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.push('/distributions')}
                                >
                                    Go Back to Distributions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!distribution) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-muted-foreground">Distribution not found</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.push('/distributions')}
                                >
                                    Go Back to Distributions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/distributions/${distributionId}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distribution
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Distribution</h1>
                        <p className="text-muted-foreground">
                            Modify distribution {distribution.distribution_number}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <DistributionForm
                initialData={distribution}
                distributionTypes={distributionTypes}
                departments={departments}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing={true}
                currentUser={session?.user}
            />
        </div>
    );
} 