export interface Department {
  id: number;
  name: string;
  project: string;
  location_code: string;
  transit_code: string | null;
  akronim: string;
  sap_code: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentFormData {
  name: string;
  project: string;
  location_code: string;
  transit_code: string;
  akronim: string;
  sap_code: string;
}

export interface DepartmentsResponse {
  data: Department[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
