"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UsersIcon } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);



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

    // Check if user has admin role
    const isAdmin = session.user.role === "admin";

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">DDS Portal Dashboard</h1>
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Link href="/users">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4" />
                                    Manage Users
                                </Button>
                            </Link>
                        )}

                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Welcome, {session.user.name}!</CardTitle>
                        <CardDescription>You are now signed in to the DDS Portal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Email:</strong> {session.user.email}</p>
                            {session.user.role && (
                                <p>
                                    <strong>Role:</strong>{" "}
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${session.user.role === "admin"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                        }`}>
                                        {session.user.role}
                                    </span>
                                </p>
                            )}
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

                {isAdmin && (
                    <div className="mt-6">
                        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-purple-800">Admin Actions</CardTitle>
                                <CardDescription>Special actions available to administrators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link href="/users" className="w-full">
                                        <Button variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50 hover:text-purple-800">
                                            <UsersIcon className="h-4 w-4 mr-2 text-purple-600" />
                                            User Management
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
} 