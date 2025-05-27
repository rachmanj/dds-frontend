"use client";

import React from "react";
import { usePermissions } from "@/contexts/PermissionContext";

interface ProtectedComponentProps {
    children: React.ReactNode;
    permission?: string;
    permissions?: string[];
    role?: string;
    roles?: string[];
    requireAll?: boolean; // If true, requires ALL permissions/roles, otherwise ANY
    fallback?: React.ReactNode;
    loading?: React.ReactNode;
}

export function ProtectedComponent({
    children,
    permission,
    permissions,
    role,
    roles,
    requireAll = false,
    fallback = null,
    loading = null,
}: ProtectedComponentProps) {
    const {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole,
        loading: permissionsLoading,
    } = usePermissions();

    // Show loading state if permissions are still being fetched
    if (permissionsLoading) {
        return <>{loading}</>;
    }

    let hasAccess = true;

    // Check single permission
    if (permission) {
        hasAccess = hasAccess && hasPermission(permission);
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        if (requireAll) {
            hasAccess = hasAccess && hasAllPermissions(permissions);
        } else {
            hasAccess = hasAccess && hasAnyPermission(permissions);
        }
    }

    // Check single role
    if (role) {
        hasAccess = hasAccess && hasRole(role);
    }

    // Check multiple roles
    if (roles && roles.length > 0) {
        if (requireAll) {
            hasAccess = hasAccess && roles.every(r => hasRole(r));
        } else {
            hasAccess = hasAccess && hasAnyRole(roles);
        }
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common use cases
export function PermissionGuard({
    permission,
    children,
    fallback = null,
}: {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <ProtectedComponent permission={permission} fallback={fallback}>
            {children}
        </ProtectedComponent>
    );
}

export function RoleGuard({
    role,
    children,
    fallback = null,
}: {
    role: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <ProtectedComponent role={role} fallback={fallback}>
            {children}
        </ProtectedComponent>
    );
}

export function AdminGuard({
    children,
    fallback = null,
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <ProtectedComponent roles={["admin", "super-admin"]} fallback={fallback}>
            {children}
        </ProtectedComponent>
    );
} 