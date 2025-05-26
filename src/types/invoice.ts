export interface Invoice {
  id: number;
  invoice_number: string;
  faktur_no?: string;
  invoice_date: string;
  receive_date: string;
  supplier_id: number;
  supplier?: {
    id: number;
    name: string;
    sap_code?: string;
    type: "vendor" | "customer";
    city?: string;
    payment_project: string;
  };
  po_no?: string;
  receive_project?: string;
  invoice_project?: string;
  payment_project?: string;
  currency: string;
  amount: number;
  type_id: number;
  type?: {
    id: number;
    type_name: string;
  };
  payment_date?: string;
  remarks?: string;
  cur_loc?: string;
  status: string;
  creator?: {
    id: number;
    name: string;
  };
  additional_documents?: {
    id: number;
    document_number: string;
    document_date: string;
    type?: {
      id: number;
      type_name: string;
    };
  }[];
  duration1?: number;
  duration2?: number;
  sap_doc?: string;
  flag?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceFormData {
  invoice_number: string;
  faktur_no: string;
  invoice_date: string;
  receive_date: string;
  supplier_id: number;
  po_no: string;
  receive_project: string;
  invoice_project: string;
  payment_project: string;
  currency: string;
  amount: number | string;
  type_id: number;
  remarks: string;
  cur_loc: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface InvoiceResponse {
  data: Invoice[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface SingleInvoiceResponse {
  data: Invoice;
}
