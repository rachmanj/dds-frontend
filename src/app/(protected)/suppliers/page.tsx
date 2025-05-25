"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    AlertCircle,
    LogIn,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Supplier, SupplierFormData } from "@/types/supplier";
import { useSuppliers } from "@/hooks/useSuppliers";

export default function SuppliersPage() {
    const { status } = useSession();
    const {
        suppliers,
        loading,
        error,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        clearError,
        isAuthenticated,
    } = useSuppliers();

    const [globalFilter, setGlobalFilter] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState<SupplierFormData>({
        sap_code: "",
        name: "",
        type: "vendor",
        city: "",
        payment_project: "001H",
        is_active: true,
        address: "",
        npwp: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Define table columns
    const columns = useMemo<ColumnDef<Supplier>[]>(
        () => [
            {
                id: "index",
                header: "No.",
                cell: ({ row, table }) => (
                    <Badge variant="secondary">
                        {row.index + 1 + (table.getState().pagination.pageIndex * table.getState().pagination.pageSize)}
                    </Badge>
                ),
            },
            {
                accessorKey: "name",
                header: "Supplier Name",
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as string}</span>
                ),
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ getValue }) => {
                    const type = getValue() as string;
                    return (
                        <Badge variant={type === 'vendor' ? 'default' : 'outline'}>
                            {type}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "sap_code",
                header: "SAP Code",
                cell: ({ getValue }) => {
                    const value = getValue() as string | undefined;
                    return value ? (
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                            {value}
                        </code>
                    ) : "-";
                },
            },
            {
                accessorKey: "city",
                header: "City",
                cell: ({ getValue }) => (getValue() as string) || "-",
            },
            {
                accessorKey: "payment_project",
                header: "Payment Project",
                cell: ({ getValue }) => (
                    <Badge variant="outline">{getValue() as string}</Badge>
                ),
            },
            {
                accessorKey: "npwp",
                header: "NPWP",
                cell: ({ getValue }) => (getValue() as string) || "-",
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ getValue }) => {
                    const isActive = getValue() as boolean;
                    return (
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    // Create table instance
    const table = useReactTable({
        data: suppliers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    // Create supplier handler
    const handleCreateSupplier = async () => {
        setSubmitting(true);
        const success = await createSupplier(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Supplier created successfully!");
        } else {
            toast.error("Failed to create supplier. Please try again.");
        }
        setSubmitting(false);
    };

    // Update supplier handler
    const handleUpdateSupplier = async () => {
        if (!editingSupplier) return;

        setSubmitting(true);
        const success = await updateSupplier(editingSupplier.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingSupplier(null);
            resetForm();
            toast.success("Supplier updated successfully!");
        } else {
            toast.error("Failed to update supplier. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete supplier handler
    const handleDeleteSupplier = async (id: number) => {
        setSubmitting(true);
        const success = await deleteSupplier(id);
        if (success) {
            toast.success("Supplier deleted successfully!");
        } else {
            toast.error("Failed to delete supplier. Please try again.");
        }
        setDeletingSupplier(null);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            sap_code: "",
            name: "",
            type: "vendor",
            city: "",
            payment_project: "001H",
            is_active: true,
            address: "",
            npwp: "",
        });
    };

    // Handle edit
    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            sap_code: supplier.sap_code || "",
            name: supplier.name,
            type: supplier.type,
            city: supplier.city || "",
            payment_project: supplier.payment_project,
            is_active: supplier.is_active,
            address: supplier.address || "",
            npwp: supplier.npwp || "",
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (supplier: Supplier) => {
        setDeletingSupplier(supplier);
        setIsDeleteDialogOpen(true);
    };

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
                                    You need to be logged in to access the suppliers page.
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
                        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                        <p className="text-muted-foreground">
                            Manage your suppliers and vendors information
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isAuthenticated}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Supplier</DialogTitle>
                                <DialogDescription>
                                    Add a new supplier to your system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Supplier Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter supplier name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: 'vendor' | 'customer') =>
                                            setFormData({ ...formData, type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vendor">Vendor</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_project">Payment Project *</Label>
                                    <Input
                                        id="payment_project"
                                        value={formData.payment_project}
                                        onChange={(e) => setFormData({ ...formData, payment_project: e.target.value })}
                                        placeholder="Enter payment project code"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Enter address"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="npwp">NPWP</Label>
                                    <Input
                                        id="npwp"
                                        value={formData.npwp}
                                        onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                                        placeholder="Enter NPWP number"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
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
                                    onClick={handleCreateSupplier}
                                    disabled={!formData.name || !formData.type || !formData.payment_project || submitting}
                                >
                                    {submitting ? "Creating..." : "Create Supplier"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search and Controls */}
                <div className="flex items-center justify-between space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="per-page" className="text-sm">Show:</Label>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Suppliers Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Suppliers
                    </CardTitle>
                    <CardDescription>
                        A list of all suppliers and vendors in your system.
                        {table.getFilteredRowModel().rows.length > 0 && (
                            <span className="ml-2">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} suppliers
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
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
                        <>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center py-8">
                                                {globalFilter ? "No suppliers found matching your search." : "No suppliers found. Create your first supplier!"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {table.getPageCount() > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Update the supplier details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Supplier Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter supplier name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'vendor' | 'customer') =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vendor">Vendor</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <div className="grid gap-2">
                            <Label htmlFor="edit-city">City</Label>
                            <Input
                                id="edit-city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Enter city"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-payment_project">Payment Project *</Label>
                            <Input
                                id="edit-payment_project"
                                value={formData.payment_project}
                                onChange={(e) => setFormData({ ...formData, payment_project: e.target.value })}
                                placeholder="Enter payment project code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Textarea
                                id="edit-address"
                                value={formData.address}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter address"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-npwp">NPWP</Label>
                            <Input
                                id="edit-npwp"
                                value={formData.npwp}
                                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                                placeholder="Enter NPWP number"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="edit-is_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingSupplier(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateSupplier}
                            disabled={!formData.name || !formData.type || !formData.payment_project || submitting}
                        >
                            {submitting ? "Updating..." : "Update Supplier"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Supplier</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the supplier &ldquo;{deletingSupplier?.name}&rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingSupplier && (
                        <div className="py-4">
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {deletingSupplier.name}</p>
                                <p><strong>Type:</strong> {deletingSupplier.type}</p>
                                <p><strong>SAP Code:</strong> {deletingSupplier.sap_code || "N/A"}</p>
                                <p><strong>City:</strong> {deletingSupplier.city || "N/A"}</p>
                                <p><strong>Payment Project:</strong> {deletingSupplier.payment_project}</p>
                                <p><strong>NPWP:</strong> {deletingSupplier.npwp || "N/A"}</p>
                                <p><strong>Status:</strong> {deletingSupplier.is_active ? "Active" : "Inactive"}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingSupplier(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingSupplier) {
                                    handleDeleteSupplier(deletingSupplier.id);
                                }
                                setIsDeleteDialogOpen(false);
                            }}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete Supplier"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
} 