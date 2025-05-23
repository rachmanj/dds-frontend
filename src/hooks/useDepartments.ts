import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Department, DepartmentFormData } from "@/types/department";

export function useDepartments() {
  const { data: session, status } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      setError("You must be logged in to view departments");
      setLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/departments");
      setDepartments(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Error fetching departments:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch departments");
        }
      } else {
        setError("Failed to fetch departments");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // Create department
  const createDepartment = async (
    formData: DepartmentFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create departments");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/departments", formData);
      const newDepartment = response.data.data || response.data;
      setDepartments((prev) => [...prev, newDepartment]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating department:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create department");
        }
      } else {
        setError("Failed to create department");
      }
      return false;
    }
  };

  // Update department
  const updateDepartment = async (
    id: number,
    formData: DepartmentFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update departments");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/departments/${id}`, formData);
      const updatedDepartment = response.data.data || response.data;
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? updatedDepartment : d))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating department:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update department");
        }
      } else {
        setError("Failed to update department");
      }
      return false;
    }
  };

  // Delete department
  const deleteDepartment = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete departments");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting department:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete department");
        }
      } else {
        setError("Failed to delete department");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading: loading || status === "loading",
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
