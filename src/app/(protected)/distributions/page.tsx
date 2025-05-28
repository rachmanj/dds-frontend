'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Search, FileText, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Distribution,
    DistributionType,
    DistributionFilters,
    PaginatedResponse,
} from '@/types/distribution';
import { Department } from '@/types/department';
import { distributionTypeService, distributionService } from '@/lib/api/distribution';
import { departmentService } from '@/lib/api/departments';
import { getStatusColor, getStatusLabel } from '@/types/distribution';

export default function DistributionsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    // Filters
    const [filters, setFilters] = useState<DistributionFilters>({
        search: '',
        status: undefined,
        type_id: undefined,
        origin_department_id: undefined,
        destination_department_id: undefined,
    });

    // Check authentication
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            if (status === "loading") return;
            if (status === "unauthenticated") {
                setError("You must be logged in to view distributions");
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

                // Load reference data
                const [typesData, departmentsData] = await Promise.all([
                    distributionTypeService.getAll(),
                    departmentService.getAll()
                ]);

                setDistributionTypes(typesData);
                setDepartments(departmentsData);

                // Load distributions
                await loadDistributions();
            } catch (error: any) {
                console.error('Failed to load initial data:', error);
                if (error.response?.status === 401) {
                    setError("Authentication required. Please refresh the page and try again.");
                } else {
                    setError('Failed to load data');
                }
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [status, session?.accessToken]);

    // Load distributions with current filters
    const loadDistributions = async (page: number = 1) => {
        if (!isAuthenticated) return;

        try {
            const response = await distributionService.getAll(filters, page, pagination.per_page);

            // Ensure we always have an array for distributions
            const distributionsData = Array.isArray(response.data) ? response.data : [];

            setDistributions(distributionsData);
            setPagination({
                current_page: response.current_page || 1,
                last_page: response.last_page || 1,
                per_page: response.per_page || 15,
                total: response.total || 0,
            });
        } catch (error: any) {
            console.error('Failed to load distributions:', error);

            // Ensure distributions is always an array even on error
            setDistributions([]);

            if (error.response?.status === 401) {
                setError("Authentication required. Please refresh the page and try again.");
            } else {
                setError('Failed to load distributions: ' + (error.message || 'Unknown error'));
                toast.error('Failed to load distributions');
            }
        }
    };

    // Handle filter changes
    const handleFilterChange = (key: keyof DistributionFilters, value: any) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        setFilters(newFilters);
    };

    // Apply filters
    useEffect(() => {
        if (isAuthenticated) {
            loadDistributions(1);
        }
    }, [filters, isAuthenticated]);

    // Clear error
    const clearError = () => setError(null);

    // Show loading state while checking authentication
    if (status === "loading" || loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                </div>
                            ))}
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
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Authentication Required</h3>
                                <p className="text-muted-foreground">
                                    You need to be logged in to view distributions.
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
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        {error}
                        <Button variant="ghost" size="sm" onClick={clearError}>
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Distributions</h1>
                    <p className="text-muted-foreground">
                        Manage document distributions between departments
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/distributions/reports')}
                    >
                        Reports
                    </Button>
                    <Button onClick={() => router.push('/distributions/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Distribution
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter distributions by various criteria</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search distributions..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="verified_sender">Verified by Sender</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="verified_receiver">Verified by Receiver</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Type Filter */}
                        <Select
                            value={filters.type_id?.toString() || 'all'}
                            onValueChange={(value) => handleFilterChange('type_id', value === 'all' ? undefined : parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {distributionTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* From Department Filter */}
                        <Select
                            value={filters.origin_department_id?.toString() || 'all'}
                            onValueChange={(value) => handleFilterChange('origin_department_id', value === 'all' ? undefined : parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="From Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* To Department Filter */}
                        <Select
                            value={filters.destination_department_id?.toString() || 'all'}
                            onValueChange={(value) => handleFilterChange('destination_department_id', value === 'all' ? undefined : parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="To Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Distributions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        All Distributions ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                        A list of all document distributions in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Distribution Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!Array.isArray(distributions) || distributions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        {filters.search || filters.status || filters.type_id || filters.origin_department_id || filters.destination_department_id
                                            ? "No distributions found matching your filters."
                                            : "No distributions found. Create your first distribution!"
                                        }
                                    </TableCell>
                                </TableRow>
                            ) : (
                                distributions.map((distribution) => (
                                    <TableRow key={distribution.id}>
                                        <TableCell className="font-medium">
                                            <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                                {distribution.distribution_number}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                style={{ backgroundColor: distribution.type?.color + '20', borderColor: distribution.type?.color }}
                                            >
                                                {distribution.type?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{distribution.origin_department?.name}</TableCell>
                                        <TableCell>{distribution.destination_department?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(distribution.status) as "default" | "destructive" | "outline" | "secondary"}>
                                                {getStatusLabel(distribution.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{distribution.creator?.name}</TableCell>
                                        <TableCell>
                                            {new Date(distribution.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/distributions/${distribution.id}`)}
                                                >
                                                    View
                                                </Button>
                                                {distribution.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/distributions/${distribution.id}/edit`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                {pagination.total} distributions
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadDistributions(pagination.current_page - 1)}
                                    disabled={pagination.current_page <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadDistributions(pagination.current_page + 1)}
                                    disabled={pagination.current_page >= pagination.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 