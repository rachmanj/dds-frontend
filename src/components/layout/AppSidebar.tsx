import React from 'react'
import { Files, FileCheck2, LayoutDashboard, SettingsIcon, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
} from '@/components/ui/sidebar'

const MenuItems = [
    {
        GroupLabel: "Dashboard",
        items: [
            {
                label: "Dashboard",
                href: "/dashboard",
                icon: <LayoutDashboard />,
            }
        ]
    },
    {
        GroupLabel: "Documents",
        items: [
            {
                label: "Invoices",
                href: "/documents/invoices",
                icon: <FileCheck2 />,
            },
            {
                label: "Additional Documents",
                href: "/documents/additional",
                icon: <Files />,
            }
        ]
    },
    {
        GroupLabel: "Distribution",
        items: [
            {
                label: "Distribution",
                href: "/distribution",
                icon: <Truck />,
            }
        ]
    },
    {
        GroupLabel: "Settings",
        items: [
            {
                label: "Settings",
                href: "/settings",
                icon: <SettingsIcon />,
            }
        ]
    }
]

const AppSidebar = () => {
    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton asChild>
                        <Link href="/dashboard">
                            <Image src="/dds-logo.png" alt="DDS" width={30} height={30} />
                            <span>DD System</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                {MenuItems.map((group) => (
                    <SidebarGroup key={group.GroupLabel}>
                        <SidebarGroupLabel>{group.GroupLabel}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.href}>
                                                {item.icon} <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar