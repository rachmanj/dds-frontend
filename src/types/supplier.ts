export interface Supplier {
  id: number;
  sap_code?: string;
  name: string;
  type: "vendor" | "customer";
  city?: string;
  payment_project: string;
  is_active: boolean;
  address?: string;
  npwp?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierFormData {
  sap_code: string;
  name: string;
  type: "vendor" | "customer";
  city: string;
  payment_project: string;
  is_active: boolean;
  address: string;
  npwp: string;
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

export interface SupplierResponse {
  data: Supplier[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface SingleSupplierResponse {
  data: Supplier;
}
