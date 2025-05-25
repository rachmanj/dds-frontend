import {
  Files,
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
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  title: string;
}

export interface MenuGroup {
  GroupLabel: string;
  items: MenuItem[];
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
    GroupLabel: "Documents",
    items: [
      {
        label: "Invoices",
        href: "/invoices",
        icon: FileCheck2,
        title: "Manage and view all invoices",
      },
      {
        label: "Additional Documents",
        href: "/additional-documents",
        icon: Files,
        title: "Manage additional documents and files",
      },
    ],
  },
  {
    GroupLabel: "Distribution",
    items: [
      {
        label: "Distribution",
        href: "/distribution",
        icon: Truck,
        title: "Manage distribution and delivery processes",
      },
    ],
  },
  {
    GroupLabel: "Master",
    items: [
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Building2,
        title: "Manage supplier information and contacts",
      },
      {
        label: "Additional Documents Types",
        href: "/addoc-types",
        icon: FileType,
        title: "Configure additional document types and categories",
      },
      {
        label: "Invoices Types",
        href: "/invoice-types",
        icon: Receipt,
        title: "Configure invoice types and templates",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderOpen,
        title: "Manage projects and project settings",
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Building2,
        title: "Manage departments and organizational structure",
      },
    ],
  },
  {
    GroupLabel: "Admin",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        title: "Manage user accounts and profiles",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: UserCheck,
        title: "Configure user roles and access levels",
      },
      {
        label: "Permissions",
        href: "/permissions",
        icon: ShieldCheck,
        title: "Manage permissions and security settings",
      },
    ],
  },
];
