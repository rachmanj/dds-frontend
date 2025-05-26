"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Invoice, InvoiceFormData } from "@/types/invoice";

export function useInvoices() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("You must be logged in to view invoices");
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

      // Fetch all invoices without pagination for simplicity
      const response = await api.get("/api/invoices?per_page=1000");
      const responseData = response.data;

      // Handle Laravel Resource Collection response structure
      const invoicesData = Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      // Ensure all invoices have safe defaults for critical fields
      const safeInvoicesData = invoicesData.map(
        (invoice: Partial<Invoice>) => ({
          ...invoice,
          invoice_number: invoice.invoice_number || "",
          status: invoice.status || "open",
          currency: invoice.currency || "IDR",
          amount: invoice.amount || 0,
        })
      );

      setInvoices(safeInvoicesData);
    } catch (error: unknown) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch invoices");
        }
      } else {
        setError("Failed to fetch invoices");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  const createInvoice = async (formData: InvoiceFormData): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create invoices");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount.toString()),
        supplier_id: parseInt(formData.supplier_id.toString()),
        type_id: parseInt(formData.type_id.toString()),
        // Convert empty strings to null for optional fields
        faktur_no: formData.faktur_no || null,
        po_no: formData.po_no || null,
        receive_project: formData.receive_project || null,
        invoice_project: formData.invoice_project || null,
        payment_project: formData.payment_project || null,
        remarks: formData.remarks || null,
        cur_loc: formData.cur_loc || null,
      };

      const response = await api.post("/api/invoices", dataToSend);
      const newInvoice = response.data.data || response.data;

      // Ensure the new invoice has required fields before adding to list
      if (newInvoice && newInvoice.id && newInvoice.invoice_number) {
        // Ensure critical fields have safe defaults
        const safeInvoice = {
          ...newInvoice,
          invoice_number: newInvoice.invoice_number || "",
          status: newInvoice.status || "open",
          currency: newInvoice.currency || "IDR",
          amount: newInvoice.amount || 0,
        };
        // Add to the beginning of the list
        setInvoices((prev) => [safeInvoice, ...prev]);
      }
      return true;
    } catch (error: unknown) {
      console.error("Error creating invoice:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else if (axiosError.response?.status === 422) {
          // Log validation errors for debugging
          console.error("Validation errors:", axiosError.response.data);
          setError("Validation failed. Please check your input and try again.");
        } else {
          setError("Failed to create invoice");
        }
      } else {
        setError("Failed to create invoice");
      }
      return false;
    }
  };

  const updateInvoice = async (
    id: number,
    formData: InvoiceFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update invoices");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount.toString()),
        supplier_id: parseInt(formData.supplier_id.toString()),
        type_id: parseInt(formData.type_id.toString()),
        // Convert empty strings to null for optional fields
        faktur_no: formData.faktur_no || null,
        po_no: formData.po_no || null,
        receive_project: formData.receive_project || null,
        invoice_project: formData.invoice_project || null,
        payment_project: formData.payment_project || null,
        remarks: formData.remarks || null,
        cur_loc: formData.cur_loc || null,
      };

      const response = await api.put(`/api/invoices/${id}`, dataToSend);
      const updatedInvoice = response.data.data || response.data;

      // Ensure the updated invoice has required fields before updating the list
      if (
        updatedInvoice &&
        updatedInvoice.id &&
        updatedInvoice.invoice_number
      ) {
        // Ensure critical fields have safe defaults
        const safeInvoice = {
          ...updatedInvoice,
          invoice_number: updatedInvoice.invoice_number || "",
          status: updatedInvoice.status || "open",
          currency: updatedInvoice.currency || "IDR",
          amount: updatedInvoice.amount || 0,
        };
        setInvoices((prev) =>
          prev.map((invoice) => (invoice.id === id ? safeInvoice : invoice))
        );
      }
      return true;
    } catch (error: unknown) {
      console.error("Error updating invoice:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else if (axiosError.response?.status === 422) {
          // Log validation errors for debugging
          console.error("Validation errors:", axiosError.response.data);
          setError("Validation failed. Please check your input and try again.");
        } else {
          setError("Failed to update invoice");
        }
      } else {
        setError("Failed to update invoice");
      }
      return false;
    }
  };

  const deleteInvoice = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete invoices");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/invoices/${id}`);
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting invoice:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete invoice");
        }
      } else {
        setError("Failed to delete invoice");
      }
      return false;
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading: loading || status === "loading",
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
