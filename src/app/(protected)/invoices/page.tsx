"use client";

import { useState, useMemo, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  LogIn,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Invoice } from "@/types/invoice";
import { useInvoices } from "@/hooks/useInvoices";

export default function InvoicesPage() {
  const router = useRouter();
  const { status } = useSession();
  const {
    invoices,
    loading,
    error,
    deleteInvoice,
    clearError,
    isAuthenticated,
  } = useInvoices();

  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Handle edit - navigate to edit page
  const handleEdit = useCallback((invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}/edit`);
  }, [router]);

  // Handle delete confirmation
  const handleDeleteClick = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  // Handle create - navigate to create page
  const handleCreate = () => {
    router.push("/invoices/create");
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Invoice>[]>(
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
        accessorKey: "invoice_number",
        header: "Invoice Number",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "supplier.name",
        header: "Supplier",
        cell: ({ row }) => {
          const supplier = row.original.supplier;
          return supplier ? (
            <div className="flex flex-col">
              <span className="font-medium">{supplier.name}</span>
              {supplier.sap_code && (
                <span className="text-sm text-muted-foreground">
                  {supplier.sap_code}
                </span>
              )}
            </div>
          ) : (
            "-"
          );
        },
      },
      {
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
        accessorKey: "invoice_date",
        header: "Invoice Date",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? formatDate(date) : "-";
        },
      },
      {
        accessorKey: "receive_date",
        header: "Receive Date",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? formatDate(date) : "-";
        },
      },
      {
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
        accessorKey: "po_no",
        header: "PO Number",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return value ? (
            <code className="text-sm bg-muted px-1 py-0.5 rounded">
              {value}
            </code>
          ) : (
            "-"
          );
        },
      },
      {
        accessorKey: "payment_project",
        header: "Payment Project",
        cell: ({ getValue }) => (getValue() as string) || "-",
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
    [formatCurrency, formatDate, handleEdit]
  );

  // Create table instance
  const table = useReactTable({
    data: invoices,
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

  // Delete invoice handler
  const handleDeleteInvoice = async (id: number) => {
    setSubmitting(true);
    const success = await deleteInvoice(id);
    if (success) {
      toast.success("Invoice deleted successfully!");
    } else {
      toast.error("Failed to delete invoice. Please try again.");
    }
    setDeletingInvoice(null);
    setSubmitting(false);
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
                  You need to be logged in to access the invoices page.
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
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Manage invoices and their information
            </p>
          </div>
          <Button disabled={!isAuthenticated} onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
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

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            All Invoices
          </CardTitle>
          <CardDescription>
            A list of all invoices in your system.
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
                of {table.getFilteredRowModel().rows.length} invoices
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
                          ? "No invoices found matching your search."
                          : "No invoices found. Create your first invoice!"}
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the invoice &ldquo;{deletingInvoice?.invoice_number}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingInvoice && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <p><strong>Invoice Number:</strong> {deletingInvoice.invoice_number}</p>
                <p><strong>Supplier:</strong> {deletingInvoice.supplier?.name || "N/A"}</p>
                <p><strong>Amount:</strong> {deletingInvoice.amount ? formatCurrency(Number(deletingInvoice.amount), deletingInvoice.currency || "IDR") : "N/A"}</p>
                <p><strong>Invoice Date:</strong> {formatDate(deletingInvoice.invoice_date)}</p>
                <p><strong>Type:</strong> {deletingInvoice.type?.type_name || "N/A"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingInvoice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingInvoice) {
                  handleDeleteInvoice(deletingInvoice.id);
                }
                setIsDeleteDialogOpen(false);
              }}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
