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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { User, UserFormData } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";

export default function UsersPage() {
    const { status } = useSession();
    const {
        users,
        availableRoles,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        fetchUsers,
        clearError,
        isAuthenticated,
    } = useUsers();

    const { departments } = useDepartments();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        username: "",
        email: "",
        nik: "",
        password: "",
        project: "",
        department_id: undefined,
        roles: [],
    });
    const [submitting, setSubmitting] = useState(false);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            fetchUsers(value);
        } else {
            fetchUsers();
        }
    };

    // Create user handler
    const handleCreateUser = async () => {
        setSubmitting(true);
        const success = await createUser(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("User created successfully!");
        } else {
            toast.error("Failed to create user. Please try again.");
        }
        setSubmitting(false);
    };

    // Update user handler
    const handleUpdateUser = async () => {
        if (!editingUser) return;

        setSubmitting(true);
        const updateData = { ...formData };
        if (!updateData.password) {
            delete updateData.password;
        }

        const success = await updateUser(editingUser.id, updateData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingUser(null);
            resetForm();
            toast.success("User updated successfully!");
        } else {
            toast.error("Failed to update user. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete user handler
    const handleDeleteUser = async (id: number) => {
        setSubmitting(true);
        const success = await deleteUser(id);
        if (success) {
            toast.success("User deleted successfully!");
        } else {
            toast.error("Failed to delete user. Please try again.");
        }
        setDeletingUser(null);
        setIsDeleteDialogOpen(false);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            username: "",
            email: "",
            nik: "",
            password: "",
            project: "",
            department_id: undefined,
            roles: [],
        });
    };

    // Handle edit
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            nik: user.nik,
            password: "",
            project: user.project || "",
            department_id: user.department_id,
            roles: user.roles?.map(role => role.id) || [],
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
        setIsDeleteDialogOpen(true);
    };

    // Handle role selection
    const handleRoleChange = (roleId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            roles: checked
                ? [...(prev.roles || []), roleId]
                : (prev.roles || []).filter(id => id !== roleId)
        }));
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.project && user.project.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                    You need to be logged in to access the users page.
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
                        <Users className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage users and their roles in the system
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the system with appropriate roles.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nik">NIK</Label>
                                    <Input
                                        id="nik"
                                        value={formData.nik || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                                        placeholder="Enter NIK"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="project">Project</Label>
                                    <Input
                                        id="project"
                                        value={formData.project || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                                        placeholder="Enter project"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department_id?.toString() || ""}
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            department_id: value ? parseInt(value) : undefined
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                                    {availableRoles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={(formData.roles || []).includes(role.id)}
                                                onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="text-sm">
                                                {role.name}
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
                            <Button onClick={handleCreateUser} disabled={submitting}>
                                {submitting ? "Creating..." : "Create User"}
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
                        placeholder="Search users..."
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

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        A list of all users in the system with their roles and details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
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
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>NIK</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No users found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.nik}</TableCell>
                                            <TableCell>{user.department?.name || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map((role) => (
                                                        <Badge key={role.id} variant="secondary" className="text-xs">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            {role.name}
                                                        </Badge>
                                                    )) || <span className="text-muted-foreground">No roles</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(user)}
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
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and roles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                    id="edit-username"
                                    value={formData.username || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-nik">NIK</Label>
                                <Input
                                    id="edit-nik"
                                    value={formData.nik || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                                    placeholder="Enter NIK"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={formData.password || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-project">Project</Label>
                                <Input
                                    id="edit-project"
                                    value={formData.project || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                                    placeholder="Enter project"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-department">Department</Label>
                                <Select
                                    value={formData.department_id?.toString() || ""}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        department_id: value ? parseInt(value) : undefined
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                                {availableRoles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-role-${role.id}`}
                                            checked={(formData.roles || []).includes(role.id)}
                                            onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`edit-role-${role.id}`} className="text-sm">
                                            {role.name}
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
                        <Button onClick={handleUpdateUser} disabled={submitting}>
                            {submitting ? "Updating..." : "Update User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingUser && handleDeleteUser(deletingUser.id)}
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