import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Project, ProjectFormData } from "@/types/project";

export function useProjects() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      setError("You must be logged in to view projects");
      setLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/projects");
      setProjects(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to fetch projects");
        }
      } else {
        setError("Failed to fetch projects");
      }
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // Create project
  const createProject = async (formData: ProjectFormData): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to create projects");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.post("/api/projects", formData);
      const newProject = response.data.data || response.data;
      setProjects((prev) => [...prev, newProject]);
      return true;
    } catch (error: unknown) {
      console.error("Error creating project:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to create project");
        }
      } else {
        setError("Failed to create project");
      }
      return false;
    }
  };

  // Update project
  const updateProject = async (
    id: number,
    formData: ProjectFormData
  ): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to update projects");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      const response = await api.put(`/api/projects/${id}`, formData);
      const updatedProject = response.data.data || response.data;
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      return true;
    } catch (error: unknown) {
      console.error("Error updating project:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to update project");
        }
      } else {
        setError("Failed to update project");
      }
      return false;
    }
  };

  // Delete project
  const deleteProject = async (id: number): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("You must be logged in to delete projects");
      return false;
    }

    if (!session?.accessToken) {
      setError("No access token found. Please log in again.");
      return false;
    }

    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (error: unknown) {
      console.error("Error deleting project:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError(
            "Authentication required. Please refresh the page and try again."
          );
        } else {
          setError("Failed to delete project");
        }
      } else {
        setError("Failed to delete project");
      }
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Now fetchProjects is in dependencies

  return {
    projects,
    loading: loading || status === "loading",
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    sessionEstablished: status === "authenticated" && !!session?.accessToken,
  };
}
