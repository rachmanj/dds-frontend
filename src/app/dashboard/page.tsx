"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        toast.success("Logged out successfully");
        router.push("/login");
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null; // Will be redirected by useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">DDS Portal Dashboard</h1>
                    <Button onClick={handleSignOut} variant="outline">
                        Sign Out
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Welcome, {session.user.name}!</CardTitle>
                        <CardDescription>You are now signed in to the DDS Portal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Email:</strong> {session.user.email}</p>
                            {session.user.role && <p><strong>Role:</strong> {session.user.role}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects</CardTitle>
                            <CardDescription>Your assigned projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500">No projects assigned yet.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your recent actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500">No recent activity.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 