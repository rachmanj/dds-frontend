import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Invoice } from "@/types/invoice";

export function useAdditionalDocumentInvoices() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get invoices for an additional document
  const getAdditionalDocumentInvoices = useCallback(
    async (additionalDocumentId: number): Promise<Invoice[]> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/api/additional-documents/${additionalDocumentId}/invoices`
        );
        return response.data.data || response.data;
      } catch (error: unknown) {
        console.error("Error fetching additional document invoices:", error);
        setError("Failed to fetch invoices");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Attach invoice to additional document
  const attachInvoice = useCallback(
    async (
      additionalDocumentId: number,
      invoiceId: number
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.post(
          `/api/additional-documents/${additionalDocumentId}/invoices`,
          {
            invoice_id: invoiceId,
          }
        );
        return true;
      } catch (error: unknown) {
        console.error("Error attaching invoice:", error);
        setError("Failed to attach invoice");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Detach invoice from additional document
  const detachInvoice = useCallback(
    async (
      additionalDocumentId: number,
      invoiceId: number
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.delete(
          `/api/additional-documents/${additionalDocumentId}/invoices/${invoiceId}`
        );
        return true;
      } catch (error: unknown) {
        console.error("Error detaching invoice:", error);
        setError("Failed to detach invoice");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Sync invoices for additional document
  const syncInvoices = useCallback(
    async (
      additionalDocumentId: number,
      invoiceIds: number[]
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.put(
          `/api/additional-documents/${additionalDocumentId}/invoices`,
          {
            invoice_ids: invoiceIds,
          }
        );
        return true;
      } catch (error: unknown) {
        console.error("Error syncing invoices:", error);
        setError("Failed to sync invoices");
        return false;
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
    getAdditionalDocumentInvoices,
    attachInvoice,
    detachInvoice,
    syncInvoices,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };
}
