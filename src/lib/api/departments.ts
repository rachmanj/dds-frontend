import api from "@/lib/axios";
import { Department } from "@/types/department";

// Departments API
export const departmentService = {
  // Get all departments
  getAll: async (): Promise<Department[]> => {
    const response = await api.get("/api/departments");
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Laravel Resource Collections return data in the 'data' property
    return response.data.data || [];
  },

  // Get department by ID
  getById: async (id: number): Promise<Department> => {
    const response = await api.get(`/api/departments/${id}`);
    // Single resources return data directly or in 'data' property
    return response.data.data || response.data;
  },
};
