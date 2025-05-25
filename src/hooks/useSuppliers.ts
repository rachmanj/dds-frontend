"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Supplier, SupplierFormData } from "@/types/supplier";

export function useSuppliers() {
  const { data: session, status } = useSession();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("You must be logged in to view suppliers");
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

      // Fetch all suppliers without pagination for simplicity
      const response = await api.get("/api/suppliers?per_page=1000");
      const responseData = response.data;

      // Handle Laravel Resource Collection response structure
      const suppliersData = Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      setSuppliers(suppliersData);
    } catch (error: unknown) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch suppliers");
        }
      } else {
        setError("Failed to fetch suppliers");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  const createSupplier = async (
    formData: SupplierFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create suppliers");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const dataToSend = {
        ...formData,
        created_by: session?.user?.id,
      };

      const response = await api.post("/api/suppliers", dataToSend);
      const newSupplier = response.data.data || response.data;

      // Add to the beginning of the list
      setSuppliers((prev) => [newSupplier, ...prev]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating supplier:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create supplier");
        }
      } else {
        setError("Failed to create supplier");
      }
      return false;
    }
  };

  const updateSupplier = async (
    id: number,
    formData: SupplierFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update suppliers");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/suppliers/${id}`, formData);
      const updatedSupplier = response.data.data || response.data;

      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? updatedSupplier : s))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating supplier:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update supplier");
        }
      } else {
        setError("Failed to update supplier");
      }
      return false;
    }
  };

  const deleteSupplier = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete suppliers");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/suppliers/${id}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting supplier:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete supplier");
        }
      } else {
        setError("Failed to delete supplier");
      }
      return false;
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading: loading || status === "loading",
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
