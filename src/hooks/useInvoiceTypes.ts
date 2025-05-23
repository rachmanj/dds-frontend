import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { InvoiceType, InvoiceTypeFormData } from "@/types/invoice-type";

export function useInvoiceTypes() {
  const { data: session, status } = useSession();
  const [invoiceTypes, setInvoiceTypes] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice types
  const fetchInvoiceTypes = useCallback(async () => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      setError("You must be logged in to view invoice types");
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
      const response = await api.get("/api/invoice-types");
      setInvoiceTypes(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Error fetching invoice types:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch invoice types");
        }
      } else {
        setError("Failed to fetch invoice types");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // Create invoice type
  const createInvoiceType = async (
    formData: InvoiceTypeFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create invoice types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/invoice-types", formData);
      const newInvoiceType = response.data.data || response.data;
      setInvoiceTypes((prev) => [...prev, newInvoiceType]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating invoice type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create invoice type");
        }
      } else {
        setError("Failed to create invoice type");
      }
      return false;
    }
  };

  // Update invoice type
  const updateInvoiceType = async (
    id: number,
    formData: InvoiceTypeFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update invoice types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/invoice-types/${id}`, formData);
      const updatedInvoiceType = response.data.data || response.data;
      setInvoiceTypes((prev) =>
        prev.map((type) => (type.id === id ? updatedInvoiceType : type))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating invoice type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update invoice type");
        }
      } else {
        setError("Failed to update invoice type");
      }
      return false;
    }
  };

  // Delete invoice type
  const deleteInvoiceType = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete invoice types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/invoice-types/${id}`);
      setInvoiceTypes((prev) => prev.filter((type) => type.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting invoice type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete invoice type");
        }
      } else {
        setError("Failed to delete invoice type");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchInvoiceTypes();
  }, [fetchInvoiceTypes]);

  return {
    invoiceTypes,
    loading: loading || status === "loading",
    error,
    fetchInvoiceTypes,
    createInvoiceType,
    updateInvoiceType,
    deleteInvoiceType,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
