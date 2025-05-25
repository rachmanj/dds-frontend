import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import {
  AdditionalDocument,
  AdditionalDocumentFormData,
} from "@/types/additional-document";

export function useAdditionalDocuments() {
  const { data: session, status } = useSession();
  const [additionalDocuments, setAdditionalDocuments] = useState<
    AdditionalDocument[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch additional documents
  const fetchAdditionalDocuments = useCallback(async () => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      setError("You must be logged in to view additional documents");
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
      const response = await api.get("/api/additional-documents");
      setAdditionalDocuments(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Error fetching additional documents:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch additional documents");
        }
      } else {
        setError("Failed to fetch additional documents");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // Create additional document
  const createAdditionalDocument = async (
    formData: AdditionalDocumentFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create additional documents");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/additional-documents", formData);
      const newAdditionalDocument = response.data.data || response.data;
      setAdditionalDocuments((prev) => [...prev, newAdditionalDocument]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating additional document:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create additional document");
        }
      } else {
        setError("Failed to create additional document");
      }
      return false;
    }
  };

  // Update additional document
  const updateAdditionalDocument = async (
    id: number,
    formData: AdditionalDocumentFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update additional documents");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(
        `/api/additional-documents/${id}`,
        formData
      );
      const updatedAdditionalDocument = response.data.data || response.data;
      setAdditionalDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? updatedAdditionalDocument : doc))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating additional document:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update additional document");
        }
      } else {
        setError("Failed to update additional document");
      }
      return false;
    }
  };

  // Delete additional document
  const deleteAdditionalDocument = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete additional documents");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/additional-documents/${id}`);
      setAdditionalDocuments((prev) => prev.filter((doc) => doc.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting additional document:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete additional document");
        }
      } else {
        setError("Failed to delete additional document");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchAdditionalDocuments();
  }, [fetchAdditionalDocuments]);

  return {
    additionalDocuments,
    loading: loading || status === "loading",
    error,
    fetchAdditionalDocuments,
    createAdditionalDocument,
    updateAdditionalDocument,
    deleteAdditionalDocument,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
