import axios from "axios";
import {
  DocumentTrackingResponse,
  CurrentLocationResponse,
  TrackMovementRequest,
  TimelineEvent,
  DocumentLocation,
  LocationDocument,
  MovementStatistic,
  DepartmentSummary,
} from "@/types/tracking";

const API_BASE = "/api/tracking";

export class DocumentTrackingService {
  /**
   * Get document movement history
   */
  static async getHistory(
    documentType: "invoice" | "additional_document",
    documentId: number
  ): Promise<DocumentLocation[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/${documentType}/${documentId}/history`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch document history"
      );
    }

    return response.data.data;
  }

  /**
   * Get document timeline with detailed events
   */
  static async getTimeline(
    documentType: "invoice" | "additional_document",
    documentId: number
  ): Promise<TimelineEvent[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/${documentType}/${documentId}/timeline`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch document timeline"
      );
    }

    return response.data.data;
  }

  /**
   * Get current location of a document
   */
  static async getCurrentLocation(
    documentType: "invoice" | "additional_document",
    documentId: number
  ): Promise<string | null> {
    const response = await axios.get<CurrentLocationResponse>(
      `${API_BASE}/${documentType}/${documentId}/location`
    );

    if (!response.data.success) {
      throw new Error("Failed to fetch current location");
    }

    return response.data.data.current_location;
  }

  /**
   * Get all documents in a specific location
   */
  static async getLocationDocuments(
    locationCode: string,
    limit: number = 50
  ): Promise<LocationDocument[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/location/${locationCode}/documents`,
      { params: { limit } }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch location documents"
      );
    }

    return response.data.data;
  }

  /**
   * Track a document movement manually
   */
  static async trackMovement(
    request: TrackMovementRequest
  ): Promise<DocumentLocation> {
    const response = await axios.post<DocumentTrackingResponse>(
      `${API_BASE}/move`,
      request
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to track document movement"
      );
    }

    return response.data.data;
  }

  /**
   * Get movement statistics
   */
  static async getStatistics(days: number = 30): Promise<MovementStatistic[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/statistics`,
      { params: { days } }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch movement statistics"
      );
    }

    return response.data.data;
  }

  /**
   * Get department location summary
   */
  static async getDepartmentSummary(): Promise<DepartmentSummary[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/departments/summary`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch department summary"
      );
    }

    return response.data.data;
  }

  /**
   * Search documents by location history
   */
  static async search(query: string, limit: number = 20): Promise<any[]> {
    const response = await axios.get<DocumentTrackingResponse>(
      `${API_BASE}/search`,
      { params: { q: query, limit } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Search failed");
    }

    return response.data.data;
  }

  /**
   * Initialize tracking for existing documents
   */
  static async initializeTracking(): Promise<{
    invoices: number;
    additional_documents: number;
  }> {
    const response = await axios.post<DocumentTrackingResponse>(
      `${API_BASE}/initialize`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to initialize tracking");
    }

    return response.data.data;
  }

  /**
   * Format timeline event for display
   */
  static formatTimelineEvent(event: TimelineEvent): string {
    if (event.type === "location_change") {
      return `Moved to ${event.department_name} (${event.location_code})`;
    }

    const eventTypeMap: Record<string, string> = {
      document_created: "Document Created",
      document_updated: "Document Updated",
      document_moved: "Document Moved",
      document_deleted: "Document Deleted",
      distribution_created: "Distribution Created",
      distribution_sent: "Distribution Sent",
      distribution_received: "Distribution Received",
      distribution_verified: "Distribution Verified",
      distribution_completed: "Distribution Completed",
    };

    return (
      eventTypeMap[event.event_type || ""] ||
      event.event_type ||
      "Unknown Event"
    );
  }

  /**
   * Get event icon for timeline display
   */
  static getEventIcon(event: TimelineEvent): string {
    if (event.type === "location_change") {
      return "📍";
    }

    const iconMap: Record<string, string> = {
      document_created: "📄",
      document_updated: "✏️",
      document_moved: "🚚",
      document_deleted: "🗑️",
      distribution_created: "📋",
      distribution_sent: "📤",
      distribution_received: "📥",
      distribution_verified: "✅",
      distribution_completed: "🏁",
    };

    return iconMap[event.event_type || ""] || "📌";
  }

  /**
   * Get event color for timeline display
   */
  static getEventColor(event: TimelineEvent): string {
    if (event.type === "location_change") {
      return "blue";
    }

    const colorMap: Record<string, string> = {
      document_created: "green",
      document_updated: "yellow",
      document_moved: "blue",
      document_deleted: "red",
      distribution_created: "purple",
      distribution_sent: "orange",
      distribution_received: "teal",
      distribution_verified: "green",
      distribution_completed: "emerald",
    };

    return colorMap[event.event_type || ""] || "gray";
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString();
  }
}
