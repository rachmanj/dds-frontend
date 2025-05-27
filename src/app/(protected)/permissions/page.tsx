"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, Key, Shield } from "lucide-react";
import { toast } from "sonner";
import { Permission, PermissionFormData } from "@/types/user";
import { usePermissions } from "@/hooks/usePermissions";

export default function PermissionsPage() {
    const { status } = useSession();
    const {
        permissions,
        loading,
        error,
        createPermission,
        updatePermission,
        deletePermission,
        fetchPermissions,
        clearError,
        isAuthenticated,
    } = usePermissions();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);
    const [formData, setFormData] = useState<PermissionFormData>({
        name: "",
        guard_name: "web",
    });
    const [submitting, setSubmitting] = useState(false);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            fetchPermissions(value);
        } else {
            fetchPermissions();
        }
    };

    // Create permission handler
    const handleCreatePermission = async () => {
        setSubmitting(true);
        const success = await createPermission(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Permission created successfully!");
        } else {
            toast.error("Failed to create permission. Please try again.");
        }
        setSubmitting(false);
    };

    // Update permission handler
    const handleUpdatePermission = async () => {
        if (!editingPermission) return;

        setSubmitting(true);
        const success = await updatePermission(editingPermission.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingPermission(null);
            resetForm();
            toast.success("Permission updated successfully!");
        } else {
            toast.error("Failed to update permission. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete permission handler
    const handleDeletePermission = async (id: number) => {
        setSubmitting(true);
        const success = await deletePermission(id);
        if (success) {
            toast.success("Permission deleted successfully!");
        } else {
            toast.error("Failed to delete permission. Please try again.");
        }
        setDeletingPermission(null);
        setIsDeleteDialogOpen(false);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            guard_name: "web",
        });
    };

    // Handle edit
    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            guard_name: permission.guard_name,
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (permission: Permission) => {
        setDeletingPermission(permission);
        setIsDeleteDialogOpen(true);
    };

    // Filter permissions based on search term
    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="container mx-auto py-6 space-y-6">
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
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[100px]" />
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
            <div className="container mx-auto py-6 space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Authentication Required</h3>
                                <p className="text-muted-foreground">
                                    You need to be logged in to access the permissions page.
                                </p>
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
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Key className="h-6 w-6 text-green-600" />
                        <h1 className="text-2xl font-bold">Permission Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage permissions in the system
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Permission
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Permission</DialogTitle>
                            <DialogDescription>
                                Add a new permission to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter permission name (e.g., users.create)"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePermission} disabled={submitting}>
                                {submitting ? "Creating..." : "Create Permission"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearError}
                            className="ml-2"
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Permissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                        A list of all permissions in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Guard</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPermissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Key className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No permissions found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPermissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">{permission.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{permission.guard_name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.roles?.slice(0, 3).map((role) => (
                                                        <Badge key={role.id} variant="secondary" className="text-xs">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                    {(permission.roles?.length || 0) > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(permission.roles?.length || 0) - 3} more
                                                        </Badge>
                                                    )}
                                                    {(!permission.roles || permission.roles.length === 0) && (
                                                        <span className="text-muted-foreground">No roles</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(permission)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(permission)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Permission</DialogTitle>
                        <DialogDescription>
                            Update permission information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Permission Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter permission name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePermission} disabled={submitting}>
                            {submitting ? "Updating..." : "Update Permission"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Permission</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the permission &quot;{deletingPermission?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingPermission && handleDeletePermission(deletingPermission.id)}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 