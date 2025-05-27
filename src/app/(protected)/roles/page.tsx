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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { Role, RoleFormData } from "@/types/user";
import { useRoles } from "@/hooks/useRoles";

export default function RolesPage() {
    const { status } = useSession();
    const {
        roles,
        availablePermissions,
        loading,
        error,
        createRole,
        updateRole,
        deleteRole,
        fetchRoles,
        clearError,
        isAuthenticated,
    } = useRoles();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        guard_name: "web",
        permissions: [],
    });
    const [submitting, setSubmitting] = useState(false);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            fetchRoles(value);
        } else {
            fetchRoles();
        }
    };

    // Create role handler
    const handleCreateRole = async () => {
        setSubmitting(true);
        const success = await createRole(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Role created successfully!");
        } else {
            toast.error("Failed to create role. Please try again.");
        }
        setSubmitting(false);
    };

    // Update role handler
    const handleUpdateRole = async () => {
        if (!editingRole) return;

        setSubmitting(true);
        const success = await updateRole(editingRole.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingRole(null);
            resetForm();
            toast.success("Role updated successfully!");
        } else {
            toast.error("Failed to update role. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete role handler
    const handleDeleteRole = async (id: number) => {
        setSubmitting(true);
        const success = await deleteRole(id);
        if (success) {
            toast.success("Role deleted successfully!");
        } else {
            toast.error("Failed to delete role. Please try again.");
        }
        setDeletingRole(null);
        setIsDeleteDialogOpen(false);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            guard_name: "web",
            permissions: [],
        });
    };

    // Handle edit
    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            guard_name: role.guard_name,
            permissions: role.permissions?.map(permission => permission.id) || [],
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (role: Role) => {
        setDeletingRole(role);
        setIsDeleteDialogOpen(true);
    };

    // Handle permission selection
    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: checked
                ? [...(prev.permissions || []), permissionId]
                : (prev.permissions || []).filter(id => id !== permissionId)
        }));
    };

    // Filter roles based on search term
    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[80px]" />
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
                                    You need to be logged in to access the roles page.
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
                        <Shield className="h-6 w-6 text-purple-600" />
                        <h1 className="text-2xl font-bold">Role Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage roles and their permissions in the system
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Add a new role to the system with appropriate permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter role name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                    {availablePermissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={(formData.permissions || []).includes(permission.id)}
                                                onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                                            />
                                            <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                                                {permission.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRole} disabled={submitting}>
                                {submitting ? "Creating..." : "Create Role"}
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
                        placeholder="Search roles..."
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

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                        A list of all roles in the system with their permissions.
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
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Shield className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No roles found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRoles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{role.guard_name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions?.slice(0, 3).map((permission) => (
                                                        <Badge key={permission.id} variant="secondary" className="text-xs">
                                                            <Key className="h-3 w-3 mr-1" />
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                    {(role.permissions?.length || 0) > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(role.permissions?.length || 0) - 3} more
                                                        </Badge>
                                                    )}
                                                    {(!role.permissions || role.permissions.length === 0) && (
                                                        <span className="text-muted-foreground">No permissions</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(role)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(role)}
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update role information and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Role Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter role name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                {availablePermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-permission-${permission.id}`}
                                            checked={(formData.permissions || []).includes(permission.id)}
                                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`edit-permission-${permission.id}`} className="text-sm">
                                            {permission.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={submitting}>
                            {submitting ? "Updating..." : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role &quot;{deletingRole?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingRole && handleDeleteRole(deletingRole.id)}
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