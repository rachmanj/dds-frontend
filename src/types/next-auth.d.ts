import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    department_id?: number;
    department?: {
      id: number;
      name: string;
      location_code: string;
    } | null;
    accessToken?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    department_id?: number;
    department?: {
      id: number;
      name: string;
      location_code: string;
    } | null;
    accessToken?: string;
  }
}
