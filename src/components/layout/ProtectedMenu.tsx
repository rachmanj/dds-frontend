"use client";

import React from "react";
import { usePermissions } from "@/contexts/PermissionContext";
import { MenuItems, MenuGroup, MenuItem } from "./MenuItems";

interface ProtectedMenuProps {
    children: (filteredMenuItems: MenuGroup[]) => React.ReactNode;
}

export function ProtectedMenu({ children }: ProtectedMenuProps) {
    const {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole,
        loading,
    } = usePermissions();

    // Function to check if user has access to a menu item
    const hasMenuItemAccess = (item: MenuItem): boolean => {
        let hasAccess = true;

        // Check single permission
        if (item.permission) {
            hasAccess = hasAccess && hasPermission(item.permission);
        }

        // Check multiple permissions
        if (item.permissions && item.permissions.length > 0) {
            if (item.requireAll) {
                hasAccess = hasAccess && hasAllPermissions(item.permissions);
            } else {
                hasAccess = hasAccess && hasAnyPermission(item.permissions);
            }
        }

        // Check single role
        if (item.role) {
            hasAccess = hasAccess && hasRole(item.role);
        }

        // Check multiple roles
        if (item.roles && item.roles.length > 0) {
            if (item.requireAll) {
                hasAccess = hasAccess && item.roles.every(role => hasRole(role));
            } else {
                hasAccess = hasAccess && hasAnyRole(item.roles);
            }
        }

        return hasAccess;
    };

    // Function to check if user has access to a menu group
    const hasMenuGroupAccess = (group: MenuGroup): boolean => {
        let hasAccess = true;

        // Check single permission
        if (group.permission) {
            hasAccess = hasAccess && hasPermission(group.permission);
        }

        // Check multiple permissions
        if (group.permissions && group.permissions.length > 0) {
            if (group.requireAll) {
                hasAccess = hasAccess && hasAllPermissions(group.permissions);
            } else {
                hasAccess = hasAccess && hasAnyPermission(group.permissions);
            }
        }

        // Check single role
        if (group.role) {
            hasAccess = hasAccess && hasRole(group.role);
        }

        // Check multiple roles
        if (group.roles && group.roles.length > 0) {
            if (group.requireAll) {
                hasAccess = hasAccess && group.roles.every(role => hasRole(role));
            } else {
                hasAccess = hasAccess && hasAnyRole(group.roles);
            }
        }

        return hasAccess;
    };

    // Filter menu items based on permissions
    const getFilteredMenuItems = (): MenuGroup[] => {
        if (loading) {
            return []; // Return empty array while loading
        }

        return MenuItems.map(group => {
            // Check if user has access to the group
            if (!hasMenuGroupAccess(group)) {
                return null;
            }

            // Filter items within the group
            const filteredItems = group.items.filter(item => hasMenuItemAccess(item));

            // If no items are accessible, don't show the group
            if (filteredItems.length === 0) {
                return null;
            }

            return {
                ...group,
                items: filteredItems,
            };
        }).filter((group): group is MenuGroup => group !== null);
    };

    const filteredMenuItems = getFilteredMenuItems();

    return <>{children(filteredMenuItems)}</>;
}

// Hook for getting filtered menu items
export function useFilteredMenuItems(): MenuGroup[] {
    const {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole,
        loading,
    } = usePermissions();

    if (loading) {
        return [];
    }

    const hasMenuItemAccess = (item: MenuItem): boolean => {
        let hasAccess = true;

        if (item.permission) {
            hasAccess = hasAccess && hasPermission(item.permission);
        }

        if (item.permissions && item.permissions.length > 0) {
            if (item.requireAll) {
                hasAccess = hasAccess && hasAllPermissions(item.permissions);
            } else {
                hasAccess = hasAccess && hasAnyPermission(item.permissions);
            }
        }

        if (item.role) {
            hasAccess = hasAccess && hasRole(item.role);
        }

        if (item.roles && item.roles.length > 0) {
            if (item.requireAll) {
                hasAccess = hasAccess && item.roles.every(role => hasRole(role));
            } else {
                hasAccess = hasAccess && hasAnyRole(item.roles);
            }
        }

        return hasAccess;
    };

    const hasMenuGroupAccess = (group: MenuGroup): boolean => {
        let hasAccess = true;

        if (group.permission) {
            hasAccess = hasAccess && hasPermission(group.permission);
        }

        if (group.permissions && group.permissions.length > 0) {
            if (group.requireAll) {
                hasAccess = hasAccess && hasAllPermissions(group.permissions);
            } else {
                hasAccess = hasAccess && hasAnyPermission(group.permissions);
            }
        }

        if (group.role) {
            hasAccess = hasAccess && hasRole(group.role);
        }

        if (group.roles && group.roles.length > 0) {
            if (group.requireAll) {
                hasAccess = hasAccess && group.roles.every(role => hasRole(role));
            } else {
                hasAccess = hasAccess && hasAnyRole(group.roles);
            }
        }

        return hasAccess;
    };

    return MenuItems.map(group => {
        if (!hasMenuGroupAccess(group)) {
            return null;
        }

        const filteredItems = group.items.filter(item => hasMenuItemAccess(item));

        if (filteredItems.length === 0) {
            return null;
        }

        return {
            ...group,
            items: filteredItems,
        };
    }).filter(Boolean) as MenuGroup[];
} 