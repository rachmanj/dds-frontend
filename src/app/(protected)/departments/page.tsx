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
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, Building2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Department, DepartmentFormData } from "@/types/department";
import { useDepartments } from "@/hooks/useDepartments";

export default function DepartmentsPage() {
    const { status } = useSession();
    const {
        departments,
        loading,
        error,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        clearError,
        isAuthenticated,
    } = useDepartments();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
    const [formData, setFormData] = useState<DepartmentFormData>({
        name: "",
        project: "",
        location_code: "",
        transit_code: "",
        akronim: "",
        sap_code: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Create department handler
    const handleCreateDepartment = async () => {
        setSubmitting(true);
        const success = await createDepartment(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Department created successfully!");
        } else {
            toast.error("Failed to create department. Please try again.");
        }
        setSubmitting(false);
    };

    // Update department handler
    const handleUpdateDepartment = async () => {
        if (!editingDepartment) return;

        setSubmitting(true);
        const success = await updateDepartment(editingDepartment.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingDepartment(null);
            resetForm();
            toast.success("Department updated successfully!");
        } else {
            toast.error("Failed to update department. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete department handler
    const handleDeleteDepartment = async (id: number) => {
        setSubmitting(true);
        const success = await deleteDepartment(id);
        if (success) {
            toast.success("Department deleted successfully!");
        } else {
            toast.error("Failed to delete department. Please try again.");
        }
        setDeletingDepartment(null);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            project: "",
            location_code: "",
            transit_code: "",
            akronim: "",
            sap_code: "",
        });
    };

    // Handle edit
    const handleEdit = (department: Department) => {
        setEditingDepartment(department);
        setFormData({
            name: department.name,
            project: department.project,
            location_code: department.location_code,
            transit_code: department.transit_code || "",
            akronim: department.akronim,
            sap_code: department.sap_code || "",
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (department: Department) => {
        setDeletingDepartment(department);
        setIsDeleteDialogOpen(true);
    };

    // Filter departments based on search term
    const filteredDepartments = departments.filter(department =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.akronim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (department.sap_code && department.sap_code.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                    You need to be logged in to access the departments page.
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

            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                        <p className="text-muted-foreground">
                            Manage your departments and their organizational details
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isAuthenticated}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                                <DialogDescription>
                                    Add a new department to your organization.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Department Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter department name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="project">Project *</Label>
                                    <Input
                                        id="project"
                                        value={formData.project}
                                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                        placeholder="Enter project code"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location_code">Location Code *</Label>
                                    <Input
                                        id="location_code"
                                        value={formData.location_code}
                                        onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
                                        placeholder="Enter location code"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="akronim">Acronym *</Label>
                                    <Input
                                        id="akronim"
                                        value={formData.akronim}
                                        onChange={(e) => setFormData({ ...formData, akronim: e.target.value })}
                                        placeholder="Enter department acronym"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="transit_code">Transit Code</Label>
                                    <Input
                                        id="transit_code"
                                        value={formData.transit_code}
                                        onChange={(e) => setFormData({ ...formData, transit_code: e.target.value })}
                                        placeholder="Enter transit code"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sap_code">SAP Code</Label>
                                    <Input
                                        id="sap_code"
                                        value={formData.sap_code}
                                        onChange={(e) => setFormData({ ...formData, sap_code: e.target.value })}
                                        placeholder="Enter SAP code"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateDepartment}
                                    disabled={!formData.name || !formData.project || !formData.location_code || !formData.akronim || submitting}
                                >
                                    {submitting ? "Creating..." : "Create Department"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            {/* Departments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        All Departments
                    </CardTitle>
                    <CardDescription>
                        A list of all departments in your organization.
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
                                    <TableHead>No.</TableHead>
                                    <TableHead>Department Name</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Location Code</TableHead>
                                    <TableHead>Acronym</TableHead>
                                    <TableHead>Transit Code</TableHead>
                                    <TableHead>SAP Code</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDepartments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            {searchTerm ? "No departments found matching your search." : "No departments found. Create your first department!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDepartments.map((department, index) => (
                                        <TableRow key={department.id}>
                                            <TableCell>
                                                <Badge variant="secondary">{index + 1}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {department.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{department.project}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                                    {department.location_code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{department.akronim}</Badge>
                                            </TableCell>
                                            <TableCell>{department.transit_code || "-"}</TableCell>
                                            <TableCell>{department.sap_code || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(department)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(department)}
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update the department details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Department Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter department name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-project">Project *</Label>
                            <Input
                                id="edit-project"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                placeholder="Enter project code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-location_code">Location Code *</Label>
                            <Input
                                id="edit-location_code"
                                value={formData.location_code}
                                onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
                                placeholder="Enter location code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-akronim">Acronym *</Label>
                            <Input
                                id="edit-akronim"
                                value={formData.akronim}
                                onChange={(e) => setFormData({ ...formData, akronim: e.target.value })}
                                placeholder="Enter department acronym"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-transit_code">Transit Code</Label>
                            <Input
                                id="edit-transit_code"
                                value={formData.transit_code}
                                onChange={(e) => setFormData({ ...formData, transit_code: e.target.value })}
                                placeholder="Enter transit code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sap_code">SAP Code</Label>
                            <Input
                                id="edit-sap_code"
                                value={formData.sap_code}
                                onChange={(e) => setFormData({ ...formData, sap_code: e.target.value })}
                                placeholder="Enter SAP code"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingDepartment(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDepartment}
                            disabled={!formData.name || !formData.project || !formData.location_code || !formData.akronim || submitting}
                        >
                            {submitting ? "Updating..." : "Update Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the department &ldquo;{deletingDepartment?.name}&rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingDepartment && (
                        <div className="py-4">
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {deletingDepartment.name}</p>
                                <p><strong>Project:</strong> {deletingDepartment.project}</p>
                                <p><strong>Location Code:</strong> {deletingDepartment.location_code}</p>
                                <p><strong>Acronym:</strong> {deletingDepartment.akronim}</p>
                                <p><strong>Transit Code:</strong> {deletingDepartment.transit_code || "N/A"}</p>
                                <p><strong>SAP Code:</strong> {deletingDepartment.sap_code || "N/A"}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingDepartment(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingDepartment) {
                                    handleDeleteDepartment(deletingDepartment.id);
                                }
                                setIsDeleteDialogOpen(false);
                            }}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
} 