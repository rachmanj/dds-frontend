"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ProtectedComponent } from "@/components/auth/ProtectedComponent";

interface ProtectedButtonProps extends React.ComponentProps<typeof Button> {
    permission?: string;
    permissions?: string[];
    role?: string;
    roles?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function ProtectedButton({
    permission,
    permissions,
    role,
    roles,
    requireAll = false,
    fallback = null,
    children,
    ...buttonProps
}: ProtectedButtonProps) {
    return (
        <ProtectedComponent
            permission={permission}
            permissions={permissions}
            role={role}
            roles={roles}
            requireAll={requireAll}
            fallback={fallback}
        >
            <Button {...buttonProps}>
                {children}
            </Button>
        </ProtectedComponent>
    );
}

// Convenience components for common button types
export function AdminButton({ children, ...props }: Omit<ProtectedButtonProps, 'roles'> & { children: React.ReactNode }) {
    return (
        <ProtectedButton roles={["admin", "super-admin"]} {...props}>
            {children}
        </ProtectedButton>
    );
}

export function CreateButton({
    permission,
    children,
    ...props
}: Omit<ProtectedButtonProps, 'permission'> & {
    permission: string;
    children: React.ReactNode;
}) {
    return (
        <ProtectedButton permission={permission} {...props}>
            {children}
        </ProtectedButton>
    );
}

export function EditButton({
    permission,
    children,
    ...props
}: Omit<ProtectedButtonProps, 'permission'> & {
    permission: string;
    children: React.ReactNode;
}) {
    return (
        <ProtectedButton permission={permission} variant="outline" {...props}>
            {children}
        </ProtectedButton>
    );
}

export function DeleteButton({
    permission,
    children,
    ...props
}: Omit<ProtectedButtonProps, 'permission'> & {
    permission: string;
    children: React.ReactNode;
}) {
    return (
        <ProtectedButton permission={permission} variant="destructive" {...props}>
            {children}
        </ProtectedButton>
    );
} 