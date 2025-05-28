'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Search, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { DistributionType, CreateDistributionTypeRequest, UpdateDistributionTypeRequest } from '@/types/distribution';
import { distributionTypeService } from '@/lib/api/distribution';
import { DistributionTypeForm } from '@/components/distribution/DistributionTypeForm';

export default function DistributionTypesPage() {
    const { data: session, status } = useSession();
    const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<DistributionType | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Check authentication
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    // Load distribution types
    const loadDistributionTypes = async () => {
        if (status === "loading") return;
        if (!isAuthenticated) {
            setError("You must be logged in to view distribution types");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await distributionTypeService.getAll();
            setDistributionTypes(data);
        } catch (error: unknown) {
            console.error('Failed to load distribution types:', error);
            toast.error('Failed to load distribution types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDistributionTypes();
    }, [status, session?.accessToken]);

    // Filter distribution types based on search term
    const filteredTypes = distributionTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle create
    const handleCreate = async (data: CreateDistributionTypeRequest | UpdateDistributionTypeRequest) => {
        try {
            await distributionTypeService.create(data as CreateDistributionTypeRequest);
            toast.success('Distribution type created successfully');
            setIsCreateDialogOpen(false);
            loadDistributionTypes();
        } catch (error: unknown) {
            console.error('Failed to create distribution type:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create distribution type';
            toast.error(errorMessage);
        }
    };

    // Handle update
    const handleUpdate = async (data: CreateDistributionTypeRequest | UpdateDistributionTypeRequest) => {
        if (!selectedType) return;

        try {
            await distributionTypeService.update(selectedType.id, data as UpdateDistributionTypeRequest);
            toast.success('Distribution type updated successfully');
            setIsEditDialogOpen(false);
            setSelectedType(null);
            loadDistributionTypes();
        } catch (error: unknown) {
            console.error('Failed to update distribution type:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update distribution type';
            toast.error(errorMessage);
        }
    };

    // Handle delete
    const handleDelete = async (type: DistributionType) => {
        try {
            await distributionTypeService.delete(type.id);
            toast.success('Distribution type deleted successfully');
            loadDistributionTypes();
        } catch (error: unknown) {
            console.error('Failed to delete distribution type:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete distribution type';
            toast.error(errorMessage);
        }
    };

    // Handle edit click
    const handleEditClick = (type: DistributionType) => {
        setSelectedType(type);
        setIsEditDialogOpen(true);
    };

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
                                    You need to be logged in to view distribution types.
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
                    <h1 className="text-3xl font-bold tracking-tight">Distribution Types</h1>
                    <p className="text-muted-foreground">
                        Manage distribution types and their priorities
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Distribution Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Distribution Type</DialogTitle>
                            <DialogDescription>
                                Add a new distribution type with priority and color coding.
                            </DialogDescription>
                        </DialogHeader>
                        <DistributionTypeForm
                            onSubmit={handleCreate}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>
                        Find distribution types by name, code, or description
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search distribution types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Distribution Types Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribution Types ({filteredTypes.length})</CardTitle>
                    <CardDescription>
                        Manage distribution types and their configurations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTypes.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-muted-foreground">No distribution types found</p>
                                {searchTerm && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Try adjusting your search criteria
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{type.code}</Badge>
                                        </TableCell>
                                        <TableCell>{type.priority}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded border"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {type.color}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {type.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(type)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Distribution Type</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete &quot;{type.name}&quot;? This action cannot be undone.
                                                                This will fail if the distribution type is being used by any distributions.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(type)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Distribution Type</DialogTitle>
                        <DialogDescription>
                            Update the distribution type information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedType && (
                        <DistributionTypeForm
                            initialData={selectedType}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedType(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 