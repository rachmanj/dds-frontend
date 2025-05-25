"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InvoiceFormData } from "@/types/invoice";
import { Supplier } from "@/types/supplier";
import { InvoiceType } from "@/types/invoice-type";
import { Department } from "@/types/department";
import { Project } from "@/types/project";

interface CreateInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: InvoiceFormData;
    setFormData: (data: InvoiceFormData) => void;
    onSubmit: () => void;
    submitting: boolean;
    validationErrors: Record<string, string>;
    suppliers: Supplier[];
    invoiceTypes: InvoiceType[];
    departments: Department[];
    projects: Project[];
    filteredSuppliers: Supplier[];
    filteredInvoiceTypes: InvoiceType[];
    filteredDepartments: Department[];
    filteredInvoiceProjects: Project[];
    availableProjectsForCreate: Project[];
    supplierSearchTerm: string;
    setSupplierSearchTerm: (term: string) => void;
    typeSearchTerm: string;
    setTypeSearchTerm: (term: string) => void;
    departmentSearchTerm: string;
    setDepartmentSearchTerm: (term: string) => void;
    projectSearchTerm: string;
    setProjectSearchTerm: (term: string) => void;
    invoiceProjectSearchTerm: string;
    setInvoiceProjectSearchTerm: (term: string) => void;
    handleSupplierChange: (supplierId: string) => void;
    handleInvoiceNumberChange: (invoiceNumber: string) => void;
    handleInvoiceNumberBlur: (invoiceNumber: string) => void;
    handleAmountChange: (value: string) => void;
    formatNumberWithCommas: (value: string) => string;
    getSupplierOptionDisplay: (supplier: Supplier) => string;
    getDepartmentOptionDisplay: (department: Department) => string;
    getProjectOptionDisplay: (project: Project) => string;
    resetForm: () => void;
}

export function CreateInvoiceDialog({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    submitting,
    validationErrors,
    filteredSuppliers,
    filteredInvoiceTypes,
    filteredDepartments,
    filteredInvoiceProjects,
    availableProjectsForCreate,
    supplierSearchTerm,
    setSupplierSearchTerm,
    typeSearchTerm,
    setTypeSearchTerm,
    departmentSearchTerm,
    setDepartmentSearchTerm,
    projectSearchTerm,
    setProjectSearchTerm,
    invoiceProjectSearchTerm,
    setInvoiceProjectSearchTerm,
    handleSupplierChange,
    handleInvoiceNumberChange,
    handleInvoiceNumberBlur,
    handleAmountChange,
    formatNumberWithCommas,
    getSupplierOptionDisplay,
    getDepartmentOptionDisplay,
    getProjectOptionDisplay,
    resetForm,
}: CreateInvoiceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Add a new invoice to your system.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="supplier_id">Supplier *</Label>
                                <Select
                                    value={formData.supplier_id ? formData.supplier_id.toString() : ""}
                                    onValueChange={handleSupplierChange}
                                >
                                    <SelectTrigger>
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
                                    value={formData.type_id ? formData.type_id.toString() : ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, type_id: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger>
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
                            </div>
                        </div>
                    </div>

                    {/* Dates and PO Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invoice_date">Invoice Date *</Label>
                                <Input
                                    id="invoice_date"
                                    type="date"
                                    value={formData.invoice_date}
                                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="receive_date">Receive Date *</Label>
                                <Input
                                    id="receive_date"
                                    type="date"
                                    value={formData.receive_date}
                                    onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
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
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency *</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, currency: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IDR">IDR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="SGD">SGD</SelectItem>
                                        <SelectItem value="JPY">JPY</SelectItem>
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
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Information Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invoice_project">Invoice Project</Label>
                                <Select
                                    value={formData.invoice_project || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, invoice_project: value })
                                    }
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
                                    value={formData.payment_project || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, payment_project: value })
                                    }
                                    disabled={!formData.supplier_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.supplier_id ? "Select payment project" : "Select supplier first"} />
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
                                            {availableProjectsForCreate.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    {formData.supplier_id ? "No projects found" : "Select a supplier first"}
                                                </div>
                                            ) : (
                                                availableProjectsForCreate
                                                    .filter(project =>
                                                        !projectSearchTerm ||
                                                        project.code?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                                                        (project.owner && project.owner.toLowerCase().includes(projectSearchTerm.toLowerCase())) ||
                                                        (project.location && project.location.toLowerCase().includes(projectSearchTerm.toLowerCase()))
                                                    )
                                                    .map((project) => (
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
                        <div className="grid grid-cols-2 gap-4">
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
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Enter remarks"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            resetForm();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!formData.invoice_number || !formData.invoice_date || !formData.receive_date || !formData.supplier_id || !formData.type_id || !formData.amount || submitting || Object.keys(validationErrors).length > 0}
                    >
                        {submitting ? "Creating..." : "Create Invoice"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 