"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Shield, Key } from "lucide-react";

// Import permission components and hooks
import { usePermissions } from "@/contexts/PermissionContext";
import {
    ProtectedComponent,
    PermissionGuard,
    AdminGuard
} from "@/components/auth/ProtectedComponent";
import {
    ProtectedButton,
    AdminButton,
    CreateButton,
    EditButton,
    DeleteButton
} from "@/components/ui/protected-button";
import { useFilteredMenuItems } from "@/components/layout/ProtectedMenu";

export function PermissionExamples() {
    const {
        permissions,
        roles,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole
    } = usePermissions();

    const filteredMenuItems = useFilteredMenuItems();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Permission System Examples</h1>
                <p className="text-muted-foreground">
                    Comprehensive examples of role-based access control implementation
                </p>
            </div>

            {/* Current User Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Current User Permissions
                    </CardTitle>
                    <CardDescription>
                        Your current roles and permissions in the system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Roles:</h4>
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                                <Badge key={role} variant="secondary">
                                    <Users className="h-3 w-3 mr-1" />
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Permissions:</h4>
                        <div className="flex flex-wrap gap-1">
                            {permissions.slice(0, 10).map(permission => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                    <Key className="h-3 w-3 mr-1" />
                                    {permission}
                                </Badge>
                            ))}
                            {permissions.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                    +{permissions.length - 10} more
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Permission Checks */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Basic Permission Checks</CardTitle>
                    <CardDescription>
                        Using hooks to check permissions programmatically
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Permission Checks:</h4>
                            <ul className="space-y-1 text-sm">
                                <li>Can view users: {hasPermission('users.view') ? '✅' : '❌'}</li>
                                <li>Can create users: {hasPermission('users.create') ? '✅' : '❌'}</li>
                                <li>Can delete users: {hasPermission('users.delete') ? '✅' : '❌'}</li>
                                <li>Can view roles: {hasPermission('roles.view') ? '✅' : '❌'}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Role Checks:</h4>
                            <ul className="space-y-1 text-sm">
                                <li>Is Admin: {hasRole('admin') ? '✅' : '❌'}</li>
                                <li>Is Super Admin: {hasRole('super-admin') ? '✅' : '❌'}</li>
                                <li>Is Manager: {hasRole('manager') ? '✅' : '❌'}</li>
                                <li>Is User: {hasRole('user') ? '✅' : '❌'}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Protected Components */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Protected Components</CardTitle>
                    <CardDescription>
                        Components that show/hide based on permissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Single Permission Check:</h4>
                        <PermissionGuard
                            permission="users.create"
                            fallback={<p className="text-muted-foreground">You don&apos;t have permission to create users</p>}
                        >
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                ✅ You can create users!
                            </div>
                        </PermissionGuard>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">Role-based Access:</h4>
                        <AdminGuard
                            fallback={<p className="text-muted-foreground">Admin access required</p>}
                        >
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                🔐 Admin-only content visible!
                            </div>
                        </AdminGuard>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">Multiple Permissions (ANY):</h4>
                        <ProtectedComponent
                            permissions={['users.view', 'roles.view']}
                            requireAll={false}
                            fallback={<p className="text-muted-foreground">Need users.view OR roles.view permission</p>}
                        >
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                👀 You can view users or roles!
                            </div>
                        </ProtectedComponent>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">Multiple Permissions (ALL):</h4>
                        <ProtectedComponent
                            permissions={['users.view', 'users.edit', 'users.delete']}
                            requireAll={true}
                            fallback={<p className="text-muted-foreground">Need ALL user management permissions</p>}
                        >
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                🛠️ You have full user management access!
                            </div>
                        </ProtectedComponent>
                    </div>
                </CardContent>
            </Card>

            {/* Protected Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>3. Protected Buttons</CardTitle>
                    <CardDescription>
                        Action buttons that appear based on permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <CreateButton permission="users.create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create User
                        </CreateButton>

                        <EditButton permission="users.edit">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                        </EditButton>

                        <DeleteButton permission="users.delete">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                        </DeleteButton>

                        <AdminButton>
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Action
                        </AdminButton>

                        <ProtectedButton
                            permissions={['roles.view', 'permissions.view']}
                            variant="outline"
                        >
                            <Key className="h-4 w-4 mr-2" />
                            Security Settings
                        </ProtectedButton>
                    </div>
                </CardContent>
            </Card>

            {/* Filtered Menu Items */}
            <Card>
                <CardHeader>
                    <CardTitle>4. Filtered Menu Items</CardTitle>
                    <CardDescription>
                        Menu items filtered based on your permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredMenuItems.map((group, index) => (
                            <div key={index}>
                                <h4 className="font-medium mb-2">{group.GroupLabel}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {group.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center gap-2 p-2 border rounded">
                                            <item.icon className="h-4 w-4" />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Permission Checks */}
            <Card>
                <CardHeader>
                    <CardTitle>5. Advanced Permission Checks</CardTitle>
                    <CardDescription>
                        Complex permission logic examples
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Complex Checks:</h4>
                            <ul className="space-y-1 text-sm">
                                <li>
                                    Has ANY admin permission: {
                                        hasAnyPermission(['users.create', 'roles.create', 'permissions.create']) ? '✅' : '❌'
                                    }
                                </li>
                                <li>
                                    Has ALL user permissions: {
                                        hasAllPermissions(['users.view', 'users.create', 'users.edit']) ? '✅' : '❌'
                                    }
                                </li>
                                <li>
                                    Is admin or manager: {
                                        hasAnyRole(['admin', 'manager']) ? '✅' : '❌'
                                    }
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Conditional Rendering:</h4>
                            <div className="space-y-2">
                                {hasPermission('users.view') && (
                                    <Button variant="outline" size="sm">
                                        View Users
                                    </Button>
                                )}
                                {hasRole('admin') && (
                                    <Button variant="outline" size="sm">
                                        Admin Panel
                                    </Button>
                                )}
                                {hasAnyPermission(['invoices.create', 'documents.create']) && (
                                    <Button variant="outline" size="sm">
                                        Create Content
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>6. How to Use in Your Components</CardTitle>
                    <CardDescription>
                        Code examples for implementing permission-based access control
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">1. Using Permission Hooks:</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`import { usePermissions } from '@/contexts/PermissionContext';

function MyComponent() {
  const { hasPermission, hasRole } = usePermissions();
  
  if (hasPermission('users.create')) {
    // Show create button
  }
  
  if (hasRole('admin')) {
    // Show admin features
  }
}`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">2. Using Protected Components:</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`import { PermissionGuard } from '@/components/auth/ProtectedComponent';

<PermissionGuard 
  permission="users.create"
  fallback={<div>No permission</div>}
>
  <CreateUserButton />
</PermissionGuard>`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">3. Using Protected Buttons:</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`import { CreateButton } from '@/components/ui/protected-button';

<CreateButton permission="users.create">
  Create New User
</CreateButton>`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 