import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DDS - Authentication",
    description: "Document Distribution System - Login and Authentication",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            {children}
        </div>
    );
} 