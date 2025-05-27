export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  email_verified_at?: string;
  nik: string;
  project?: string;
  department_id?: number;
  department?: {
    id: number;
    name: string;
    location_code?: string;
  };
  roles?: Role[];
  role_names?: string[];
  permissions?: Permission[];
  permission_names?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
  permission_names?: string[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  roles?: {
    id: number;
    name: string;
  }[];
  role_names?: string[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  username: string;
  email: string;
  nik: string;
  password?: string;
  project?: string;
  department_id?: number;
  roles?: number[];
}

export interface RoleFormData {
  name: string;
  guard_name?: string;
  permissions?: number[];
}

export interface PermissionFormData {
  name: string;
  guard_name?: string;
}

export interface UsersResponse {
  data: User[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface RolesResponse {
  data: Role[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface PermissionsResponse {
  data: Permission[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
