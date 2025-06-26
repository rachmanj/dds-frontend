"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";

interface PermissionContextType {
    permissions: string[];
    roles: string[];
    loading: boolean;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    const fetchUserPermissions = useCallback(async () => {
        // Don't fetch if not authenticated or still loading
        if (status === "loading") {
            console.log("Permission fetch: Session still loading");
            return;
        }

        if (status !== "authenticated" || !session?.accessToken) {
            console.log("Permission fetch: Not authenticated or no access token");
            setPermissions([]);
            setRoles([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Permission fetch: Starting API calls...");

            // Add timeout and retry mechanism
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => {
                timeoutController.abort();
            }, 5000); // 5 second timeout

            // Fetch user permissions and roles with timeout
            const [permissionsResponse, rolesResponse] = await Promise.all([
                api.get("/api/auth/user-permissions", {
                    signal: timeoutController.signal,
                    timeout: 5000
                }),
                api.get("/api/auth/user-roles", {
                    signal: timeoutController.signal,
                    timeout: 5000
                }),
            ]);

            clearTimeout(timeoutId);

            const fetchedPermissions = permissionsResponse.data.permissions || [];
            const fetchedRoles = rolesResponse.data.roles || [];

            setPermissions(fetchedPermissions);
            setRoles(fetchedRoles);
            setRetryCount(0); // Reset retry count on success
        } catch (error: any) {
            console.error("Error fetching user permissions:", error);

            // Handle different types of errors
            if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
                console.log("Permission fetch: Request aborted/timeout");

                // Retry logic - up to 3 attempts with exponential backoff
                if (retryCount < 3) {
                    const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                    console.log(`Permission fetch: Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);

                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchUserPermissions();
                    }, retryDelay);
                    return;
                }
            }

            setPermissions([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, [status, session?.accessToken, retryCount]);

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        return roles.includes(role);
    };

    const hasAnyPermission = (permissionList: string[]): boolean => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    const hasAllPermissions = (permissionList: string[]): boolean => {
        return permissionList.every(permission => permissions.includes(permission));
    };

    const hasAnyRole = (roleList: string[]): boolean => {
        return roleList.some(role => roles.includes(role));
    };

    const refreshPermissions = async () => {
        setRetryCount(0); // Reset retry count when manually refreshing
        await fetchUserPermissions();
    };

    useEffect(() => {
        // Add delay to ensure session is fully established
        if (status === "authenticated" && session?.accessToken) {
            const timer = setTimeout(() => {
                fetchUserPermissions();
            }, 1000); // 1 second delay after authentication

            return () => clearTimeout(timer);
        } else if (status !== "loading") {
            setLoading(false);
        }
    }, [status, session?.accessToken]);

    const value: PermissionContextType = {
        permissions,
        roles,
        loading,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole,
        refreshPermissions,
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionProvider");
    }
    return context;
} 