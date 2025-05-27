"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { PermissionProvider } from "@/contexts/PermissionContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PermissionProvider>
                {children}
                <Toaster />
            </PermissionProvider>
        </SessionProvider>
    );
} 