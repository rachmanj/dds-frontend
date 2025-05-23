export interface InvoiceType {
  id: number;
  type_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceTypeFormData {
  type_name: string;
}

export interface InvoiceTypesResponse {
  data: InvoiceType[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
