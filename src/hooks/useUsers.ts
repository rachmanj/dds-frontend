import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { User, UserFormData, Role } from "@/types/user";

export function useUsers() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  } | null>(null);

  // Fetch users
  const fetchUsers = useCallback(
    async (search?: string) => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setError("You must be logged in to view users");
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
        const response = await api.get("/api/users", { params });
        setUsers(response.data.data || response.data);
        setMeta(response.data.meta || null);
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch users");
          }
        } else {
          setError("Failed to fetch users");
        }
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Fetch available roles
  const fetchAvailableRoles = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) return;

    try {
      const response = await api.get("/api/available-roles");
      setAvailableRoles(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching available roles:", error);
    }
  }, [status, session?.accessToken]);

  // Create user
  const createUser = async (formData: UserFormData): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create users");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/users", formData);
      const newUser = response.data.data || response.data;
      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create user");
        }
      } else {
        setError("Failed to create user");
      }
      return false;
    }
  };

  // Update user
  const updateUser = async (
    id: number,
    formData: UserFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update users");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/users/${id}`, formData);
      const updatedUser = response.data.data || response.data;
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return true;
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update user");
        }
      } else {
        setError("Failed to update user");
      }
      return false;
    }
  };

  // Delete user
  const deleteUser = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete users");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete user");
        }
      } else {
        setError("Failed to delete user");
      }
      return false;
    }
  };

  // Assign roles to user
  const assignRoles = async (
    userId: number,
    roleIds: number[]
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to assign roles");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post(`/api/users/${userId}/assign-roles`, {
        roles: roleIds,
      });
      const updatedUser = response.data.data || response.data;
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      return true;
    } catch (error: unknown) {
      console.error("Error assigning roles:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to assign roles");
        }
      } else {
        setError("Failed to assign roles");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, [fetchUsers, fetchAvailableRoles]);

  return {
    users,
    availableRoles,
    loading: loading || status === "loading",
    error,
    meta,
    fetchUsers,
    fetchAvailableRoles,
    createUser,
    updateUser,
    deleteUser,
    assignRoles,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };
}
