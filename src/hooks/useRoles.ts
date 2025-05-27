import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Role, RoleFormData, Permission } from "@/types/user";

export function useRoles() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  } | null>(null);

  // Fetch roles
  const fetchRoles = useCallback(
    async (search?: string) => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setError("You must be logged in to view roles");
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
        const response = await api.get("/api/roles", { params });
        setRoles(response.data.data || response.data);
        setMeta(response.data.meta || null);
      } catch (error: unknown) {
        console.error("Error fetching roles:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch roles");
          }
        } else {
          setError("Failed to fetch roles");
        }
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Fetch available permissions
  const fetchAvailablePermissions = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) return;

    try {
      const response = await api.get("/api/available-permissions");
      setAvailablePermissions(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching available permissions:", error);
    }
  }, [status, session?.accessToken]);

  // Create role
  const createRole = async (formData: RoleFormData): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create roles");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/roles", formData);
      const newRole = response.data.data || response.data;
      setRoles((prev) => [...prev, newRole]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating role:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create role");
        }
      } else {
        setError("Failed to create role");
      }
      return false;
    }
  };

  // Update role
  const updateRole = async (
    id: number,
    formData: RoleFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update roles");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/roles/${id}`, formData);
      const updatedRole = response.data.data || response.data;
      setRoles((prev) => prev.map((r) => (r.id === id ? updatedRole : r)));
      return true;
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update role");
        }
      } else {
        setError("Failed to update role");
      }
      return false;
    }
  };

  // Delete role
  const deleteRole = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete roles");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting role:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete role");
        }
      } else {
        setError("Failed to delete role");
      }
      return false;
    }
  };

  // Assign permissions to role
  const assignPermissions = async (
    roleId: number,
    permissionIds: number[]
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to assign permissions");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post(
        `/api/roles/${roleId}/assign-permissions`,
        {
          permissions: permissionIds,
        }
      );
      const updatedRole = response.data.data || response.data;
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updatedRole : r)));
      return true;
    } catch (error: unknown) {
      console.error("Error assigning permissions:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to assign permissions");
        }
      } else {
        setError("Failed to assign permissions");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, [fetchRoles, fetchAvailablePermissions]);

  return {
    roles,
    availablePermissions,
    loading: loading || status === "loading",
    error,
    meta,
    fetchRoles,
    fetchAvailablePermissions,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };
}
