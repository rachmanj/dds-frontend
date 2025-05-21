import axios from "axios";

// Get backend URL from environment variable or use default
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Create a custom axios instance with proper CORS handling
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Important for sending cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(`API Response: ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error("API Error:", error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;
