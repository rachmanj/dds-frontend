import { useState, useEffect, useCallback } from "react";
import { DocumentTrackingService } from "@/services/documentTrackingService";
import {
  DocumentLocation,
  TimelineEvent,
  LocationDocument,
  MovementStatistic,
  DepartmentSummary,
  TrackMovementRequest,
} from "@/types/tracking";
import { toast } from "sonner";

export const useDocumentHistory = (
  documentType: "invoice" | "additional_document",
  documentId: number
) => {
  const [history, setHistory] = useState<DocumentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.getHistory(
        documentType,
        documentId
      );
      setHistory(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch document history";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentType, documentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
};

export const useDocumentTimeline = (
  documentType: "invoice" | "additional_document",
  documentId: number
) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.getTimeline(
        documentType,
        documentId
      );
      setTimeline(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch document timeline";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentType, documentId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    timeline,
    loading,
    error,
    refetch: fetchTimeline,
  };
};

export const useCurrentLocation = (
  documentType: "invoice" | "additional_document",
  documentId: number
) => {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentLocation = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const location = await DocumentTrackingService.getCurrentLocation(
        documentType,
        documentId
      );
      setCurrentLocation(location);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch current location";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentType, documentId]);

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  return {
    currentLocation,
    loading,
    error,
    refetch: fetchCurrentLocation,
  };
};

export const useLocationDocuments = (
  locationCode: string,
  limit: number = 50
) => {
  const [documents, setDocuments] = useState<LocationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!locationCode) return;

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.getLocationDocuments(
        locationCode,
        limit
      );
      setDocuments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch location documents";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [locationCode, limit]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
  };
};

export const useMovementStatistics = (days: number = 30) => {
  const [statistics, setStatistics] = useState<MovementStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.getStatistics(days);
      setStatistics(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch movement statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

export const useDepartmentSummary = () => {
  const [summary, setSummary] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.getDepartmentSummary();
      setSummary(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch department summary";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};

export const useDocumentTracking = () => {
  const [loading, setLoading] = useState(false);

  const trackMovement = useCallback(async (request: TrackMovementRequest) => {
    try {
      setLoading(true);
      const result = await DocumentTrackingService.trackMovement(request);
      toast.success("Document movement tracked successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to track document movement";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string, limit: number = 20) => {
    try {
      setLoading(true);
      const results = await DocumentTrackingService.search(query, limit);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeTracking = useCallback(async () => {
    try {
      setLoading(true);
      const result = await DocumentTrackingService.initializeTracking();
      toast.success(
        `Tracking initialized: ${result.invoices} invoices, ${result.additional_documents} additional documents`
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize tracking";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    trackMovement,
    search,
    initializeTracking,
  };
};

export const useTrackingSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentTrackingService.search(query, limit);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};
