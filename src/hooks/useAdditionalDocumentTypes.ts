import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import {
  AdditionalDocumentType,
  AdditionalDocumentTypeFormData,
} from "@/types/additional-document-type";

export function useAdditionalDocumentTypes() {
  const { data: session, status } = useSession();
  const [additionalDocumentTypes, setAdditionalDocumentTypes] = useState<
    AdditionalDocumentType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch additional document types
  const fetchAdditionalDocumentTypes = useCallback(async () => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      setError("You must be logged in to view additional document types");
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
      const response = await api.get("/api/addoc-types");
      setAdditionalDocumentTypes(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Error fetching additional document types:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch additional document types");
        }
      } else {
        setError("Failed to fetch additional document types");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // Create additional document type
  const createAdditionalDocumentType = async (
    formData: AdditionalDocumentTypeFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create additional document types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/addoc-types", formData);
      const newAdditionalDocumentType = response.data.data || response.data;
      setAdditionalDocumentTypes((prev) => [
        ...prev,
        newAdditionalDocumentType,
      ]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating additional document type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create additional document type");
        }
      } else {
        setError("Failed to create additional document type");
      }
      return false;
    }
  };

  // Update additional document type
  const updateAdditionalDocumentType = async (
    id: number,
    formData: AdditionalDocumentTypeFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update additional document types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/addoc-types/${id}`, formData);
      const updatedAdditionalDocumentType = response.data.data || response.data;
      setAdditionalDocumentTypes((prev) =>
        prev.map((type) =>
          type.id === id ? updatedAdditionalDocumentType : type
        )
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating additional document type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update additional document type");
        }
      } else {
        setError("Failed to update additional document type");
      }
      return false;
    }
  };

  // Delete additional document type
  const deleteAdditionalDocumentType = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete additional document types");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/addoc-types/${id}`);
      setAdditionalDocumentTypes((prev) =>
        prev.filter((type) => type.id !== id)
      );
      return true;
    } catch (error: unknown) {
      console.error("Error deleting additional document type:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete additional document type");
        }
      } else {
        setError("Failed to delete additional document type");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchAdditionalDocumentTypes();
  }, [fetchAdditionalDocumentTypes]);

  return {
    additionalDocumentTypes,
    loading: loading || status === "loading",
    error,
    fetchAdditionalDocumentTypes,
    createAdditionalDocumentType,
    updateAdditionalDocumentType,
    deleteAdditionalDocumentType,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
