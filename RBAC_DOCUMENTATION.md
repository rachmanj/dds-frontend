# Role-Based Access Control (RBAC) Documentation

## Overview

This document provides comprehensive guidance on implementing role-based access control in the Document Distribution System (DDS). The RBAC system allows you to control access to menu items, action buttons, and components based on user roles and permissions.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Permission Structure](#permission-structure)
3. [Available Roles](#available-roles)
4. [Protecting Menu Items](#protecting-menu-items)
5. [Protecting Action Buttons](#protecting-action-buttons)
6. [Protected Components](#protected-components)
7. [Permission Hooks](#permission-hooks)
8. [Advanced Usage](#advanced-usage)
9. [Examples](#examples)

## System Architecture

The RBAC system consists of several key components:

- **PermissionContext**: Provides permission state and checking functions
- **ProtectedMenu**: Filters menu items based on permissions
- **ProtectedComponent**: Wrapper for conditional rendering
- **Protected Buttons**: Pre-built buttons with permission checks
- **Permission Hooks**: React hooks for permission checking

## Permission Structure

### Permission Naming Convention

Permissions follow the format: `{module}.{action}`

Examples:

- `users.view` - View users
- `users.create` - Create users
- `users.edit` - Edit users
- `users.delete` - Delete users
- `admin.access` - Access admin features

### Available Permissions

#### User Management

- `users.view` - View user list
- `users.list` - List users (API)
- `users.create` - Create new users
- `users.edit` - Edit existing users
- `users.delete` - Delete users

#### Role Management

- `roles.view` - View roles
- `roles.list` - List roles (API)
- `roles.create` - Create new roles
- `roles.edit` - Edit existing roles
- `roles.delete` - Delete roles

#### Permission Management

- `permissions.view` - View permissions
- `permissions.list` - List permissions (API)
- `permissions.create` - Create new permissions
- `permissions.edit` - Edit existing permissions
- `permissions.delete` - Delete permissions

#### Invoice Management

- `invoices.view` - View invoices
- `invoices.list` - List invoices (API)
- `invoices.create` - Create new invoices
- `invoices.edit` - Edit existing invoices
- `invoices.delete` - Delete invoices

#### Document Management

- `documents.view` - View documents
- `documents.list` - List documents (API)
- `documents.create` - Create new documents
- `documents.edit` - Edit existing documents
- `documents.delete` - Delete documents

#### Distribution Management

- `distribution.view` - View distribution
- `distribution.manage` - Manage distribution

#### Master Data

- `master.view` - View master data
- `suppliers.view` - View suppliers
- `suppliers.manage` - Manage suppliers
- `projects.view` - View projects
- `projects.manage` - Manage projects
- `departments.view` - View departments
- `departments.manage` - Manage departments

#### Admin Access

- `admin.access` - Access admin features

## Available Roles

### Super Admin

- **Description**: Full system access
- **Permissions**: All permissions in the system

### Admin

- **Description**: Administrative access to most features
- **Permissions**: User, role, permission, invoice, and document management

### Manager

- **Description**: Management level access
- **Permissions**: View and manage specific modules, limited admin access

### User

- **Description**: Basic user access
- **Permissions**: View-only access to basic features

### Logistic

- **Description**: Logistics and distribution focused
- **Permissions**: Distribution and supplier management

## Protecting Menu Items

### 1. Menu Configuration

Menu items are configured in `frontend/src/lib/MenuItems.ts`:

```typescript
export const MenuItems: MenuGroup[] = [
  {
    GroupLabel: "Admin",
    permissions: ["users.view", "users.list"], // Group-level permissions
    items: [
      {
        href: "/users",
        icon: Users,
        label: "Users",
        title: "Manage Users",
        permission: "users.view", // Item-level permission
      },
    ],
  },
];
```

### 2. Permission Types

#### Single Permission

```typescript
{
  href: "/users",
  icon: Users,
  label: "Users",
  permission: "users.view" // Single permission required
}
```

#### Multiple Permissions (ANY)

```typescript
{
  href: "/dashboard",
  icon: Dashboard,
  label: "Dashboard",
  permissions: ["users.view", "invoices.view"], // User needs ANY of these
  requireAll: false
}
```

#### Multiple Permissions (ALL)

```typescript
{
  href: "/admin",
  icon: Shield,
  label: "Admin Panel",
  permissions: ["admin.access", "users.manage"], // User needs ALL of these
  requireAll: true
}
```

#### Role-Based Access

```typescript
{
  href: "/super-admin",
  icon: Crown,
  label: "Super Admin",
  role: "super-admin" // Single role required
}
```

#### Multiple Roles

```typescript
{
  href: "/management",
  icon: Management,
  label: "Management",
  roles: ["admin", "manager"], // User needs ANY of these roles
  requireAll: false
}
```

### 3. Group-Level Permissions

You can also set permissions at the group level:

```typescript
{
  GroupLabel: "Admin",
  permissions: ["admin.access"], // Entire group requires this permission
  items: [
    // All items in this group will inherit the group permission requirement
  ]
}
```

## Protecting Action Buttons

### 1. Pre-built Protected Buttons

#### Create Button

```tsx
import { CreateButton } from "@/components/ui/protected-button";

<CreateButton permission="users.create">
  <Plus className="h-4 w-4 mr-2" />
  Create User
</CreateButton>;
```

#### Edit Button

```tsx
import { EditButton } from "@/components/ui/protected-button";

<EditButton permission="users.edit">
  <Edit className="h-4 w-4 mr-2" />
  Edit User
</EditButton>;
```

#### Delete Button

```tsx
import { DeleteButton } from "@/components/ui/protected-button";

<DeleteButton permission="users.delete">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete User
</DeleteButton>;
```

#### Admin Button

```tsx
import { AdminButton } from "@/components/ui/protected-button";

<AdminButton>
  <Shield className="h-4 w-4 mr-2" />
  Admin Action
</AdminButton>;
```

### 2. Custom Protected Button

```tsx
import { ProtectedButton } from "@/components/ui/protected-button";

<ProtectedButton
  permissions={["roles.view", "permissions.view"]}
  variant="outline"
  requireAll={false} // User needs ANY of the permissions
>
  <Key className="h-4 w-4 mr-2" />
  Security Settings
</ProtectedButton>;
```

### 3. Button with Role Check

```tsx
<ProtectedButton roles={["admin", "manager"]} variant="default">
  Management Action
</ProtectedButton>
```

## Protected Components

### 1. Permission Guard

```tsx
import { PermissionGuard } from "@/components/auth/ProtectedComponent";

<PermissionGuard
  permission="users.create"
  fallback={<div>You don't have permission to create users</div>}
>
  <CreateUserForm />
</PermissionGuard>;
```

### 2. Role Guard

```tsx
import { RoleGuard } from "@/components/auth/ProtectedComponent";

<RoleGuard role="admin" fallback={<div>Admin access required</div>}>
  <AdminPanel />
</RoleGuard>;
```

### 3. Admin Guard

```tsx
import { AdminGuard } from "@/components/auth/ProtectedComponent";

<AdminGuard fallback={<div>Admin access required</div>}>
  <AdminOnlyContent />
</AdminGuard>;
```

### 4. Generic Protected Component

```tsx
import { ProtectedComponent } from "@/components/auth/ProtectedComponent";

<ProtectedComponent
  permissions={["users.view", "users.edit"]}
  requireAll={true}
  fallback={<div>Insufficient permissions</div>}
>
  <UserManagementPanel />
</ProtectedComponent>;
```

## Permission Hooks

### 1. Basic Usage

```tsx
import { usePermissions } from "@/contexts/PermissionContext";

function MyComponent() {
  const {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    loading,
  } = usePermissions();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {hasPermission("users.create") && <button>Create User</button>}

      {hasRole("admin") && <div>Admin Panel</div>}
    </div>
  );
}
```

### 2. Complex Permission Checks

```tsx
// Check if user has ANY of the specified permissions
const canManageUsers = hasAnyPermission([
  "users.create",
  "users.edit",
  "users.delete",
]);

// Check if user has ALL of the specified permissions
const hasFullAccess = hasAllPermissions([
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
]);

// Check if user has ANY of the specified roles
const isManager = hasAnyRole(["admin", "manager"]);
```

### 3. Conditional Rendering

```tsx
return (
  <div>
    {hasPermission("users.view") && <UserList />}

    {hasRole("admin") && <AdminTools />}

    {hasAnyPermission(["invoices.create", "documents.create"]) && (
      <CreateContentButton />
    )}
  </div>
);
```

## Advanced Usage

### 1. Custom Permission Logic

```tsx
function CustomComponent() {
  const { hasPermission, hasRole } = usePermissions();

  // Complex permission logic
  const canAccessFeature =
    hasRole("admin") ||
    (hasPermission("users.view") && hasPermission("invoices.view"));

  if (!canAccessFeature) {
    return <div>Access Denied</div>;
  }

  return <div>Feature Content</div>;
}
```

### 2. Dynamic Permission Checking

```tsx
function DynamicPermissionComponent({
  requiredPermission,
}: {
  requiredPermission: string;
}) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(requiredPermission)) {
    return <div>Permission {requiredPermission} required</div>;
  }

  return <div>Content</div>;
}
```

### 3. Permission-Based Navigation

```tsx
function NavigationMenu() {
  const filteredMenuItems = useFilteredMenuItems();

  return (
    <nav>
      {filteredMenuItems.map((group) => (
        <div key={group.GroupLabel}>
          <h3>{group.GroupLabel}</h3>
          {group.items.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

## Examples

### Example 1: User Management Page

```tsx
"use client";

import { usePermissions } from "@/contexts/PermissionContext";
import {
  CreateButton,
  EditButton,
  DeleteButton,
} from "@/components/ui/protected-button";
import { PermissionGuard } from "@/components/auth/ProtectedComponent";

export default function UsersPage() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Users</h1>
        <CreateButton permission="users.create">Create User</CreateButton>
      </div>

      <PermissionGuard
        permission="users.view"
        fallback={<div>You don't have permission to view users</div>}
      >
        <UserTable />
      </PermissionGuard>

      {/* Action buttons for each user */}
      <div className="flex gap-2">
        <EditButton permission="users.edit">Edit</EditButton>
        <DeleteButton permission="users.delete">Delete</DeleteButton>
      </div>
    </div>
  );
}
```

### Example 2: Dashboard with Role-Based Content

```tsx
"use client";

import { usePermissions } from "@/contexts/PermissionContext";
import {
  AdminGuard,
  ProtectedComponent,
} from "@/components/auth/ProtectedComponent";

export default function Dashboard() {
  const { hasRole, hasAnyPermission } = usePermissions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Always visible */}
      <DashboardCard title="Welcome" />

      {/* Admin only */}
      <AdminGuard>
        <DashboardCard title="Admin Statistics" />
      </AdminGuard>

      {/* Multiple permissions (ANY) */}
      <ProtectedComponent
        permissions={["users.view", "invoices.view"]}
        requireAll={false}
      >
        <DashboardCard title="Management Overview" />
      </ProtectedComponent>

      {/* Role-based content */}
      {hasRole("manager") && <DashboardCard title="Manager Tools" />}

      {/* Complex permission check */}
      {hasAnyPermission(["distribution.view", "suppliers.view"]) && (
        <DashboardCard title="Logistics" />
      )}
    </div>
  );
}
```

### Example 3: Menu Configuration

```typescript
// frontend/src/lib/MenuItems.ts
import { Users, Shield, FileText, Truck, Settings } from "lucide-react";

export const MenuItems: MenuGroup[] = [
  {
    GroupLabel: "Admin",
    permissions: ["users.view", "users.list"], // Group requires ANY of these
    items: [
      {
        href: "/users",
        icon: Users,
        label: "Users",
        title: "Manage Users",
        permission: "users.view",
      },
      {
        href: "/roles",
        icon: Shield,
        label: "Roles",
        title: "Manage Roles",
        permission: "roles.view",
      },
    ],
  },
  {
    GroupLabel: "Documents",
    permissions: ["invoices.view", "documents.view"],
    requireAll: false, // User needs ANY of these permissions
    items: [
      {
        href: "/invoices",
        icon: FileText,
        label: "Invoices",
        title: "Manage Invoices",
        permission: "invoices.view",
      },
    ],
  },
  {
    GroupLabel: "Distribution",
    permission: "distribution.view", // Single permission for entire group
    items: [
      {
        href: "/distribution",
        icon: Truck,
        label: "Distribution",
        title: "Manage Distribution",
        // No item-level permission needed since group has permission
      },
    ],
  },
  {
    GroupLabel: "Master",
    permissions: ["master.view", "admin.access"],
    items: [
      {
        href: "/suppliers",
        icon: Settings,
        label: "Suppliers",
        title: "Manage Suppliers",
        permission: "suppliers.view",
      },
    ],
  },
];
```

## Best Practices

1. **Principle of Least Privilege**: Grant users only the minimum permissions needed
2. **Consistent Naming**: Use consistent permission naming conventions
3. **Granular Permissions**: Create specific permissions for different actions
4. **Fallback Content**: Always provide meaningful fallback content for unauthorized users
5. **Loading States**: Handle loading states when checking permissions
6. **Error Handling**: Implement proper error handling for permission checks
7. **Testing**: Test permission logic thoroughly with different user roles

## Troubleshooting

### Common Issues

1. **Menu items not filtering**: Ensure `useFilteredMenuItems` is used instead of raw `MenuItems`
2. **Permissions not loading**: Check if `PermissionProvider` is properly wrapped around your app
3. **Server-side rendering errors**: Ensure components using permission hooks have `"use client"` directive
4. **Permission checks failing**: Verify that the backend is returning permissions correctly

### Debug Tips

1. Use the Permission Examples page (`/examples/permissions`) to test permission logic
2. Check browser console for permission-related errors
3. Verify API responses for user permissions and roles
4. Test with different user accounts having different roles

## API Integration

The RBAC system integrates with the Laravel backend using Spatie Laravel Permission package:

- **User Permissions**: `GET /api/auth/user-permissions`
- **User Roles**: `GET /api/auth/user-roles`
- **Permission Middleware**: Routes protected with `permission:permission.name` middleware

For more details on backend implementation, refer to the Laravel documentation and Spatie Laravel Permission package documentation.
