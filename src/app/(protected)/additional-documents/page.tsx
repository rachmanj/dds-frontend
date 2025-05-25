"use client";

import { useState, useMemo, useCallback } from "react";
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
    FileText,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { AdditionalDocument, AdditionalDocumentFormData } from "@/types/additional-document";
import { useAdditionalDocuments } from "@/hooks/useAdditionalDocuments";
import { useAdditionalDocumentTypes } from "@/hooks/useAdditionalDocumentTypes";
import { useDepartments } from "@/hooks/useDepartments";

export default function AdditionalDocumentsPage() {
    const { status } = useSession();
    const {
        additionalDocuments,
        loading,
        error,
        createAdditionalDocument,
        updateAdditionalDocument,
        deleteAdditionalDocument,
        clearError,
        isAuthenticated,
    } = useAdditionalDocuments();

    const {
        additionalDocumentTypes,
    } = useAdditionalDocumentTypes();

    const {
        departments,
    } = useDepartments();

    const [globalFilter, setGlobalFilter] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<AdditionalDocument | null>(null);
    const [deletingDocument, setDeletingDocument] = useState<AdditionalDocument | null>(null);
    const [formData, setFormData] = useState<AdditionalDocumentFormData>({
        type_id: 0,
        document_number: "",
        document_date: "",
        po_no: "",
        project: "",
        receive_date: "",
        remarks: "",
        cur_loc: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // State for searchable department select
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");

    // State for searchable document type select
    const [typeSearchTerm, setTypeSearchTerm] = useState("");

    // Sort departments by project for consistent ordering
    const sortedDepartments = useMemo(() => {
        return [...departments].sort((a, b) => {
            if (a.project !== b.project) {
                return a.project.localeCompare(b.project);
            }
            return a.name.localeCompare(b.name);
        });
    }, [departments]);

    // Filter departments based on search term
    const filteredDepartments = useMemo(() => {
        if (!departmentSearchTerm) return sortedDepartments;
        return sortedDepartments.filter(department =>
            department.name.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
            department.project.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
            department.location_code.toLowerCase().includes(departmentSearchTerm.toLowerCase())
        );
    }, [sortedDepartments, departmentSearchTerm]);

    // Filter document types based on search term
    const filteredDocumentTypes = useMemo(() => {
        if (!typeSearchTerm) return additionalDocumentTypes;
        return additionalDocumentTypes.filter(type =>
            type.type_name.toLowerCase().includes(typeSearchTerm.toLowerCase())
        );
    }, [additionalDocumentTypes, typeSearchTerm]);

    // Helper function to get department display name
    const getDepartmentDisplayName = useCallback((locationCode: string) => {
        const department = departments.find(dept => dept.location_code === locationCode);
        if (!department) return locationCode;
        return department.name;
    }, [departments]);

    // Helper function to get department option display format
    const getDepartmentOptionDisplay = (department: { project: string; name: string; location_code: string }) => {
        return `${department.project} - ${department.name} - ${department.location_code}`;
    };

    // Define table columns
    const columns = useMemo<ColumnDef<AdditionalDocument>[]>(
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
                accessorKey: "document_number",
                header: "Document Number",
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as string}</span>
                ),
            },
            {
                accessorKey: "type.type_name",
                header: "Type",
                cell: ({ row }) => {
                    const type = row.original.type;
                    return type ? (
                        <Badge variant="outline">{type.type_name}</Badge>
                    ) : "-";
                },
            },
            {
                accessorKey: "document_date",
                header: "Document Date",
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return date ? new Date(date).toLocaleDateString() : "-";
                },
            },
            {
                accessorKey: "po_no",
                header: "PO Number",
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
                accessorKey: "project",
                header: "Project",
                cell: ({ getValue }) => (getValue() as string) || "-",
            },
            {
                accessorKey: "receive_date",
                header: "Receive Date",
                cell: ({ getValue }) => {
                    const date = getValue() as string | undefined;
                    return date ? new Date(date).toLocaleDateString() : "-";
                },
            },
            {
                accessorKey: "creator.name",
                header: "Created By",
                cell: ({ row }) => {
                    const creator = row.original.creator;
                    return creator ? creator.name : "-";
                },
            },
            {
                accessorKey: "cur_loc",
                header: "Current Location",
                cell: ({ getValue }) => {
                    const locationCode = getValue() as string;
                    return locationCode ? getDepartmentDisplayName(locationCode) : "-";
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
        [getDepartmentDisplayName]
    );

    // Create table instance
    const table = useReactTable({
        data: additionalDocuments,
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

    // Create document handler
    const handleCreateDocument = async () => {
        setSubmitting(true);
        const success = await createAdditionalDocument(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Additional document created successfully!");
        } else {
            toast.error("Failed to create additional document. Please try again.");
        }
        setSubmitting(false);
    };

    // Update document handler
    const handleUpdateDocument = async () => {
        if (!editingDocument) return;

        setSubmitting(true);
        const success = await updateAdditionalDocument(editingDocument.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingDocument(null);
            resetForm();
            toast.success("Additional document updated successfully!");
        } else {
            toast.error("Failed to update additional document. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete document handler
    const handleDeleteDocument = async (id: number) => {
        setSubmitting(true);
        const success = await deleteAdditionalDocument(id);
        if (success) {
            toast.success("Additional document deleted successfully!");
        } else {
            toast.error("Failed to delete additional document. Please try again.");
        }
        setDeletingDocument(null);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            type_id: 0,
            document_number: "",
            document_date: "",
            po_no: "",
            project: "",
            receive_date: "",
            remarks: "",
            cur_loc: "",
        });
        setTypeSearchTerm("");
        setDepartmentSearchTerm("");
    };

    // Handle edit
    const handleEdit = (document: AdditionalDocument) => {
        setEditingDocument(document);

        // Format date to YYYY-MM-DD for HTML date input
        const formatDateForInput = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        const editFormData = {
            type_id: document.type?.id || document.type_id || 0,
            document_number: document.document_number,
            document_date: formatDateForInput(document.document_date),
            po_no: document.po_no || "",
            project: document.project || "",
            receive_date: document.receive_date ? formatDateForInput(document.receive_date) : "",
            remarks: document.remarks || "",
            cur_loc: document.cur_loc || "",
        };

        setFormData(editFormData);

        // Clear search terms when opening edit dialog
        setTypeSearchTerm("");
        setDepartmentSearchTerm("");

        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (document: AdditionalDocument) => {
        setDeletingDocument(document);
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
                                    You need to be logged in to access the additional documents page.
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
                        <h1 className="text-3xl font-bold tracking-tight">Additional Documents</h1>
                        <p className="text-muted-foreground">
                            Manage additional documents and their information
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isAuthenticated}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Additional Document</DialogTitle>
                                <DialogDescription>
                                    Add a new additional document to your system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type_id">Document Type *</Label>
                                    <Select
                                        value={formData.type_id ? formData.type_id.toString() : ""}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, type_id: parseInt(value) })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 border-b">
                                                <Input
                                                    placeholder="Search document types..."
                                                    value={typeSearchTerm}
                                                    onChange={(e) => setTypeSearchTerm(e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {filteredDocumentTypes.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No document types found
                                                    </div>
                                                ) : (
                                                    filteredDocumentTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.type_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="document_number">Document Number *</Label>
                                    <Input
                                        id="document_number"
                                        value={formData.document_number}
                                        onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                        placeholder="Enter document number"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="document_date">Document Date *</Label>
                                    <Input
                                        id="document_date"
                                        type="date"
                                        value={formData.document_date}
                                        onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="po_no">PO Number</Label>
                                    <Input
                                        id="po_no"
                                        value={formData.po_no}
                                        onChange={(e) => setFormData({ ...formData, po_no: e.target.value })}
                                        placeholder="Enter PO number"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="project">Project</Label>
                                    <Input
                                        id="project"
                                        value={formData.project}
                                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                        placeholder="Enter project"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="receive_date">Receive Date</Label>
                                    <Input
                                        id="receive_date"
                                        type="date"
                                        value={formData.receive_date}
                                        onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cur_loc">Current Location</Label>
                                    <Select
                                        value={formData.cur_loc || ""}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, cur_loc: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select current location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 border-b">
                                                <Input
                                                    placeholder="Search departments..."
                                                    value={departmentSearchTerm}
                                                    onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {filteredDepartments.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No departments found
                                                    </div>
                                                ) : (
                                                    filteredDepartments.map((department) => (
                                                        <SelectItem key={department.id} value={department.location_code}>
                                                            {getDepartmentOptionDisplay(department)}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        value={formData.remarks}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, remarks: e.target.value })}
                                        placeholder="Enter remarks"
                                        rows={3}
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
                                    onClick={handleCreateDocument}
                                    disabled={!formData.type_id || !formData.document_number || !formData.document_date || submitting}
                                >
                                    {submitting ? "Creating..." : "Create Document"}
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
                            placeholder="Search documents..."
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

            {/* Documents Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        All Additional Documents
                    </CardTitle>
                    <CardDescription>
                        A list of all additional documents in your system.
                        {table.getFilteredRowModel().rows.length > 0 && (
                            <span className="ml-2">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} documents
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
                                                {globalFilter ? "No documents found matching your search." : "No documents found. Create your first document!"}
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
                        <DialogTitle>Edit Additional Document</DialogTitle>
                        <DialogDescription>
                            Update the document details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type_id">Document Type *</Label>
                            <Select
                                key={`edit-type-${editingDocument?.id || 'new'}`}
                                value={formData.type_id ? formData.type_id.toString() : ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, type_id: parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2 border-b">
                                        <Input
                                            placeholder="Search document types..."
                                            value={typeSearchTerm}
                                            onChange={(e) => setTypeSearchTerm(e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {filteredDocumentTypes.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No document types found
                                            </div>
                                        ) : (
                                            filteredDocumentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.type_name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-document_number">Document Number *</Label>
                            <Input
                                id="edit-document_number"
                                value={formData.document_number}
                                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                placeholder="Enter document number"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-document_date">Document Date *</Label>
                            <Input
                                id="edit-document_date"
                                type="date"
                                value={formData.document_date}
                                onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-po_no">PO Number</Label>
                            <Input
                                id="edit-po_no"
                                value={formData.po_no}
                                onChange={(e) => setFormData({ ...formData, po_no: e.target.value })}
                                placeholder="Enter PO number"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-project">Project</Label>
                            <Input
                                id="edit-project"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                placeholder="Enter project"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-receive_date">Receive Date</Label>
                            <Input
                                id="edit-receive_date"
                                type="date"
                                value={formData.receive_date}
                                onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-cur_loc">Current Location</Label>
                            <Select
                                key={`edit-dept-${editingDocument?.id || 'new'}`}
                                value={formData.cur_loc || ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, cur_loc: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select current location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2 border-b">
                                        <Input
                                            placeholder="Search departments..."
                                            value={departmentSearchTerm}
                                            onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {filteredDepartments.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No departments found
                                            </div>
                                        ) : (
                                            filteredDepartments.map((department) => (
                                                <SelectItem key={department.id} value={department.location_code}>
                                                    {getDepartmentOptionDisplay(department)}
                                                </SelectItem>
                                            ))
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-remarks">Remarks</Label>
                            <Textarea
                                id="edit-remarks"
                                value={formData.remarks}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Enter remarks"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingDocument(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDocument}
                            disabled={!formData.type_id || !formData.document_number || !formData.document_date || submitting}
                        >
                            {submitting ? "Updating..." : "Update Document"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Additional Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the document &ldquo;{deletingDocument?.document_number}&rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingDocument && (
                        <div className="py-4">
                            <div className="space-y-2 text-sm">
                                <p><strong>Document Number:</strong> {deletingDocument.document_number}</p>
                                <p><strong>Type:</strong> {deletingDocument.type?.type_name || "N/A"}</p>
                                <p><strong>Document Date:</strong> {new Date(deletingDocument.document_date).toLocaleDateString()}</p>
                                <p><strong>PO Number:</strong> {deletingDocument.po_no || "N/A"}</p>
                                <p><strong>Project:</strong> {deletingDocument.project || "N/A"}</p>
                                <p><strong>Current Location:</strong> {deletingDocument.cur_loc ? getDepartmentDisplayName(deletingDocument.cur_loc) : "N/A"}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingDocument(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingDocument) {
                                    handleDeleteDocument(deletingDocument.id);
                                }
                                setIsDeleteDialogOpen(false);
                            }}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete Document"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
} 