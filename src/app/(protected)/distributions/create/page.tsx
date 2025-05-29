'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { DistributionForm } from '@/components/distribution/DistributionForm';
import {
    DistributionType,
    CreateDistributionRequest,
    UpdateDistributionRequest,
} from '@/types/distribution';
import { Department } from '@/types/department';
import { distributionTypeService, distributionService } from '@/lib/api/distribution';
import { departmentService } from '@/lib/api/departments';

export default function CreateDistributionPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check authentication
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    // Load required data
    useEffect(() => {
        const loadData = async () => {
            if (status === "loading") return; // Wait for session to load
            if (status === "unauthenticated") {
                setError("You must be logged in to create distributions");
                setLoading(false);
                return;
            }

            if (!session?.accessToken) {
                setError("No access token found. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Load distribution types and departments in parallel
                const [typesData, departmentsData] = await Promise.all([
                    distributionTypeService.getAll(),
                    departmentService.getAll()
                ]);

                setDistributionTypes(typesData);
                setDepartments(departmentsData);
            } catch (error: any) {
                console.error('Failed to load data:', error);
                if (error.response?.status === 401) {
                    setError("Authentication required. Please refresh the page and try again.");
                } else {
                    setError('Failed to load required data');
                }
                toast.error('Failed to load required data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [status, session?.accessToken]);

    // Handle form submission
    const handleSubmit = async (data: CreateDistributionRequest | UpdateDistributionRequest) => {
        if (!isAuthenticated) {
            toast.error('You must be logged in to create distributions');
            return;
        }

        try {
            // Since this is the create page, we know it will always be CreateDistributionRequest
            const createData = data as CreateDistributionRequest;
            console.log('Submitting distribution data:', createData);

            const result = await distributionService.create(createData);
            console.log('Distribution created successfully:', result);

            // Show success message
            toast.success('Distribution created successfully');

            // Show warnings if any
            if (result.warnings && result.warnings.length > 0) {
                result.warnings.forEach((warning: any) => {
                    toast.warning(warning.message, {
                        duration: 5000,
                    });
                });
            }

            // Show auto-included documents info if any
            if (result.auto_included && result.auto_included.length > 0) {
                toast.info(`${result.auto_included.length} additional document(s) were automatically included with the selected invoices.`, {
                    duration: 5000,
                });
            }

            router.push(`/distributions/${result.id}`);
        } catch (error: any) {
            console.error('Failed to create distribution:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.status === 401) {
                toast.error("Authentication required. Please refresh the page and try again.");
            } else if (error.response?.status === 422) {
                toast.error("Validation error: " + (error.response?.data?.message || 'Invalid data provided'));
            } else if (error.response?.status === 500) {
                toast.error("Server error: " + (error.response?.data?.message || error.response?.data?.error || 'Internal server error'));
            } else {
                toast.error(error.message || 'Failed to create distribution');
            }
            throw error; // Re-throw to let form handle the error state
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push('/distributions');
    };

    // Show loading state while checking authentication
    if (status === "loading" || loading) {
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
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                            <div className="space-y-3 mt-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
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
                        <div className="text-center space-y-4">
                            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Authentication Required</h3>
                                <p className="text-muted-foreground">
                                    You need to be logged in to create distributions.
                                </p>
                                {error && (
                                    <p className="text-sm text-red-600 mt-2">{error}</p>
                                )}
                            </div>
                            <Button onClick={() => window.location.href = '/login'}>
                                Go to Login
                            </Button>
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
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Distribution</h1>
                        <p className="text-muted-foreground">
                            Create a new document distribution between departments
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <DistributionForm
                distributionTypes={distributionTypes}
                departments={departments}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                currentUser={session?.user}
            />
        </div>
    );
} 