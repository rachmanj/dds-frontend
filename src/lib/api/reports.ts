import axios from "../axios";

// TypeScript interfaces for report data
export interface ReportFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  supplier_id?: number;
  type_id?: number;
  origin_department_id?: number;
  destination_department_id?: number;
  created_by?: number;
  per_page?: number;
}

export interface TimelineEvent {
  id: number;
  action: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  notes?: string;
}

export interface InvoiceReport {
  id: number;
  invoice_number: string;
  faktur_no?: string;
  invoice_date: string;
  receive_date?: string;
  po_no?: string;
  currency: string;
  amount: number;
  status: string;
  supplier: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    type_name: string;
  };
  creator: {
    id: number;
    name: string;
  };
  additionalDocuments?: any[];
  attachments?: any[];
  distributions?: any[];
}

export interface AdditionalDocumentReport {
  id: number;
  document_number: string;
  document_date: string;
  receive_date?: string;
  po_no?: string;
  project?: string;
  description?: string;
  type: {
    id: number;
    type_name: string;
  };
  creator: {
    id: number;
    name: string;
  };
  invoices?: any[];
  distributions?: any[];
}

export interface DistributionReport {
  id: number;
  distribution_number: string;
  status: string;
  created_at: string;
  type: {
    id: number;
    name: string;
    code: string;
  };
  origin_department: {
    id: number;
    name: string;
    location_code: string;
  };
  destination_department: {
    id: number;
    name: string;
    location_code: string;
  };
  creator: {
    id: number;
    name: string;
  };
  invoices?: any[];
  additionalDocuments?: any[];
  histories?: TimelineEvent[];
  timeline_summary?: {
    total_actions: number;
    current_status: string;
    created_at: string;
    last_action_at?: string;
    is_complete: boolean;
    has_discrepancies: boolean;
  };
  document_summary?: {
    total_invoices: number;
    total_additional_documents: number;
    total_documents: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    total: number;
    per_page: number;
    last_page: number;
  };
  message: string;
}

// Invoice Reports API
export const getInvoicesReport = async (
  filters: ReportFilters = {}
): Promise<PaginatedResponse<InvoiceReport>> => {
  const response = await axios.get("/api/reports/invoices", {
    params: filters,
  });
  return response.data;
};

export const getInvoiceDetails = async (
  id: number
): Promise<ApiResponse<InvoiceReport>> => {
  const response = await axios.get(`/api/reports/invoices/${id}`);
  return response.data;
};

// Additional Documents Reports API
export const getAdditionalDocumentsReport = async (
  filters: ReportFilters = {}
): Promise<PaginatedResponse<AdditionalDocumentReport>> => {
  const response = await axios.get("/api/reports/additional-documents", {
    params: filters,
  });
  return response.data;
};

export const getAdditionalDocumentDetails = async (
  id: number
): Promise<ApiResponse<AdditionalDocumentReport>> => {
  const response = await axios.get(`/api/reports/additional-documents/${id}`);
  return response.data;
};

// Distribution Reports API
export const getDistributionsReport = async (
  filters: ReportFilters = {}
): Promise<PaginatedResponse<DistributionReport>> => {
  const response = await axios.get("/api/reports/distributions", {
    params: filters,
  });
  return response.data;
};

export const getDistributionDetails = async (
  id: number
): Promise<ApiResponse<DistributionReport>> => {
  const response = await axios.get(`/api/reports/distributions/${id}`);
  return response.data;
};
