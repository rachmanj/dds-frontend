import {
  Files,
  FileCheck2,
  LayoutDashboard,
  SettingsIcon,
  Truck,
  LucideIcon,
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
        href: "/documents/invoices",
        icon: FileCheck2,
        title: "Manage and view all invoices",
      },
      {
        label: "Additional Documents",
        href: "/documents/additional",
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
        icon: SettingsIcon,
        title: "Manage supplier information and contacts",
      },
      {
        label: "Additional Documents Types",
        href: "/addoc-types",
        icon: SettingsIcon,
        title: "Configure additional document types and categories",
      },
      {
        label: "Invoices Types",
        href: "/inv-types",
        icon: SettingsIcon,
        title: "Configure invoice types and templates",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: SettingsIcon,
        title: "Manage projects and project settings",
      },
      {
        label: "Departments",
        href: "/departments",
        icon: SettingsIcon,
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
        icon: SettingsIcon,
        title: "Manage user accounts and profiles",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: SettingsIcon,
        title: "Configure user roles and access levels",
      },
      {
        label: "Permissions",
        href: "/permissions",
        icon: SettingsIcon,
        title: "Manage permissions and security settings",
      },
    ],
  },
];
