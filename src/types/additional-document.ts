export interface AdditionalDocument {
  id: number;
  type_id: number;
  document_number: string;
  document_date: string;
  po_no?: string;
  project?: string;
  receive_date?: string;
  created_by: number;
  attachment?: string;
  remarks?: string;
  flag?: string;
  status?: string;
  cur_loc?: string;
  ito_creator?: string;
  grpo_no?: string;
  origin_wh?: string;
  destination_wh?: string;
  batch_no?: number;
  created_at?: string;
  updated_at?: string;
  type?: {
    id: number;
    type_name: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdditionalDocumentFormData {
  type_id: number;
  document_number: string;
  document_date: string;
  po_no?: string;
  receive_date?: string;
  remarks?: string;
  cur_loc?: string;
}

export interface AdditionalDocumentsResponse {
  data: AdditionalDocument[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
