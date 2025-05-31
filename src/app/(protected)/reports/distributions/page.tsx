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
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { DistributionReport } from "@/lib/api/reports";
import { useReports } from "@/hooks/useReports";

export default function DistributionsReportsPage() {
    const router = useRouter();
    const { status } = useSession();
    const {
        loading,
        error,
        isAuthenticated,
        clearError,
        fetchDistributionsReport,
    } = useReports();

    const [distributions, setDistributions] = useState<DistributionReport[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const loadDistributions = useCallback(async () => {
        const response = await fetchDistributionsReport({
            per_page: 1000
        });

        if (response && response.success) {
            setDistributions(response.data.data || []);
        }
    }, [fetchDistributionsReport]);

    useEffect(() => {
        if (isAuthenticated) {
            loadDistributions();
        }
    }, [isAuthenticated, loadDistributions]);

    // Helper functions for display
    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }, []);

    const getStatusBadge = useCallback((status: string) => {
        const statusConfig = {
            draft: { variant: "secondary" as const, label: "Draft" },
            verified_by_sender: { variant: "outline" as const, label: "Verified by Sender" },
            sent: { variant: "default" as const, label: "Sent" },
            received: { variant: "default" as const, label: "Received" },
            verified_by_receiver: { variant: "outline" as const, label: "Verified by Receiver" },
            completed: { variant: "default" as const, label: "Completed" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            variant: "secondary" as const,
            label: status
        };

        return (
            <Badge variant={config.variant}>
                {config.label}
            </Badge>
        );
    }, []);

    // Handle view details
    const handleViewDetails = useCallback((distribution: DistributionReport) => {
        router.push(`/reports/distributions/${distribution.id}`);
    }, [router]);

    // Define table columns
    const columns = useMemo<ColumnDef<DistributionReport>[]>(
        () => [
            {
                id: "index",
                header: "No.",
                cell: ({ row, table }) => (
                    <Badge variant="secondary">
                        {row.index +
                            1 +
                            table.getState().pagination.pageIndex *
                            table.getState().pagination.pageSize}
                    </Badge>
                ),
            },
            {
                accessorKey: "distribution_number",
                header: "Distribution Number",
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as string}</span>
                ),
            },
            {
                accessorKey: "type.name",
                header: "Type",
                cell: ({ row }) => {
                    const type = row.original.type;
                    return type ? (
                        <Badge variant="outline">{type.name}</Badge>
                    ) : (
                        "-"
                    );
                },
            },
            {
                accessorKey: "origin_department.name",
                header: "From Department",
                cell: ({ row }) => {
                    const dept = row.original.origin_department;
                    return dept ? dept.name : "-";
                },
            },
            {
                accessorKey: "destination_department.name",
                header: "To Department",
                cell: ({ row }) => {
                    const dept = row.original.destination_department;
                    return dept ? dept.name : "-";
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => getStatusBadge(getValue() as string),
            },
            {
                accessorKey: "created_at",
                header: "Created Date",
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return date ? formatDate(date) : "-";
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
        [formatDate, getStatusBadge, handleViewDetails]
    );

    // Create table instance
    const table = useReactTable({
        data: distributions,
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
        initialState: {
            pagination: {
                pageSize: 10,
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
                        <h1 className="text-3xl font-bold tracking-tight">Distribution Reports</h1>
                        <p className="text-muted-foreground">
                            View distribution reports with attached documents and detailed action history
                        </p>
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="flex items-center justify-between space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search distributions..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="per-page" className="text-sm">
                            Show:
                        </Label>
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

            {/* Distributions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Distribution Reports
                    </CardTitle>
                    <CardDescription>
                        Comprehensive distribution data with attached documents and action history.
                        {table.getFilteredRowModel().rows.length > 0 && (
                            <span className="ml-2">
                                Showing{" "}
                                {table.getState().pagination.pageIndex *
                                    table.getState().pagination.pageSize +
                                    1}{" "}
                                to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) *
                                    table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} distributions
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
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
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
                                                {globalFilter
                                                    ? "No distributions found matching your search."
                                                    : "No distributions found for reports."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {table.getPageCount() > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                                        {table.getPageCount()}
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
            <Toaster />
        </div>
    );
} 