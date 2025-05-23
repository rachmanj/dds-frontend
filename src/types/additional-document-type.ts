export interface AdditionalDocumentType {
  id: number;
  type_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdditionalDocumentTypeFormData {
  type_name: string;
}

export interface AdditionalDocumentTypesResponse {
  data: AdditionalDocumentType[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
