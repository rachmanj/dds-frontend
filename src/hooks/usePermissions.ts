import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Permission, PermissionFormData } from "@/types/user";

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  } | null>(null);

  // Fetch permissions
  const fetchPermissions = useCallback(
    async (search?: string) => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setError("You must be logged in to view permissions");
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
        const params = search ? { search } : {};
        const response = await api.get("/api/permissions", { params });
        setPermissions(response.data.data || response.data);
        setMeta(response.data.meta || null);
      } catch (error: unknown) {
        console.error("Error fetching permissions:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch permissions");
          }
        } else {
          setError("Failed to fetch permissions");
        }
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Create permission
  const createPermission = async (
    formData: PermissionFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create permissions");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/permissions", formData);
      const newPermission = response.data.data || response.data;
      setPermissions((prev) => [...prev, newPermission]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating permission:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create permission");
        }
      } else {
        setError("Failed to create permission");
      }
      return false;
    }
  };

  // Update permission
  const updatePermission = async (
    id: number,
    formData: PermissionFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update permissions");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/permissions/${id}`, formData);
      const updatedPermission = response.data.data || response.data;
      setPermissions((prev) =>
        prev.map((p) => (p.id === id ? updatedPermission : p))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating permission:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update permission");
        }
      } else {
        setError("Failed to update permission");
      }
      return false;
    }
  };

  // Delete permission
  const deletePermission = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete permissions");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/permissions/${id}`);
      setPermissions((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting permission:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete permission");
        }
      } else {
        setError("Failed to delete permission");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading: loading || status === "loading",
    error,
    meta,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };
}
