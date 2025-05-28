import {
  FileCheck2,
  LayoutDashboard,
  Truck,
  LucideIcon,
  Building2,
  FileType,
  Receipt,
  FolderOpen,
  Users,
  UserCheck,
  ShieldCheck,
  Send,
  Package,
  Settings,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  title: string;
  // Permission-based access control
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean; // If true, requires ALL permissions/roles, otherwise ANY
}

export interface MenuGroup {
  GroupLabel: string;
  items: MenuItem[];
  // Group-level permissions (if specified, entire group is hidden if user lacks access)
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
}

export const MenuItems: MenuGroup[] = [
  {
    GroupLabel: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        title: "View main dashboard with overview and statistics",
      },
    ],
  },
  {
    GroupLabel: "Invoices",
    permission: "invoices.view", // Entire group requires this permission
    items: [
      {
        label: "Dashboard",
        href: "/invoice/dashboard",
        icon: LayoutDashboard,
        title: "View main dashboard with overview and statistics",
      },
      {
        label: "Invoices List",
        href: "/invoices",
        icon: FileCheck2,
        title: "Manage and view all invoices",
        permission: "invoices.list",
      },
    ],
  },
  {
    GroupLabel: "Additional Documents",
    permission: "documents.view",
    items: [
      {
        label: "Dashboard",
        href: "/additional-documents/dashboard",
        icon: LayoutDashboard,
        title: "View main dashboard with overview and statistics",
      },
      {
        label: "List",
        href: "/additional-documents",
        icon: FileCheck2,
        title: "Manage and view all additional documents",
        permission: "documents.list",
      },
    ],
  },
  {
    GroupLabel: "Distribution",
    permission: "distribution.view",
    items: [
      {
        label: "Dashboard",
        href: "/distributions/dashboard",
        icon: LayoutDashboard,
        title: "View distribution dashboard with overview and statistics",
        permission: "distribution.view",
      },
      {
        label: "Distributions",
        href: "/distributions",
        icon: Package,
        title: "Manage document distributions between departments",
        permission: "distribution.list",
      },
      {
        label: "Distribution Types",
        href: "/distribution-types",
        icon: Settings,
        title: "Manage distribution types and priorities",
        permission: "distribution.types.view",
      },
      {
        label: "Workflow",
        href: "/distributions/workflow",
        icon: Send,
        title: "Track distribution workflow and status",
        permission: "distribution.workflow",
      },
    ],
  },
  {
    GroupLabel: "Master",
    permissions: ["master.view", "admin.access"], // Requires ANY of these permissions
    items: [
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Building2,
        title: "Manage supplier information and contacts",
        permission: "suppliers.view",
      },
      {
        label: "Additional Documents Types",
        href: "/addoc-types",
        icon: FileType,
        title: "Configure additional document types and categories",
        permission: "document-types.view",
      },
      {
        label: "Invoices Types",
        href: "/invoice-types",
        icon: Receipt,
        title: "Configure invoice types and templates",
        permission: "invoice-types.view",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderOpen,
        title: "Manage projects and project settings",
        permission: "projects.view",
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Building2,
        title: "Manage departments and organizational structure",
        permission: "departments.view",
      },
    ],
  },
  {
    GroupLabel: "Admin",
    permissions: ["users.view", "users.list"], // Requires ANY of these permissions (users.view OR users.list)
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        title: "Manage user accounts and profiles",
        permission: "users.view",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: UserCheck,
        title: "Configure user roles and access levels",
        permission: "roles.view",
      },
      {
        label: "Permissions",
        href: "/permissions",
        icon: ShieldCheck,
        title: "Manage permissions and security settings",
        permission: "permissions.view",
      },
    ],
  },
];
