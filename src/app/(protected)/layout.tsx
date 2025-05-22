import { cookies } from "next/headers";

import Sidebar from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default async function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SidebarProvider defaultOpen={defaultOpen}>
                    <Sidebar />
                    <main className=" w-full">
                        <Navbar />
                        <div className=" px-4">
                            {children}
                        </div>
                    </main>
                </SidebarProvider>
            </ThemeProvider>
        </>
    );
} 