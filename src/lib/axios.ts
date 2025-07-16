import axios from "axios";
import { getSession } from "next-auth/react";

// Use the environment variable or fallback to default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// Debug: Log the environment variable and final URL
console.log("🔍 Environment Debug:");
console.log("  NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
console.log("  Final BACKEND_URL:", BACKEND_URL);
console.log(
  "  All env vars:",
  Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC"))
);

// Create a custom axios instance with token-based authentication
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include Bearer token
api.interceptors.request.use(
  async (config) => {
    // Get the current session
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
