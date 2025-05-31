"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import {
  InvoiceReport,
  AdditionalDocumentReport,
  DistributionReport,
  ReportFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/lib/api/reports";

export function useReports() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;

  // Invoice Reports
  const fetchInvoicesReport = useCallback(
    async (filters: ReportFilters = {}) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/reports/invoices", {
          params: filters,
        });

        return response.data as PaginatedResponse<InvoiceReport>;
      } catch (error: unknown) {
        console.error("Error fetching invoices report:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch invoices report");
          }
        } else {
          setError("Failed to fetch invoices report");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  const fetchInvoiceDetails = useCallback(
    async (id: number) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/reports/invoices/${id}`);
        return response.data as ApiResponse<InvoiceReport>;
      } catch (error: unknown) {
        console.error("Error fetching invoice details:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch invoice details");
          }
        } else {
          setError("Failed to fetch invoice details");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Additional Documents Reports
  const fetchAdditionalDocumentsReport = useCallback(
    async (filters: ReportFilters = {}) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/reports/additional-documents", {
          params: filters,
        });

        return response.data as PaginatedResponse<AdditionalDocumentReport>;
      } catch (error: unknown) {
        console.error("Error fetching additional documents report:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch additional documents report");
          }
        } else {
          setError("Failed to fetch additional documents report");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  const fetchAdditionalDocumentDetails = useCallback(
    async (id: number) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/api/reports/additional-documents/${id}`
        );
        return response.data as ApiResponse<AdditionalDocumentReport>;
      } catch (error: unknown) {
        console.error("Error fetching additional document details:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch additional document details");
          }
        } else {
          setError("Failed to fetch additional document details");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Distribution Reports
  const fetchDistributionsReport = useCallback(
    async (filters: ReportFilters = {}) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/reports/distributions", {
          params: filters,
        });

        return response.data as PaginatedResponse<DistributionReport>;
      } catch (error: unknown) {
        console.error("Error fetching distributions report:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch distributions report");
          }
        } else {
          setError("Failed to fetch distributions report");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  const fetchDistributionDetails = useCallback(
    async (id: number) => {
      if (status === "loading") return null;
      if (status === "unauthenticated") {
        setError("You must be logged in to view reports");
        return null;
      }

      if (!session?.accessToken) {
        setError("No access token found. Please log in again.");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/reports/distributions/${id}`);
        return response.data as ApiResponse<DistributionReport>;
      } catch (error: unknown) {
        console.error("Error fetching distribution details:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError(
              "Authentication required. Please refresh the page and try again."
            );
          } else {
            setError("Failed to fetch distribution details");
          }
        } else {
          setError("Failed to fetch distribution details");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  const clearError = () => setError(null);

  return {
    loading,
    error,
    isAuthenticated,
    clearError,
    fetchInvoicesReport,
    fetchInvoiceDetails,
    fetchAdditionalDocumentsReport,
    fetchAdditionalDocumentDetails,
    fetchDistributionsReport,
    fetchDistributionDetails,
  };
}
