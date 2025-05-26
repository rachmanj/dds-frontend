import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { AdditionalDocument } from "@/types/additional-document";

export function useInvoiceAdditionalDocuments() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get additional documents for an invoice
  const getInvoiceAdditionalDocuments = useCallback(
    async (invoiceId: number): Promise<AdditionalDocument[]> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/api/invoices/${invoiceId}/additional-documents`
        );
        return response.data.data || response.data;
      } catch (error: unknown) {
        console.error("Error fetching invoice additional documents:", error);
        setError("Failed to fetch additional documents");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Attach additional document to invoice
  const attachAdditionalDocument = useCallback(
    async (
      invoiceId: number,
      additionalDocumentId: number
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.post(`/api/invoices/${invoiceId}/additional-documents`, {
          additional_document_id: additionalDocumentId,
        });
        return true;
      } catch (error: unknown) {
        console.error("Error attaching additional document:", error);
        setError("Failed to attach additional document");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Detach additional document from invoice
  const detachAdditionalDocument = useCallback(
    async (
      invoiceId: number,
      additionalDocumentId: number
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.delete(
          `/api/invoices/${invoiceId}/additional-documents/${additionalDocumentId}`
        );
        return true;
      } catch (error: unknown) {
        console.error("Error detaching additional document:", error);
        setError("Failed to detach additional document");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [status, session?.accessToken]
  );

  // Sync additional documents for invoice
  const syncAdditionalDocuments = useCallback(
    async (
      invoiceId: number,
      additionalDocumentIds: number[]
    ): Promise<boolean> => {
      if (status !== "authenticated" || !session?.accessToken) {
        setError("Authentication required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await api.put(`/api/invoices/${invoiceId}/additional-documents`, {
          additional_document_ids: additionalDocumentIds,
        });
        return true;
      } catch (error: unknown) {
        console.error("Error syncing additional documents:", error);
        setError("Failed to sync additional documents");
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
    getInvoiceAdditionalDocuments,
    attachAdditionalDocument,
    detachAdditionalDocument,
    syncAdditionalDocuments,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };
}
