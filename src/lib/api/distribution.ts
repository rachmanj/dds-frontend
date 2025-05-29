import api from "@/lib/axios";
import {
  DistributionType,
  Distribution,
  CreateDistributionRequest,
  UpdateDistributionRequest,
  DistributionHistory,
  TransmittalAdviceData,
  ApiResponse,
  PaginatedResponse,
  DistributionFilters,
  CreateDistributionTypeRequest,
  UpdateDistributionTypeRequest,
  DocumentVerification,
} from "@/types/distribution";

// Distribution Types API
export const distributionTypeService = {
  // Get all distribution types
  getAll: async (): Promise<DistributionType[]> => {
    const response = await api.get("/api/distribution-types");
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Laravel Resource Collections return data in the 'data' property
    return response.data.data || [];
  },

  // Get distribution type by ID
  getById: async (id: number): Promise<DistributionType> => {
    const response = await api.get(`/api/distribution-types/${id}`);
    // Single resources return data directly or in 'data' property
    return response.data.data || response.data;
  },

  // Create distribution type
  create: async (
    data: CreateDistributionTypeRequest
  ): Promise<DistributionType> => {
    const response = await api.post("/api/distribution-types", data);
    return response.data.data || response.data;
  },

  // Update distribution type
  update: async (
    id: number,
    data: UpdateDistributionTypeRequest
  ): Promise<DistributionType> => {
    const response = await api.put(`/api/distribution-types/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete distribution type
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/distribution-types/${id}`);
  },

  // Check if code is unique
  checkCodeUnique: async (
    code: string,
    excludeId?: number
  ): Promise<boolean> => {
    const response = await api.post("/api/distribution-types/check-code", {
      code,
      exclude_id: excludeId,
    });
    return response.data.unique || false;
  },
};

