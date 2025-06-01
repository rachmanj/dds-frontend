"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Eye,
    Search,
    AlertCircle,
    LogIn,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    X,
    Calendar,
    RefreshCw,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { InvoiceReport, ReportFilters } from "@/lib/api/reports";
import { useReports } from "@/hooks/useReports";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useInvoiceTypes } from "@/hooks/useInvoiceTypes";
import { useUsers } from "@/hooks/useUsers";

export default function InvoicesReportsPage() {
    const router = useRouter();
    const { status } = useSession();
    const {
        loading,
        error,
        isAuthenticated,
        clearError,
        fetchInvoicesReport,
    } = useReports();

    // Additional hooks for filter data
    const { suppliers } = useSuppliers();
    const { invoiceTypes } = useInvoiceTypes();
    const { users } = useUsers();

    const [invoices, setInvoices] = useState<InvoiceReport[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState("");

    // Filter states
    const [filters, setFilters] = useState<ReportFilters>({
        search: "",
        date_from: "",
        date_to: "",
        receive_date_from: "",
        receive_date_to: "",
        supplier_id: undefined,
        type_id: undefined,
        created_by: undefined,
        status: "",
        per_page: 10,
    });

    // Filter panel visibility
    const [showFilters, setShowFilters] = useState(false);

    // Available status options
    const statusOptions = [
        { value: "open", label: "Open" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "paid", label: "Paid" },
        { value: "cancelled", label: "Cancelled" },
    ];

    const loadInvoices = useCallback(async (filterParams?: ReportFilters, page = 1) => {
        const finalFilters = {
            ...filters,
            ...filterParams,
            per_page: pageSize,
        };

        // Remove empty values
        Object.keys(finalFilters).forEach(key => {
            const value = finalFilters[key as keyof ReportFilters];
            if (value === "" || value === undefined || value === null) {
                delete finalFilters[key as keyof ReportFilters];
            }
        });

        const response = await fetchInvoicesReport(finalFilters);

        if (response && response.success) {
            setInvoices(response.data.data || []);
            setTotalRecords(response.data.total || 0);
            setCurrentPage(response.data.current_page || 1);
        }
    }, [fetchInvoicesReport, filters, pageSize]);

    useEffect(() => {
        if (isAuthenticated) {
            loadInvoices();
        }
    }, [isAuthenticated, loadInvoices]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof ReportFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Apply filters
    const applyFilters = useCallback(() => {
        setCurrentPage(1);
        loadInvoices(filters, 1);
    }, [filters, loadInvoices]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const clearedFilters: ReportFilters = {
            search: "",
            date_from: "",
            date_to: "",
            receive_date_from: "",
            receive_date_to: "",
            supplier_id: undefined,
            type_id: undefined,
            created_by: undefined,
            status: "",
            per_page: pageSize,
        };
        setFilters(clearedFilters);
        setGlobalFilter("");
        loadInvoices(clearedFilters, 1);
    }, [loadInvoices, pageSize]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.search ||
            filters.date_from ||
            filters.date_to ||
            filters.receive_date_from ||
            filters.receive_date_to ||
            filters.supplier_id ||
            filters.type_id ||
            filters.created_by ||
            filters.status
        );
    }, [filters]);

    // Helper functions for display
    const formatCurrency = useCallback((amount: number, currency: string) => {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        try {
            return formatter.format(amount);
        } catch {
            // Fallback for unsupported currencies
            return `${currency} ${amount.toLocaleString()}`;
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }, []);

    // Handle view details
    const handleViewDetails = useCallback((invoice: InvoiceReport) => {
        router.push(`/reports/invoices/${invoice.id}`);
    }, [router]);

    // Handle page size change
    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        loadInvoices({ ...filters, per_page: newPageSize }, 1);
    }, [filters, loadInvoices]);

    // Define table columns
    const columns = useMemo<ColumnDef<InvoiceReport>[]>(
        () => [
            {
                id: "index",
                header: "No.",
                cell: ({ row }) => (
                    <Badge variant="secondary">
                        {row.index + 1 + (currentPage - 1) * pageSize}
                    </Badge>
                ),
            },
            {
                id: "invoice_number",
                accessorKey: "invoice_number",
                header: "Invoice Number",
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as string}</span>
                ),
            },
            {
                id: "supplier_name",
                accessorKey: "supplier.name",
                header: "Supplier",
                cell: ({ row }) => {
                    const supplier = row.original.supplier;
                    return supplier ? (
                        <div className="flex flex-col">
                            <span className="font-medium">{supplier.name}</span>
                        </div>
                    ) : (
                        "-"
                    );
                },
            },
            {
                id: "type_name",
                accessorKey: "type.type_name",
                header: "Type",
                cell: ({ row }) => {
                    const type = row.original.type;
                    return type ? (
                        <Badge variant="outline">{type.type_name}</Badge>
                    ) : (
                        "-"
                    );
                },
            },
            {
                id: "invoice_date",
                accessorKey: "invoice_date",
                header: "Invoice Date",
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return date ? formatDate(date) : "-";
                },
            },
            {
                id: "receive_date",
                accessorKey: "receive_date",
                header: "Receive Date",
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return date ? formatDate(date) : "-";
                },
            },
            {
                id: "amount",
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }) => {
                    const amount = row.original.amount;
                    const currency = row.original.currency || "IDR";
                    return amount ? (
                        <span className="font-medium">
                            {formatCurrency(Number(amount), currency)}
                        </span>
                    ) : (
                        "-"
                    );
                },
            },
            {
                id: "status",
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue() as string;
                    return (
                        <Badge variant={
                            status === 'paid' ? 'default' :
                                status === 'approved' ? 'secondary' :
                                    status === 'pending' ? 'outline' :
                                        'destructive'
                        }>
                            {status}
                        </Badge>
                    );
                },
            },
            {
                id: "creator_name",
                accessorKey: "creator.name",
                header: "Created By",
                cell: ({ row }) => {
                    const creator = row.original.creator;
                    return creator ? creator.name : "-";
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
                            onClick={() => handleViewDetails(row.original)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [formatCurrency, formatDate, handleViewDetails, currentPage, pageSize]
    );

    // Create table instance
    const table = useReactTable({
        data: invoices,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        manualPagination: true,
        pageCount: Math.ceil(totalRecords / pageSize),
        initialState: {
            pagination: {
                pageSize: pageSize,
                pageIndex: currentPage - 1,
            },
        },
    });

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
                                    You need to be logged in to access the reports.
                                </p>
                            </div>
                            <Button onClick={() => router.push('/login')}>
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
                        <h1 className="text-3xl font-bold tracking-tight">Invoice Reports</h1>
                        <p className="text-muted-foreground">
                            Comprehensive view of all invoices with details, attachments, and distribution history
                        </p>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoices..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={showFilters ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                                        !
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={applyFilters}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Apply
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="per-page" className="text-sm">
                                    Show:
                                </Label>
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                                <CardDescription>
                                    Filter invoices by date ranges, supplier, type, creator, and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Date Filters */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Invoice Date Range
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="date_from" className="text-xs text-muted-foreground">From</Label>
                                                <Input
                                                    id="date_from"
                                                    type="date"
                                                    value={filters.date_from || ""}
                                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="date_to" className="text-xs text-muted-foreground">To</Label>
                                                <Input
                                                    id="date_to"
                                                    type="date"
                                                    value={filters.date_to || ""}
                                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Receive Date Range
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="receive_date_from" className="text-xs text-muted-foreground">From</Label>
                                                <Input
                                                    id="receive_date_from"
                                                    type="date"
                                                    value={filters.receive_date_from || ""}
                                                    onChange={(e) => handleFilterChange('receive_date_from', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="receive_date_to" className="text-xs text-muted-foreground">To</Label>
                                                <Input
                                                    id="receive_date_to"
                                                    type="date"
                                                    value={filters.receive_date_to || ""}
                                                    onChange={(e) => handleFilterChange('receive_date_to', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supplier Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier" className="text-sm font-medium">Supplier</Label>
                                        <Select
                                            value={filters.supplier_id?.toString() || ""}
                                            onValueChange={(value) => handleFilterChange('supplier_id', value ? parseInt(value) : undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All suppliers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                        {supplier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-sm font-medium">Invoice Type</Label>
                                        <Select
                                            value={filters.type_id?.toString() || ""}
                                            onValueChange={(value) => handleFilterChange('type_id', value ? parseInt(value) : undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {invoiceTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.type_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Creator Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="creator" className="text-sm font-medium">Created By</Label>
                                        <Select
                                            value={filters.created_by?.toString() || ""}
                                            onValueChange={(value) => handleFilterChange('created_by', value ? parseInt(value) : undefined)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All creators" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={filters.status || ""}
                                            onValueChange={(value) => handleFilterChange('status', value || "")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Invoice Reports
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-2">
                                Filtered
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Comprehensive invoice data with relationships and history.
                        {totalRecords > 0 && (
                            <span className="ml-2">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} invoices
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(pageSize)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[50px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[60px]" />
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
                                                <TableHead
                                                    key={header.id}
                                                    className={
                                                        header.id === "actions" ? "text-right" : ""
                                                    }
                                                >
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
                                    {invoices.length > 0 ? (
                                        invoices.map((invoice, index) => (
                                            <TableRow key={invoice.id}>
                                                {columns.map((column) => (
                                                    <TableCell key={`${invoice.id}-${column.id}`}>
                                                        {flexRender(
                                                            column.cell,
                                                            {
                                                                getValue: () => {
                                                                    if ('accessorKey' in column && column.accessorKey) {
                                                                        const keys = (column.accessorKey as string).split('.');
                                                                        let value: any = invoice;
                                                                        for (const key of keys) {
                                                                            value = value?.[key];
                                                                        }
                                                                        return value;
                                                                    }
                                                                    return undefined;
                                                                },
                                                                row: {
                                                                    index,
                                                                    original: invoice,
                                                                },
                                                                column,
                                                                table,
                                                            } as any
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="text-center py-8"
                                            >
                                                {hasActiveFilters
                                                    ? "No invoices found matching your filters."
                                                    : "No invoices found for reports."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {Math.ceil(totalRecords / pageSize) > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCurrentPage(1);
                                                loadInvoices(filters, 1);
                                            }}
                                            disabled={currentPage === 1 || loading}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newPage = currentPage - 1;
                                                setCurrentPage(newPage);
                                                loadInvoices(filters, newPage);
                                            }}
                                            disabled={currentPage === 1 || loading}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newPage = currentPage + 1;
                                                setCurrentPage(newPage);
                                                loadInvoices(filters, newPage);
                                            }}
                                            disabled={currentPage === Math.ceil(totalRecords / pageSize) || loading}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const lastPage = Math.ceil(totalRecords / pageSize);
                                                setCurrentPage(lastPage);
                                                loadInvoices(filters, lastPage);
                                            }}
                                            disabled={currentPage === Math.ceil(totalRecords / pageSize) || loading}
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
            <Toaster />
        </div>
    );
} 