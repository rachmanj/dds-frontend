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
      // Use location-filtered endpoint to only show documents where cur_loc matches user's department location_code
      const response = await api.get(
        "/api/additional-documents-location-filtered"
      );

      // Handle the specific response structure from indexWithDepartmentFilter
      // Response structure: { success: true, data: { data: [...], total: x, ... } }
      let responseData;
      if (response.data?.success && response.data?.data) {
        // This is from the department filter endpoint
        responseData = response.data.data.data || response.data.data;
      } else {
        // Fallback for other response structures
        responseData = response.data.data || response.data;
      }

      // Ensure we always set an array
      const documents = Array.isArray(responseData) ? responseData : [];
      setAdditionalDocuments(documents);
    } catch (error: unknown) {
      console.error("Error fetching additional documents:", error);
      setAdditionalDocuments([]); // Reset to empty array on error
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
  ): Promise<{ success: boolean; error?: string }> => {
    if (status !== "authenticated") {
      const errorMsg = "You must be logged in to create additional documents";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!session?.accessToken) {
      const errorMsg = "No access token found. Please log in again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const response = await api.post("/api/additional-documents", formData);
      const newAdditionalDocument = response.data.data || response.data;

      // Ensure prev is always an array before spreading
      setAdditionalDocuments((prev) => {
        const currentDocs = Array.isArray(prev) ? prev : [];
        return [...currentDocs, newAdditionalDocument];
      });
      return { success: true };
    } catch (error: unknown) {
      console.error("Error creating additional document:", error);
      let errorMessage = "Failed to create additional document";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (axiosError.response?.status === 401) {
          errorMessage =
            "Authentication required. Please refresh the page and try again.";
        } else if (axiosError.response?.status === 422) {
          // Handle validation errors
          const responseData = axiosError.response.data;
          if (responseData?.errors) {
            // Check for unique validation error specifically
            const errors = responseData.errors;
            if (
              errors.document_number &&
              errors.document_number.some((msg: string) =>
                msg.includes("combination")
              )
            ) {
              errorMessage =
                "This document number already exists for the selected document type. Please use a different document number.";
            } else {
              // Get the first validation error
              const firstError = Object.values(errors)[0];
              errorMessage = Array.isArray(firstError)
                ? firstError[0]
                : String(firstError);
            }
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update additional document
  const updateAdditionalDocument = async (
    id: number,
    formData: AdditionalDocumentFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (status !== "authenticated") {
      const errorMsg = "You must be logged in to update additional documents";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!session?.accessToken) {
      const errorMsg = "No access token found. Please log in again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const response = await api.put(
        `/api/additional-documents/${id}`,
        formData
      );
      const updatedAdditionalDocument = response.data.data || response.data;

      // Ensure prev is always an array before mapping
      setAdditionalDocuments((prev) => {
        const currentDocs = Array.isArray(prev) ? prev : [];
        return currentDocs.map((doc) =>
          doc.id === id ? updatedAdditionalDocument : doc
        );
      });
      return { success: true };
    } catch (error: unknown) {
      console.error("Error updating additional document:", error);
      let errorMessage = "Failed to update additional document";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (axiosError.response?.status === 401) {
          errorMessage =
            "Authentication required. Please refresh the page and try again.";
        } else if (axiosError.response?.status === 422) {
          // Handle validation errors
          const responseData = axiosError.response.data;
          if (responseData?.errors) {
            // Check for unique validation error specifically
            const errors = responseData.errors;
            if (
              errors.document_number &&
              errors.document_number.some((msg: string) =>
                msg.includes("combination")
              )
            ) {
              errorMessage =
                "This document number already exists for the selected document type. Please use a different document number.";
            } else {
              // Get the first validation error
              const firstError = Object.values(errors)[0];
              errorMessage = Array.isArray(firstError)
                ? firstError[0]
                : String(firstError);
            }
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
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

      // Ensure prev is always an array before filtering
      setAdditionalDocuments((prev) => {
        const currentDocs = Array.isArray(prev) ? prev : [];
        return currentDocs.filter((doc) => doc.id !== id);
      });
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

  // Fetch all additional documents (without location filtering) for invoice attachment
  const fetchAllAdditionalDocuments = useCallback(async () => {
    if (status === "loading") return []; // Wait for session to load
    if (status === "unauthenticated") {
      return [];
    }

    if (!session?.accessToken) {
      return [];
    }

    try {
      // Use regular endpoint to get ALL additional documents
      const response = await api.get("/api/additional-documents");

      // Handle the response structure
      let responseData;
      if (response.data?.success && response.data?.data) {
        responseData = response.data.data.data || response.data.data;
      } else {
        responseData = response.data.data || response.data;
      }

      // Ensure we always return an array
      const documents = Array.isArray(responseData) ? responseData : [];
      return documents;
    } catch (error: unknown) {
      console.error("Error fetching all additional documents:", error);
      return [];
    }
  }, [status, session?.accessToken]);

  // Clear error
  const clearError = () => setError(null);

  // Import additional documents from Excel file
  const importAdditionalDocuments = async (
    file: File,
    checkDuplicates: boolean = false
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (status !== "authenticated") {
      const errorMsg = "You must be logged in to import additional documents";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!session?.accessToken) {
      const errorMsg = "No access token found. Please log in again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("check_duplicates", checkDuplicates ? "1" : "0");

      const response = await api.post(
        "/api/additional-documents/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh the documents list after successful import
      await fetchAdditionalDocuments();

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: unknown) {
      console.error("Error importing additional documents:", error);
      let errorMessage = "Failed to import additional documents";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (axiosError.response?.status === 401) {
          errorMessage =
            "Authentication required. Please refresh the page and try again.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "You do not have permission to import documents.";
        } else if (axiosError.response?.status === 422) {
          // Handle validation errors
          const responseData = axiosError.response.data;
          if (responseData?.errors) {
            const errors = responseData.errors;
            const firstError = Object.values(errors)[0];
            errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : String(firstError);
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

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
    importAdditionalDocuments,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
    fetchAllAdditionalDocuments,
  };
}
