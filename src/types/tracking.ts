export interface DocumentLocation {
  id: number;
  document_type: "invoice" | "additional_document";
  document_id: number;
  location_code: string;
  moved_by: number | null;
  moved_at: string;
  distribution_id: number | null;
  reason: string | null;
  // Relations
  moved_by_user?: {
    id: number;
    name: string;
  };
  distribution?: {
    id: number;
    distribution_number: string;
  };
  department?: {
    location_code: string;
    name: string;
  };
}

export interface TrackingEvent {
  id: number;
  trackable_type: string;
  trackable_id: number;
  event_type: string;
  user_id: number | null;
  metadata: Record<string, any> | null;
  created_at: string;
  // Relations
  user?: {
    id: number;
    name: string;
  };
}

export interface TimelineEvent {
  type: "location_change" | "tracking_event";
  date: string;
  // Location change specific
  location_code?: string;
  department_name?: string;
  moved_by?: string;
  reason?: string;
  distribution_number?: string;
  // Tracking event specific
  event_type?: string;
  user?: string;
  metadata?: Record<string, any>;
}

export interface DocumentTrackingResponse {
  success: boolean;
  data: DocumentLocation[] | TimelineEvent[] | any;
  meta?: {
    total_events?: number;
    document_type?: string;
    document_id?: number;
    location_code?: string;
    total_documents?: number;
    limit?: number;
    period_days?: number;
    total_locations?: number;
    query?: string;
    total_results?: number;
  };
  message?: string;
  error?: string;
}

export interface CurrentLocationResponse {
  success: boolean;
  data: {
    current_location: string | null;
    document_type: string;
    document_id: number;
  };
}

export interface LocationDocument {
  document: any; // Invoice or AdditionalDocument
  document_type: "invoice" | "additional_document";
  location_info: DocumentLocation;
}

export interface MovementStatistic {
  location_code: string;
  movements: number;
}

export interface DepartmentSummary {
  id: number;
  name: string;
  location_code: string;
  invoice_count: number;
  additional_doc_count: number;
}

export interface TrackMovementRequest {
  document_type: "invoice" | "additional_document";
  document_id: number;
  from_location: string;
  to_location: string;
  reason: string;
  distribution_id?: number;
}

export interface DocumentWithTracking {
  id: number;
  // Document specific fields
  document_number?: string;
  invoice_number?: string;
  created_at: string;
  // Tracking fields
  current_location: string | null;
  location_history?: DocumentLocation[];
  timeline?: TimelineEvent[];
}
