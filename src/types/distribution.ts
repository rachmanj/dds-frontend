// Distribution Types
export interface DistributionType {
  id: number;
  name: string;
  code: string;
  color: string;
  priority: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDistributionTypeRequest {
  name: string;
  code: string;
  color: string;
  priority: number;
  description?: string;
}

export interface UpdateDistributionTypeRequest {
  name?: string;
  code?: string;
  color?: string;
  priority?: number;
  description?: string;
}

// Distribution Status
export type DistributionStatus =
  | "draft"
  | "verified_by_sender"
  | "sent"
  | "received"
  | "verified_by_receiver"
  | "completed";

// Document Type for Distribution
export type DocumentType = "invoice" | "additional_document";

// Distribution Warning
export interface DistributionWarning {
  type: "location_mismatch";
  message: string;
  document_type: DocumentType;
  document_id: number;
  document_number: string;
}

// Auto-included Document
export interface AutoIncludedDocument {
  type: DocumentType;
  id: number;
  document_number: string;
  auto_included: boolean;
}

// Distribution Document
export interface DistributionDocument {
  id: number;
  distribution_id: number;
  document_type: DocumentType;
  document_id: number;
  sender_verified: boolean;
  receiver_verified: boolean;
  created_at: string;
  updated_at: string;
  // Polymorphic document data
  document?: {
    id: number;
    [key: string]: any;
  };
}

// Distribution
export interface Distribution {
  id: number;
  distribution_number: string;
  type_id: number;
  origin_department_id: number;
  destination_department_id: number;
  document_type: DocumentType;
  status: DistributionStatus;
  notes?: string;
  created_by: number;
  sender_verified_by?: number;
  receiver_verified_by?: number;
  sender_verified_at?: string;
  receiver_verified_at?: string;
  sent_at?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relationships
  type?: DistributionType;
  origin_department?: Department;
  destination_department?: Department;
  creator?: User;
  sender_verifier?: User;
  receiver_verifier?: User;
  documents?: DistributionDocument[];
  invoices?: Invoice[];
  additional_documents?: AdditionalDocument[];
  histories?: DistributionHistory[];

  // Additional properties for creation response
  warnings?: DistributionWarning[];
  auto_included?: AutoIncludedDocument[];
}

// Distribution History
export interface DistributionHistory {
  id: number;
  distribution_id: number;
  action: string;
  user_id: number;
  description: string;
  created_at: string;
  user?: User;
}

// Create Distribution Request
export interface CreateDistributionRequest {
  document_type: DocumentType;
  type_id: number;
  origin_department_id: number;
  destination_department_id: number;
  notes?: string;
  documents?: {
    type: DocumentType;
    id: number;
  }[];
}

// Update Distribution Request
export interface UpdateDistributionRequest {
  type_id?: number;
  destination_department_id?: number;
  notes?: string;
}

// Document Verification
export interface DocumentVerification {
  document_type: DocumentType;
  document_id: number;
}

// Distribution Filters
export interface DistributionFilters {
  status?: DistributionStatus;
  type_id?: number;
  origin_department_id?: number;
  destination_department_id?: number;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

// Transmittal Advice Data
export interface TransmittalAdviceData {
  distribution_number: string;
  distribution_date: string;
  distribution_type: string;
  origin_department: {
    name: string;
    location_code: string;
    project: string;
  };
  destination_department: {
    name: string;
    location_code: string;
    project: string;
  };
  creator: {
    name: string;
    department: string;
  };
  documents: {
    number: string;
    type: string;
    description: string;
    date?: string;
    amount?: number;
    currency?: string;
  }[];
  total_documents: number;
  notes?: string;
  qr_code_data: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url?: string;
    label: string;
    active: boolean;
  }[];
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

// Related types (assuming they exist in other files)
export interface Department {
  id: number;
  name: string;
  project: string;
  location_code: string;
  transit_code: string;
  akronim: string;
  sap_code: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  department_id?: number;
  department?: Department;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date?: string;
  amount?: number;
  currency?: string;
  supplier?: {
    id: number;
    name: string;
  };
  [key: string]: any;
}

export interface AdditionalDocument {
  id: number;
  document_number: string;
  document_date?: string;
  remarks?: string;
  type?: {
    id: number;
    type_name: string;
  };
  [key: string]: any;
}

// Distribution Status Helpers
export const DISTRIBUTION_STATUSES: {
  value: DistributionStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  {
    value: "verified_by_sender",
    label: "Verified by Sender",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "sent", label: "Sent", color: "bg-yellow-100 text-yellow-800" },
  {
    value: "received",
    label: "Received",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "verified_by_receiver",
    label: "Verified by Receiver",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
];

export const getStatusLabel = (status: DistributionStatus): string => {
  return DISTRIBUTION_STATUSES.find((s) => s.value === status)?.label || status;
};

export const getStatusColor = (status: DistributionStatus): string => {
  return (
    DISTRIBUTION_STATUSES.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800"
  );
};

// Distribution Status Flow
export const DISTRIBUTION_FLOW: {
  from: DistributionStatus;
  to: DistributionStatus;
  action: string;
}[] = [
  { from: "draft", to: "verified_by_sender", action: "verify_sender" },
  { from: "verified_by_sender", to: "sent", action: "send" },
  { from: "sent", to: "received", action: "receive" },
  { from: "received", to: "verified_by_receiver", action: "verify_receiver" },
  { from: "verified_by_receiver", to: "completed", action: "complete" },
];

export const getNextAction = (status: DistributionStatus): string | null => {
  const flow = DISTRIBUTION_FLOW.find((f) => f.from === status);
  return flow?.action || null;
};

export const canTransitionTo = (
  from: DistributionStatus,
  to: DistributionStatus
): boolean => {
  return DISTRIBUTION_FLOW.some((f) => f.from === from && f.to === to);
};