// Distributions API
export const distributionService = {
  // Get all distributions with filters and pagination
  getAll: async (
    filters?: DistributionFilters,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<Distribution>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());

    if (filters) {
      if (filters.status) params.append("status", filters.status);
      if (filters.type_id) params.append("type_id", filters.type_id.toString());
      if (filters.origin_department_id)
        params.append(
          "origin_department_id",
          filters.origin_department_id.toString()
        );
      if (filters.destination_department_id)
        params.append(
          "destination_department_id",
          filters.destination_department_id.toString()
        );
      if (filters.search) params.append("search", filters.search);
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);
    }

    const response = await api.get(`/api/distributions?${params.toString()}`);

    // Handle Laravel pagination response structure
    if (response.data.data) {
      return response.data.data;
    }

    // Fallback for unexpected response structure
    return {
      current_page: 1,
      data: [],
      first_page_url: "",
      from: 0,
      last_page: 1,
      last_page_url: "",
      links: [],
      next_page_url: undefined,
      path: "",
      per_page: perPage,
      prev_page_url: undefined,
      to: 0,
      total: 0,
    };
  },

  // Get distribution by ID
  getById: async (id: number): Promise<Distribution> => {
    const response = await api.get<ApiResponse<Distribution>>(
      `/api/distributions/${id}`
    );
    if (!response.data.data) {
      throw new Error("Distribution not found");
    }
    return response.data.data;
  },

  // Create distribution
  create: async (
    data: CreateDistributionRequest
  ): Promise<Distribution & { warnings?: any[]; auto_included?: any[] }> => {
    const response = await api.post("/api/distributions", data);

    // Handle Laravel API response format with potential warnings
    const distribution = response.data.data || response.data;

    // Add warnings and auto_included from response if present
    if (response.data.warnings) {
      distribution.warnings = response.data.warnings;
    }
    if (response.data.auto_included) {
      distribution.auto_included = response.data.auto_included;
    }

    return distribution;
  },

  // Update distribution
  update: async (
    id: number,
    data: UpdateDistributionRequest
  ): Promise<Distribution> => {
    const response = await api.put(`/api/distributions/${id}`, data);
    // Handle Laravel API response format
    return response.data.data || response.data;
  },

  // Delete distribution
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/distributions/${id}`);
  },

  // Workflow actions
  verifySender: async (
    id: number,
    documentVerifications: Array<{
      document_type: string;
      document_id: number;
      status?: string;
      notes?: string;
    }>,
    verificationNotes?: string
  ): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/verify-sender`,
      {
        document_verifications: documentVerifications,
        verification_notes: verificationNotes,
      }
    );
    if (!response.data.data) {
      throw new Error("Failed to verify sender");
    }
    return response.data.data;
  },

  send: async (id: number): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/send`
    );
    if (!response.data.data) {
      throw new Error("Failed to send distribution");
    }
    return response.data.data;
  },

  receive: async (id: number): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/receive`
    );
    if (!response.data.data) {
      throw new Error("Failed to receive distribution");
    }
    return response.data.data;
  },

  verifyReceiver: async (
    id: number,
    documentVerifications: Array<{
      document_type: string;
      document_id: number;
      status: string;
      notes?: string;
    }>,
    verificationNotes?: string,
    forceCompleteWithDiscrepancies?: boolean
  ): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/verify-receiver`,
      {
        document_verifications: documentVerifications,
        verification_notes: verificationNotes,
        force_complete_with_discrepancies: forceCompleteWithDiscrepancies,
      }
    );
    if (!response.data.data) {
      throw new Error("Failed to verify receiver");
    }
    return response.data.data;
  },

  complete: async (id: number): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/complete`
    );
    if (!response.data.data) {
      throw new Error("Failed to complete distribution");
    }
    return response.data.data;
  },

  // Document management
  attachDocuments: async (
    id: number,
    documents: Array<{ type: string; id: number }>
  ): Promise<Distribution> => {
    const response = await api.post<ApiResponse<Distribution>>(
      `/api/distributions/${id}/attach-documents`,
      { documents }
    );
    if (!response.data.data) {
      throw new Error("Failed to attach documents");
    }
    return response.data.data;
  },

  detachDocument: async (
    id: number,
    documentType: string,
    documentId: number
  ): Promise<Distribution> => {
    const response = await api.delete<ApiResponse<Distribution>>(
      `/api/distributions/${id}/detach-document/${documentType}/${documentId}`
    );
    if (!response.data.data) {
      throw new Error("Failed to detach document");
    }
    return response.data.data;
  },

  // Query methods
  getHistory: async (id: number): Promise<DistributionHistory[]> => {
    const response = await api.get<ApiResponse<DistributionHistory[]>>(
      `/api/distributions/${id}/history`
    );
    return response.data.data || [];
  },

  getTransmittalAdvice: async (id: number): Promise<Blob> => {
    const response = await api.get(`/api/distributions/${id}/transmittal`, {
      responseType: "blob",
    });
    return response.data;
  },

  getTransmittalAdvicePreview: async (
    id: number
  ): Promise<TransmittalAdviceData> => {
    const response = await api.get<ApiResponse<TransmittalAdviceData>>(
      `/api/distributions/${id}/transmittal-preview`
    );
    if (!response.data.data) {
      throw new Error("Failed to get transmittal advice preview");
    }
    return response.data.data;
  },

  getByDepartment: async (departmentId: number): Promise<Distribution[]> => {
    const response = await api.get<ApiResponse<Distribution[]>>(
      `/api/distributions/by-department/${departmentId}`
    );
    return response.data.data || [];
  },

  getByStatus: async (status: string): Promise<Distribution[]> => {
    const response = await api.get<ApiResponse<Distribution[]>>(
      `/api/distributions/by-status/${status}`
    );
    return response.data.data || [];
  },

  getByUser: async (userId: number): Promise<Distribution[]> => {
    const response = await api.get<ApiResponse<Distribution[]>>(
      `/api/distributions/by-user/${userId}`
    );
    return response.data.data || [];
  },
};

// Combined service object for backward compatibility
export const distributionApiService = {
  types: distributionTypeService,
  distributions: distributionService,
};
