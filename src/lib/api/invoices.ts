import api from "@/lib/axios";

export interface Invoice {
  id: number;
  invoice_number: string;
  faktur_no?: string;
  invoice_date: string;
  amount?: number;
  currency?: string;
  supplier?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    type_name: string;
  };
  cur_loc?: string;
  status?: string;
  // Additional properties for distribution
  attached_documents_count?: number;
  attached_documents_in_location?: number;
  has_location_mismatch?: boolean;
  additionalDocuments?: any[];
}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

// Invoices API
export const invoiceService = {
  // Get invoices filtered by user's location for distribution
  getForDistribution: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const response = await api.get(
      `/api/invoices-for-distribution?${params.toString()}`
    );

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  // Get all invoices filtered by user's location
  getAll: async (filters?: InvoiceFilters): Promise<any> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());

    const response = await api.get(
      `/api/invoices-location-filtered?${params.toString()}`
    );

    // Handle Laravel pagination response structure
    if (response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Get single invoice by ID (location-filtered)
  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/api/invoices-location-filtered/${id}`);
    return response.data.data || response.data;
  },
};
