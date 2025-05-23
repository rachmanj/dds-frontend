export interface Project {
  id: number;
  code: string;
  owner: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  code: string;
  owner: string;
  location: string;
}

export interface ProjectsResponse {
  data: Project[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
