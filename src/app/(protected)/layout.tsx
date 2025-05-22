import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Sidebar />
            <main className=" w-full">
                <Navbar />
                <div className=" px-4">
                    {children}
                </div>
            </main>
        </>
    );
} 