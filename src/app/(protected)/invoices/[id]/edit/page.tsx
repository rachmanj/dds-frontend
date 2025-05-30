"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, LogIn, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Invoice, InvoiceFormData } from "@/types/invoice";
import { Supplier } from "@/types/supplier";
import { Department } from "@/types/department";
import { Project } from "@/types/project";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceTypes } from "@/hooks/useInvoiceTypes";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useDepartments } from "@/hooks/useDepartments";
import { useProjects } from "@/hooks/useProjects";
import { usePermissions } from "@/contexts/PermissionContext";
import { InvoiceAdditionalDocuments } from "@/components/InvoiceAdditionalDocuments";
import InvoiceAttachments from "@/components/attachments/InvoiceAttachments";

export default function EditInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id as string;
    const { status } = useSession();
    const { hasPermission } = usePermissions();
    const {
        invoices,
        updateInvoice,
        validateInvoiceNumber,
        isAuthenticated,
        loading: invoicesLoading,
    } = useInvoices();

    const { invoiceTypes } = useInvoiceTypes();
    const { suppliers } = useSuppliers();
    const { departments } = useDepartments();
    const { projects } = useProjects();

    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [activeTab, setActiveTab] = useState("details");
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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // State for searchable selects
    const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
    const [typeSearchTerm, setTypeSearchTerm] = useState("");
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
    const [projectSearchTerm, setProjectSearchTerm] = useState("");
    const [receiveProjectSearchTerm, setReceiveProjectSearchTerm] = useState("");
    const [invoiceProjectSearchTerm, setInvoiceProjectSearchTerm] = useState("");

    // Check if user can edit current location
    const canEditCurrentLocation = hasPermission('document.edit-cur_loc');

    // Load invoice data when component mounts
    useEffect(() => {
        if (!invoicesLoading && invoices.length > 0 && invoiceId) {
            const invoice = invoices.find(inv => inv.id.toString() === invoiceId);
            if (invoice) {
                setEditingInvoice(invoice);

                // Format date to YYYY-MM-DD for HTML date input
                const formatDateForInput = (dateString: string) => {
                    if (!dateString) return "";
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
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
                    amount: invoice.amount ? Math.round(Number(invoice.amount)).toString() : "",
                    type_id: invoice.type?.id || invoice.type_id || 0,
                    remarks: invoice.remarks || "",
                    cur_loc: invoice.cur_loc || "",
                };

                setFormData(editFormData);
                setLoading(false);
            } else {
                // Invoice not found
                toast.error("Invoice not found");
                router.push("/invoices");
            }
        }
    }, [invoicesLoading, invoices, invoiceId, router]);

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
                supplier.name?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                (supplier.sap_code && supplier.sap_code.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                (supplier.city && supplier.city.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
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
                department.name?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
                department.project?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
                department.location_code?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
        );
    }, [sortedDepartments, departmentSearchTerm]);

    // Filter projects based on search term
    const filteredProjects = useMemo(() => {
        if (!projectSearchTerm) return sortedProjects;
        return sortedProjects.filter(
            (project) =>
                project.code?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                (project.owner && project.owner.toLowerCase().includes(projectSearchTerm.toLowerCase())) ||
                (project.location && project.location.toLowerCase().includes(projectSearchTerm.toLowerCase()))
        );
    }, [sortedProjects, projectSearchTerm]);

    // Filter receive projects based on search term
    const filteredReceiveProjects = useMemo(() => {
        if (!receiveProjectSearchTerm) return sortedProjects;
        return sortedProjects.filter(
            (project) =>
                project.code?.toLowerCase().includes(receiveProjectSearchTerm.toLowerCase()) ||
                (project.owner && project.owner.toLowerCase().includes(receiveProjectSearchTerm.toLowerCase())) ||
                (project.location && project.location.toLowerCase().includes(receiveProjectSearchTerm.toLowerCase()))
        );
    }, [sortedProjects, receiveProjectSearchTerm]);

    // Filter invoice projects based on search term
    const filteredInvoiceProjects = useMemo(() => {
        if (!invoiceProjectSearchTerm) return sortedProjects;
        return sortedProjects.filter(
            (project) =>
                project.code?.toLowerCase().includes(invoiceProjectSearchTerm.toLowerCase()) ||
                (project.owner && project.owner.toLowerCase().includes(invoiceProjectSearchTerm.toLowerCase())) ||
                (project.location && project.location.toLowerCase().includes(invoiceProjectSearchTerm.toLowerCase()))
        );
    }, [sortedProjects, invoiceProjectSearchTerm]);

    // Helper functions
    const getSupplierOptionDisplay = (supplier: Supplier) => {
        const parts = [supplier.name];
        if (supplier.sap_code) parts.push(`(${supplier.sap_code})`);
        if (supplier.city) parts.push(`- ${supplier.city}`);
        return parts.join(" ");
    };

    const getDepartmentOptionDisplay = (department: Department) => {
        return `${department.project} - ${department.name} - ${department.location_code}`;
    };

    const getProjectOptionDisplay = (project: Project) => {
        const parts = [project.code];
        if (project.owner) parts.push(`- ${project.owner}`);
        if (project.location) parts.push(`(${project.location})`);
        return parts.join(" ");
    };

    const formatNumberWithCommas = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "");
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleSupplierChange = (supplierId: string) => {
        const newSupplierId = parseInt(supplierId);
        setFormData(prev => ({
            ...prev,
            supplier_id: newSupplierId,
        }));

        // Clear validation error for supplier_id
        if (validationErrors.supplier_id) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.supplier_id;
                return newErrors;
            });
        }
    };

    const handleInvoiceNumberChange = (invoiceNumber: string) => {
        setFormData(prev => ({ ...prev, invoice_number: invoiceNumber }));

        // Clear validation error for invoice_number
        if (validationErrors.invoice_number) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.invoice_number;
                return newErrors;
            });
        }
    };

    const handleInvoiceNumberBlur = async (invoiceNumber: string) => {
        if (!invoiceNumber.trim() || !formData.supplier_id || !editingInvoice) {
            return;
        }

        const validation = await validateInvoiceNumber(invoiceNumber, formData.supplier_id, editingInvoice.id);

        if (!validation.valid) {
            setValidationErrors(prev => ({
                ...prev,
                invoice_number: validation.message
            }));
        } else {
            // Clear any existing validation error
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.invoice_number;
                return newErrors;
            });
        }
    };

    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "");
        setFormData(prev => ({ ...prev, amount: numericValue }));

        // Clear validation error for amount
        if (validationErrors.amount) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.amount;
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!editingInvoice) return;

        setSubmitting(true);
        const success = await updateInvoice(editingInvoice.id, formData);
        if (success) {
            toast.success("Invoice updated successfully!");
            router.push("/invoices");
        } else {
            toast.error("Failed to update invoice. Please try again.");
        }
        setSubmitting(false);
    };

    const handleCancel = () => {
        router.push("/invoices");
    };

    // Show loading state while checking authentication or loading invoice
    if (status === "loading" || loading) {
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
                                    You need to be logged in to edit invoices.
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
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Invoices
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
                    <p className="text-muted-foreground">
                        Update the invoice details and manage related documents
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Invoice Details</TabsTrigger>
                    <TabsTrigger value="documents">Additional Documents</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                            <CardDescription>
                                Update the details for this invoice
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                {/* <h3 className="text-lg font-medium">Basic Information</h3> */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="supplier_id">Supplier *</Label>
                                        <Select
                                            key={`edit-supplier-${editingInvoice?.id || "new"}`}
                                            value={formData.supplier_id ? formData.supplier_id.toString() : ""}
                                            onValueChange={handleSupplierChange}
                                        >
                                            <SelectTrigger className={validationErrors.supplier_id ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search suppliers..."
                                                        value={supplierSearchTerm}
                                                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredSuppliers.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No suppliers found
                                                        </div>
                                                    ) : (
                                                        filteredSuppliers.map((supplier) => (
                                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                {getSupplierOptionDisplay(supplier)}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.supplier_id && (
                                            <p className="text-sm text-red-500">{validationErrors.supplier_id}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_number">Invoice Number *</Label>
                                        <Input
                                            id="invoice_number"
                                            value={formData.invoice_number}
                                            onChange={(e) => handleInvoiceNumberChange(e.target.value)}
                                            onBlur={(e) => handleInvoiceNumberBlur(e.target.value)}
                                            placeholder="Enter invoice number"
                                            className={validationErrors.invoice_number ? "border-red-500" : ""}
                                        />
                                        {validationErrors.invoice_number && (
                                            <p className="text-sm text-red-500">{validationErrors.invoice_number}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type_id">Invoice Type *</Label>
                                        <Select
                                            key={`edit-type-${editingInvoice?.id || "new"}`}
                                            value={formData.type_id ? formData.type_id.toString() : ""}
                                            onValueChange={(value) => setFormData({ ...formData, type_id: parseInt(value) })}
                                        >
                                            <SelectTrigger className={validationErrors.type_id ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select invoice type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search invoice types..."
                                                        value={typeSearchTerm}
                                                        onChange={(e) => setTypeSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredInvoiceTypes.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No invoice types found
                                                        </div>
                                                    ) : (
                                                        filteredInvoiceTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                                {type.type_name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.type_id && (
                                            <p className="text-sm text-red-500">{validationErrors.type_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dates and PO Section */}
                            <div className="space-y-4">
                                {/* <h3 className="text-lg font-medium">Dates and PO Information</h3> */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_date">Invoice Date *</Label>
                                        <Input
                                            id="invoice_date"
                                            type="date"
                                            value={formData.invoice_date}
                                            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                            className={validationErrors.invoice_date ? "border-red-500" : ""}
                                        />
                                        {validationErrors.invoice_date && (
                                            <p className="text-sm text-red-500">{validationErrors.invoice_date}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="receive_date">Receive Date *</Label>
                                        <Input
                                            id="receive_date"
                                            type="date"
                                            value={formData.receive_date}
                                            onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
                                            className={validationErrors.receive_date ? "border-red-500" : ""}
                                        />
                                        {validationErrors.receive_date && (
                                            <p className="text-sm text-red-500">{validationErrors.receive_date}</p>
                                        )}
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
                                </div>
                            </div>

                            {/* Amount Section */}
                            <div className="space-y-4">
                                {/* <h3 className="text-lg font-medium">Amount Information</h3> */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">Currency *</Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IDR">IDR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="AUD">AUD</SelectItem>
                                                <SelectItem value="SGD">SGD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2 col-span-2">
                                        <Label htmlFor="amount">Amount *</Label>
                                        <Input
                                            id="amount"
                                            type="text"
                                            value={formatNumberWithCommas(formData.amount.toString())}
                                            onChange={(e) => handleAmountChange(e.target.value)}
                                            placeholder="Enter amount"
                                            className={validationErrors.amount ? "border-red-500" : ""}
                                        />
                                        {validationErrors.amount && (
                                            <p className="text-sm text-red-500">{validationErrors.amount}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Project Information Section */}
                            <div className="space-y-4">
                                {/* <h3 className="text-lg font-medium">Project Information</h3> */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="receive_project">Receive Project</Label>
                                        <Select
                                            key={`edit-receive-project-${editingInvoice?.id || "new"}`}
                                            value={formData.receive_project || ""}
                                            onValueChange={(value) => setFormData({ ...formData, receive_project: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select receive project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search projects..."
                                                        value={receiveProjectSearchTerm}
                                                        onChange={(e) => setReceiveProjectSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredReceiveProjects.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No projects found
                                                        </div>
                                                    ) : (
                                                        filteredReceiveProjects.map((project) => (
                                                            <SelectItem key={project.id} value={project.code}>
                                                                {getProjectOptionDisplay(project)}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_project">Invoice Project</Label>
                                        <Select
                                            key={`edit-invoice-project-${editingInvoice?.id || "new"}`}
                                            value={formData.invoice_project || ""}
                                            onValueChange={(value) => setFormData({ ...formData, invoice_project: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select invoice project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search projects..."
                                                        value={invoiceProjectSearchTerm}
                                                        onChange={(e) => setInvoiceProjectSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredInvoiceProjects.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No projects found
                                                        </div>
                                                    ) : (
                                                        filteredInvoiceProjects.map((project) => (
                                                            <SelectItem key={project.id} value={project.code}>
                                                                {getProjectOptionDisplay(project)}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="payment_project">Payment Project</Label>
                                        <Select
                                            key={`edit-payment-project-${editingInvoice?.id || "new"}`}
                                            value={formData.payment_project || ""}
                                            onValueChange={(value) => setFormData({ ...formData, payment_project: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search projects..."
                                                        value={projectSearchTerm}
                                                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredProjects.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No projects found
                                                        </div>
                                                    ) : (
                                                        filteredProjects.map((project) => (
                                                            <SelectItem key={project.id} value={project.code}>
                                                                {getProjectOptionDisplay(project)}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="space-y-4">
                                {/* <h3 className="text-lg font-medium">Additional Information</h3> */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cur_loc">
                                            Current Location
                                            {!canEditCurrentLocation && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    (Read-only)
                                                </span>
                                            )}
                                        </Label>
                                        <Select
                                            key={`edit-dept-${editingInvoice?.id || "new"}`}
                                            value={formData.cur_loc || ""}
                                            onValueChange={(value) => setFormData({ ...formData, cur_loc: value })}
                                            disabled={!canEditCurrentLocation}
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
                                        {!canEditCurrentLocation && (
                                            <p className="text-xs text-muted-foreground">
                                                You don't have permission to edit the current location
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="faktur_no">Faktur Number</Label>
                                        <Input
                                            id="faktur_no"
                                            value={formData.faktur_no}
                                            onChange={(e) => setFormData({ ...formData, faktur_no: e.target.value })}
                                            placeholder="Enter faktur number"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        value={formData.remarks}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setFormData({ ...formData, remarks: e.target.value })
                                        }
                                        placeholder="Enter remarks"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        !formData.invoice_number ||
                                        !formData.invoice_date ||
                                        !formData.receive_date ||
                                        !formData.supplier_id ||
                                        !formData.type_id ||
                                        !formData.amount ||
                                        submitting ||
                                        Object.keys(validationErrors).length > 0
                                    }
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {submitting ? "Updating..." : "Update Invoice"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    {editingInvoice && (
                        <InvoiceAdditionalDocuments
                            invoiceId={editingInvoice.id}
                            invoiceNumber={editingInvoice.invoice_number}
                        />
                    )}
                </TabsContent>

                <TabsContent value="attachments">
                    {editingInvoice && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Attachments</CardTitle>
                                <CardDescription>
                                    Upload and manage file attachments for this invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InvoiceAttachments
                                    invoiceId={editingInvoice.id}
                                    invoiceNumber={editingInvoice.invoice_number}
                                    readOnly={false}
                                    maxHeight="500px"
                                    showStats={true}
                                    allowMultipleSelection={true}
                                />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <Toaster />
        </div>
    );
} 