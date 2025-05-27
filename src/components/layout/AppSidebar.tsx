"use client";

import React from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useFilteredMenuItems } from './ProtectedMenu'

const AppSidebar = () => {
    const filteredMenuItems = useFilteredMenuItems();

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton asChild>
                        <Link href="/dashboard">Document Distributio System</Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                {filteredMenuItems.map((group) => (
                    <SidebarGroup key={group.GroupLabel}>
                        <SidebarMenu>
                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="w-full justify-between group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200">
                                            <span>{group.GroupLabel}</span>
                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 overflow-hidden">
                                        <SidebarMenuSub className="animate-in slide-in-from-top-1 duration-200">
                                            {group.items.map((item, index) => (
                                                <SidebarMenuSubItem
                                                    key={item.label}
                                                    className="animate-in slide-in-from-left-2 fade-in-0"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                        animationDuration: '200ms',
                                                        animationFillMode: 'both'
                                                    }}
                                                >
                                                    <SidebarMenuSubButton asChild className="transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                                        <Link href={item.href} title={item.title}>
                                                            <item.icon className="transition-transform duration-200 group-hover:scale-110" />
                                                            <span className="transition-all duration-200">{item.label}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                            {/* Direct menu items for collapsed sidebar */}
                            {group.items.map((item) => (
                                <SidebarMenuItem key={`${group.GroupLabel}-${item.label}`} className="group-data-[collapsible=icon]:block hidden">
                                    <SidebarMenuButton asChild tooltip={item.title} className="transition-all duration-200 hover:scale-105">
                                        <Link href={item.href}>
                                            <item.icon className="transition-transform duration-200 hover:scale-110" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar