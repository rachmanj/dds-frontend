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
import { Invoice, InvoiceFormData } from "@/types/invoice";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceTypes } from "@/hooks/useInvoiceTypes";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useDepartments } from "@/hooks/useDepartments";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { CreateInvoiceDialog, EditInvoiceDialog } from "@/components/invoices";

export default function InvoicesPage() {
  const { status } = useSession();
  const {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    clearError,
    isAuthenticated,
  } = useInvoices();

  const { invoiceTypes } = useInvoiceTypes();

  const { suppliers } = useSuppliers();

  const { departments } = useDepartments();

  const { projects } = useProjects();

  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: "",
    faktur_no: "",
    invoice_date: "",
    receive_date: "",
    supplier_id: 0,
    po_no: "",
    receive_project: "",
    invoice_project: "",
    payment_project: "",
    currency: "IDR",
    amount: "",
    type_id: 0,
    remarks: "",
    cur_loc: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // State for searchable selects
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [receiveProjectSearchTerm, setReceiveProjectSearchTerm] = useState("");
  const [invoiceProjectSearchTerm, setInvoiceProjectSearchTerm] = useState("");

  // Sort suppliers by name for consistent ordering
  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers]);

  // Sort departments by project for consistent ordering
  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => {
      if (a.project !== b.project) {
        return a.project.localeCompare(b.project);
      }
      return a.name.localeCompare(b.name);
    });
  }, [departments]);

  // Sort projects by code for consistent ordering
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.code.localeCompare(b.code));
  }, [projects]);

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearchTerm) return sortedSuppliers;
    return sortedSuppliers.filter(
      (supplier) =>
        supplier.name
          ?.toLowerCase()
          .includes(supplierSearchTerm.toLowerCase()) ||
        (supplier.sap_code &&
          supplier.sap_code
            .toLowerCase()
            .includes(supplierSearchTerm.toLowerCase())) ||
        (supplier.city &&
          supplier.city
            .toLowerCase()
            .includes(supplierSearchTerm.toLowerCase()))
    );
  }, [sortedSuppliers, supplierSearchTerm]);

  // Filter invoice types based on search term
  const filteredInvoiceTypes = useMemo(() => {
    if (!typeSearchTerm) return invoiceTypes;
    return invoiceTypes.filter((type) =>
      type.type_name?.toLowerCase().includes(typeSearchTerm.toLowerCase())
    );
  }, [invoiceTypes, typeSearchTerm]);

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => {
    if (!departmentSearchTerm) return sortedDepartments;
    return sortedDepartments.filter(
      (department) =>
        department.name
          ?.toLowerCase()
          .includes(departmentSearchTerm.toLowerCase()) ||
        department.project
          ?.toLowerCase()
          .includes(departmentSearchTerm.toLowerCase()) ||
        department.location_code
          ?.toLowerCase()
          .includes(departmentSearchTerm.toLowerCase())
    );
  }, [sortedDepartments, departmentSearchTerm]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projectSearchTerm) return sortedProjects;
    return sortedProjects.filter(
      (project) =>
        project.code?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        (project.owner &&
          project.owner
            .toLowerCase()
            .includes(projectSearchTerm.toLowerCase())) ||
        (project.location &&
          project.location
            .toLowerCase()
            .includes(projectSearchTerm.toLowerCase()))
    );
  }, [sortedProjects, projectSearchTerm]);

  // Filter projects for receive project based on search term
  const filteredReceiveProjects = useMemo(() => {
    if (!receiveProjectSearchTerm) return sortedProjects;
    return sortedProjects.filter(
      (project) =>
        project.code
          ?.toLowerCase()
          .includes(receiveProjectSearchTerm.toLowerCase()) ||
        (project.owner &&
          project.owner
            .toLowerCase()
            .includes(receiveProjectSearchTerm.toLowerCase())) ||
        (project.location &&
          project.location
            .toLowerCase()
            .includes(receiveProjectSearchTerm.toLowerCase()))
    );
  }, [sortedProjects, receiveProjectSearchTerm]);

  // Filter projects for invoice project based on search term
  const filteredInvoiceProjects = useMemo(() => {
    if (!invoiceProjectSearchTerm) return sortedProjects;
    return sortedProjects.filter(
      (project) =>
        project.code
          ?.toLowerCase()
          .includes(invoiceProjectSearchTerm.toLowerCase()) ||
        (project.owner &&
          project.owner
            .toLowerCase()
            .includes(invoiceProjectSearchTerm.toLowerCase())) ||
        (project.location &&
          project.location
            .toLowerCase()
            .includes(invoiceProjectSearchTerm.toLowerCase()))
    );
  }, [sortedProjects, invoiceProjectSearchTerm]);

  // Get available projects based on selected supplier for create form only
  const availableProjectsForCreate = useMemo(() => {
    const selectedSupplier = suppliers.find(
      (s) => s.id === formData.supplier_id
    );
    if (!selectedSupplier) return [];

    // If supplier has a payment_project, filter projects to show only that one
    if (selectedSupplier.payment_project) {
      return projects.filter(
        (project) => project.code === selectedSupplier.payment_project
      );
    }

    // Otherwise show all projects
    return projects;
  }, [suppliers, projects, formData.supplier_id]);

  // Helper function to format date as dd-mmm-yyyy
  const formatDisplayDate = useCallback((dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Helper function to format number with commas
  const formatNumberWithCommas = useCallback((value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "");

    // Split by decimal point
    const parts = cleanValue.split(".");

    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Rejoin with decimal point if there was one
    return parts.join(".");
  }, []);

  // Helper function to parse formatted number back to float
  const parseFormattedNumber = useCallback((value: string) => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  }, []);

  // Helper function to get supplier display name
  const getSupplierDisplayName = useCallback(
    (supplierId: number) => {
      const supplier = suppliers.find((s) => s.id === supplierId);
      return supplier ? supplier.name : "Unknown Supplier";
    },
    [suppliers]
  );

  // Helper function to get department display name
  const getDepartmentDisplayName = useCallback(
    (locationCode: string) => {
      const department = departments.find(
        (dept) => dept.location_code === locationCode
      );
      if (!department) return locationCode;
      return department.name;
    },
    [departments]
  );

  // Helper function to get supplier option display format
  const getSupplierOptionDisplay = (supplier: {
    name: string;
    sap_code?: string;
    city?: string;
  }) => {
    const parts = [supplier.name];
    if (supplier.sap_code) parts.push(`(${supplier.sap_code})`);
    if (supplier.city) parts.push(`- ${supplier.city}`);
    return parts.join(" ");
  };

  // Helper function to get department option display format
  const getDepartmentOptionDisplay = (department: {
    project: string;
    name: string;
    location_code: string;
  }) => {
    return `${department.project} - ${department.name} - ${department.location_code}`;
  };

  // Helper function to get project option display format
  const getProjectOptionDisplay = (project: Project) => {
    const parts = [project.code];
    if (project.owner) parts.push(`- ${project.owner}`);
    if (project.location) parts.push(`(${project.location})`);
    return parts.join(" ");
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Validation function for duplicate invoice number per supplier
  const validateInvoiceNumber = useCallback(
    (invoiceNumber: string, supplierId: number, excludeId?: number) => {
      if (!invoiceNumber || !supplierId) return true;

      const existingInvoice = invoices.find(
        (invoice) =>
          invoice.invoice_number &&
          typeof invoice.invoice_number === "string" &&
          invoice.invoice_number.trim() !== "" &&
          invoice.invoice_number.toLowerCase() ===
            invoiceNumber.toLowerCase() &&
          invoice.supplier_id === supplierId &&
          invoice.id !== excludeId
      );

      return !existingInvoice;
    },
    [invoices]
  );

  // Comprehensive form validation function
  const validateForm = useCallback(
    (data: InvoiceFormData, isEdit: boolean = false) => {
      const errors: Record<string, string> = {};

      // Required field validations
      if (!data.invoice_number || !data.invoice_number.trim()) {
        errors.invoice_number = "Invoice number is required";
      }

      if (!data.supplier_id || data.supplier_id === 0) {
        errors.supplier_id = "Supplier is required";
      }

      if (!data.type_id || data.type_id === 0) {
        errors.type_id = "Invoice type is required";
      }

      if (!data.invoice_date) {
        errors.invoice_date = "Invoice date is required";
      }

      if (!data.receive_date) {
        errors.receive_date = "Receive date is required";
      }

      if (
        !data.amount ||
        (typeof data.amount === "string" && !data.amount.trim()) ||
        (typeof data.amount === "number" && data.amount <= 0)
      ) {
        errors.amount = "Amount is required and must be greater than 0";
      }

      // Validate invoice number uniqueness only if no other errors for invoice_number
      if (
        !errors.invoice_number &&
        data.invoice_number &&
        data.invoice_number.trim() &&
        data.supplier_id
      ) {
        const excludeId =
          isEdit && editingInvoice ? editingInvoice.id : undefined;
        if (
          !validateInvoiceNumber(
            data.invoice_number.trim(),
            data.supplier_id,
            excludeId
          )
        ) {
          errors.invoice_number =
            "This invoice number already exists for the selected supplier";
        }
      }

      return errors;
    },
    [validateInvoiceNumber, editingInvoice]
  );

  // Handle supplier change
  const handleSupplierChange = (supplierId: string) => {
    const id = parseInt(supplierId);
    const selectedSupplier = suppliers.find((s) => s.id === id);

    // For create form, auto-populate payment_project based on supplier
    const updateData: Partial<InvoiceFormData> = {
      supplier_id: id,
    };

    // Only auto-populate payment_project for create form (not edit)
    if (!editingInvoice && selectedSupplier?.payment_project) {
      updateData.payment_project = selectedSupplier.payment_project;
    }

    setFormData((prev) => ({ ...prev, ...updateData }));

    // Clear validation errors for supplier and related fields
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.supplier_id;
      return newErrors;
    });

    // Re-validate invoice number if it exists
    if (formData.invoice_number) {
      handleInvoiceNumberBlur(formData.invoice_number, id);
    }
  };

  // Handle invoice number change
  const handleInvoiceNumberChange = (invoiceNumber: string) => {
    setFormData((prev) => ({ ...prev, invoice_number: invoiceNumber }));

    // Clear validation error when typing
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.invoice_number;
      return newErrors;
    });
  };

  // Handle invoice number blur validation
  const handleInvoiceNumberBlur = (
    invoiceNumber: string,
    supplierId?: number
  ) => {
    const supplierIdToUse = supplierId || formData.supplier_id;

    if (invoiceNumber && invoiceNumber.trim() && supplierIdToUse) {
      const isValid = validateInvoiceNumber(
        invoiceNumber.trim(),
        supplierIdToUse,
        editingInvoice?.id
      );
      if (!isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          invoice_number:
            "This invoice number already exists for the selected supplier.",
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.invoice_number;
          return newErrors;
        });
      }
    }
  };

  // Handle amount change with formatting
  const handleAmountChange = (value: string) => {
    const formattedValue = formatNumberWithCommas(value);
    const numericValue = parseFormattedNumber(formattedValue);
    setFormData((prev) => ({ ...prev, amount: numericValue }));

    // Clear validation error when typing
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.amount;
      return newErrors;
    });
  };

  // Handle form field changes with validation error clearing
  const handleFieldChange = (
    field: keyof InvoiceFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
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
            <div className="space-y-1">
              <div className="font-medium">{supplier.name}</div>
              {supplier.sap_code && (
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {supplier.sap_code}
                </code>
              )}
            </div>
          ) : (
            getSupplierDisplayName(row.original.supplier_id)
          );
        },
      },
      {
        accessorKey: "type.type_name",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;
          return type ? <Badge variant="outline">{type.type_name}</Badge> : "-";
        },
      },
      {
        accessorKey: "invoice_date",
        header: "Invoice Date",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return formatDisplayDate(date);
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.amount;
          const currency = row.original.currency;
          return (
            <span className="font-medium">
              {formatCurrency(amount, currency)}
            </span>
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
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const getStatusVariant = (
            status: string
          ): "default" | "secondary" | "destructive" | "outline" => {
            if (!status || typeof status !== "string") return "secondary";
            switch (status.toLowerCase()) {
              case "open":
                return "default";
              case "verify":
                return "secondary";
              case "return":
                return "destructive";
              case "sap":
                return "outline";
              case "close":
                return "default";
              case "cancel":
                return "destructive";
              default:
                return "secondary";
            }
          };
          return (
            <Badge variant={getStatusVariant(status)}>
              {status ? status.toUpperCase() : "UNKNOWN"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "receive_date",
        header: "Receive Date",
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          return formatDisplayDate(date || "");
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
    [getSupplierDisplayName, getDepartmentDisplayName, formatDisplayDate]
  );

  // Custom global filter function with null safety
  const customGlobalFilter = useCallback(
    (
      row: { getValue: (columnId: string) => unknown },
      columnId: string,
      value: string
    ) => {
      const searchValue = value?.toLowerCase() || "";
      if (!searchValue) return true;

      // Get the cell value safely
      const cellValue = row.getValue(columnId);
      if (cellValue == null || cellValue === undefined) return false;

      // Convert to string safely and search
      const stringValue = String(cellValue).toLowerCase();
      return stringValue.includes(searchValue);
    },
    []
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
    globalFilterFn: customGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Create invoice handler
  const handleCreateInvoice = async () => {
    // Comprehensive form validation
    const errors = validateForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    setSubmitting(true);
    const success = await createInvoice(formData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Invoice created successfully!");
    } else {
      toast.error("Failed to create invoice. Please try again.");
    }
    setSubmitting(false);
  };

  // Update invoice handler
  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    // Comprehensive form validation
    const errors = validateForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    setSubmitting(true);
    const success = await updateInvoice(editingInvoice.id, formData);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      resetForm();
      toast.success("Invoice updated successfully!");
    } else {
      toast.error("Failed to update invoice. Please try again.");
    }
    setSubmitting(false);
  };

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

  // Reset form
  const resetForm = () => {
    setFormData({
      invoice_number: "",
      faktur_no: "",
      invoice_date: "",
      receive_date: "",
      supplier_id: 0,
      po_no: "",
      receive_project: "",
      invoice_project: "",
      payment_project: "",
      currency: "IDR",
      amount: 0,
      type_id: 0,
      remarks: "",
      cur_loc: "",
    });
    setSupplierSearchTerm("");
    setTypeSearchTerm("");
    setDepartmentSearchTerm("");
    setProjectSearchTerm("");
    setReceiveProjectSearchTerm("");
    setInvoiceProjectSearchTerm("");
    setValidationErrors({});
  };

  // Handle edit
  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);

    // Format date to YYYY-MM-DD for HTML date input
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const editFormData = {
      invoice_number: invoice.invoice_number,
      faktur_no: invoice.faktur_no || "",
      invoice_date: formatDateForInput(invoice.invoice_date),
      receive_date: formatDateForInput(invoice.receive_date),
      supplier_id: invoice.supplier?.id || invoice.supplier_id || 0,
      po_no: invoice.po_no || "",
      receive_project: invoice.receive_project || "",
      invoice_project: invoice.invoice_project || "",
      payment_project: invoice.payment_project || "",
      currency: invoice.currency || "IDR",
      amount: invoice.amount || "",
      type_id: invoice.type?.id || invoice.type_id || 0,
      remarks: invoice.remarks || "",
      cur_loc: invoice.cur_loc || "",
    };

    setFormData(editFormData);

    // Clear search terms when opening edit dialog
    setSupplierSearchTerm("");
    setTypeSearchTerm("");
    setDepartmentSearchTerm("");
    setProjectSearchTerm("");
    setReceiveProjectSearchTerm("");
    setInvoiceProjectSearchTerm("");
    setValidationErrors({});

    setIsEditDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
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
                <h3 className="text-lg font-semibold">
                  Authentication Required
                </h3>
                <p className="text-muted-foreground">
                  You need to be logged in to access the invoices page.
                </p>
              </div>
              <Button onClick={() => (window.location.href = "/login")}>
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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                disabled={!isAuthenticated}
                onClick={() => {
                  resetForm(); // This will set the user's project as default
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Invoice
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <CreateInvoiceDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateInvoice}
          submitting={submitting}
          validationErrors={validationErrors}
          suppliers={suppliers}
          invoiceTypes={invoiceTypes}
          departments={departments}
          projects={projects}
          filteredSuppliers={filteredSuppliers}
          filteredInvoiceTypes={filteredInvoiceTypes}
          filteredDepartments={filteredDepartments}
          filteredInvoiceProjects={filteredInvoiceProjects}
          availableProjectsForCreate={availableProjectsForCreate}
          supplierSearchTerm={supplierSearchTerm}
          setSupplierSearchTerm={setSupplierSearchTerm}
          typeSearchTerm={typeSearchTerm}
          setTypeSearchTerm={setTypeSearchTerm}
          departmentSearchTerm={departmentSearchTerm}
          setDepartmentSearchTerm={setDepartmentSearchTerm}
          projectSearchTerm={projectSearchTerm}
          setProjectSearchTerm={setProjectSearchTerm}
          invoiceProjectSearchTerm={invoiceProjectSearchTerm}
          setInvoiceProjectSearchTerm={setInvoiceProjectSearchTerm}
          handleSupplierChange={handleSupplierChange}
          handleInvoiceNumberChange={handleInvoiceNumberChange}
          handleInvoiceNumberBlur={handleInvoiceNumberBlur}
          handleAmountChange={handleAmountChange}
          formatNumberWithCommas={formatNumberWithCommas}
          getSupplierOptionDisplay={getSupplierOptionDisplay}
          getDepartmentOptionDisplay={getDepartmentOptionDisplay}
          getProjectOptionDisplay={getProjectOptionDisplay}
          resetForm={resetForm}
          handleFieldChange={handleFieldChange}
        />

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
              {(() => {
                try {
                  return (
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
                                  {(() => {
                                    try {
                                      return flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      );
                                    } catch (cellError) {
                                      console.error(
                                        "Error rendering cell:",
                                        cellError
                                      );
                                      return (
                                        <span className="text-red-500">
                                          Error
                                        </span>
                                      );
                                    }
                                  })()}
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
                  );
                } catch (tableError) {
                  console.error("Error rendering table:", tableError);
                  return (
                    <div className="text-center py-8 text-red-500">
                      Error loading table. Please refresh the page.
                    </div>
                  );
                }
              })()}

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
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
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
      <EditInvoiceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingInvoice={editingInvoice}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateInvoice}
        submitting={submitting}
        validationErrors={validationErrors}
        suppliers={suppliers}
        invoiceTypes={invoiceTypes}
        departments={departments}
        projects={projects}
        filteredSuppliers={filteredSuppliers}
        filteredInvoiceTypes={filteredInvoiceTypes}
        filteredDepartments={filteredDepartments}
        filteredProjects={filteredProjects}
        filteredReceiveProjects={filteredReceiveProjects}
        filteredInvoiceProjects={filteredInvoiceProjects}
        supplierSearchTerm={supplierSearchTerm}
        setSupplierSearchTerm={setSupplierSearchTerm}
        typeSearchTerm={typeSearchTerm}
        setTypeSearchTerm={setTypeSearchTerm}
        departmentSearchTerm={departmentSearchTerm}
        setDepartmentSearchTerm={setDepartmentSearchTerm}
        projectSearchTerm={projectSearchTerm}
        setProjectSearchTerm={setProjectSearchTerm}
        receiveProjectSearchTerm={receiveProjectSearchTerm}
        setReceiveProjectSearchTerm={setReceiveProjectSearchTerm}
        invoiceProjectSearchTerm={invoiceProjectSearchTerm}
        setInvoiceProjectSearchTerm={setInvoiceProjectSearchTerm}
        handleSupplierChange={handleSupplierChange}
        handleInvoiceNumberChange={handleInvoiceNumberChange}
        handleInvoiceNumberBlur={handleInvoiceNumberBlur}
        handleAmountChange={handleAmountChange}
        formatNumberWithCommas={formatNumberWithCommas}
        getSupplierOptionDisplay={getSupplierOptionDisplay}
        getDepartmentOptionDisplay={getDepartmentOptionDisplay}
        getProjectOptionDisplay={getProjectOptionDisplay}
        resetForm={resetForm}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the invoice &ldquo;
              {deletingInvoice?.invoice_number}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deletingInvoice && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Invoice Number:</strong>{" "}
                  {deletingInvoice.invoice_number}
                </p>
                <p>
                  <strong>Supplier:</strong>{" "}
                  {deletingInvoice.supplier?.name ||
                    getSupplierDisplayName(deletingInvoice.supplier_id)}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {deletingInvoice.type?.type_name || "N/A"}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {formatCurrency(
                    deletingInvoice.amount,
                    deletingInvoice.currency
                  )}
                </p>
                <p>
                  <strong>Invoice Date:</strong>{" "}
                  {formatDisplayDate(deletingInvoice.invoice_date)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {deletingInvoice.status.toUpperCase()}
                </p>
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
