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

    const fetchUserPermissions = useCallback(async () => {
        if (status !== "authenticated" || !session?.accessToken) {
            setPermissions([]);
            setRoles([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch user permissions and roles
            const [permissionsResponse, rolesResponse] = await Promise.all([
                api.get("/api/auth/user-permissions"),
                api.get("/api/auth/user-roles"),
            ]);

            const fetchedPermissions = permissionsResponse.data.permissions || [];
            const fetchedRoles = rolesResponse.data.roles || [];

            setPermissions(fetchedPermissions);
            setRoles(fetchedRoles);
        } catch (error) {
            console.error("Error fetching user permissions:", error);
            setPermissions([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, [status, session?.accessToken]);

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
        await fetchUserPermissions();
    };

    useEffect(() => {
        fetchUserPermissions();
    }, [fetchUserPermissions]);

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