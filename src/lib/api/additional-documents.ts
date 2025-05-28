import api from "@/lib/axios";

export interface AdditionalDocument {
  id: number;
  document_number: string;
  document_date: string;
  remarks?: string;
  type?: {
    id: number;
    type_name: string;
  };
  cur_loc?: string;
  status?: string;
  po_no?: string;
  project?: string;
}

export interface AdditionalDocumentFilters {
  search?: string;
  status?: string;
  type_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

// Additional Documents API
export const additionalDocumentService = {
  // Get additional documents filtered by user's location for distribution
  getForDistribution: async (
    filters?: AdditionalDocumentFilters
  ): Promise<AdditionalDocument[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type_id) params.append("type_id", filters.type_id.toString());
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const response = await api.get(
      `/api/additional-documents-for-distribution?${params.toString()}`
    );

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  // Get all additional documents filtered by user's location
  getAll: async (filters?: AdditionalDocumentFilters): Promise<any> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type_id) params.append("type_id", filters.type_id.toString());
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());

    const response = await api.get(
      `/api/additional-documents-location-filtered?${params.toString()}`
    );

    // Handle Laravel pagination response structure
    if (response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Get single additional document by ID (location-filtered)
  getById: async (id: number): Promise<AdditionalDocument> => {
    const response = await api.get(
      `/api/additional-documents-location-filtered/${id}`
    );
    return response.data.data || response.data;
  },
};
