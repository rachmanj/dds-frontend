"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    UsersIcon,
    FileText,
    TrendingUp,
    Building2,
    Clock,
    CheckCircle,
    AlertTriangle,
    Package,
    BarChart3
} from "lucide-react";

import { distributionService } from '@/lib/api/distribution';
import { Distribution, DISTRIBUTION_STATUSES, getStatusColor } from '@/types/distribution';

interface DashboardStats {
    total_distributions: number;
    by_status: Record<string, number>;
    recent_distributions: Distribution[];
    discrepancy_count: number;
    avg_completion_time: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Load dashboard statistics
    useEffect(() => {
        if (session?.accessToken) {
            loadDashboardStats();
        }
    }, [session]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);

            // Get recent distributions
            const distributionsResponse = await distributionService.getAll({
                per_page: 50
            });

            const distributions = distributionsResponse.data;

            // Calculate statistics
            const stats: DashboardStats = {
                total_distributions: distributions.length,
                by_status: {},
                recent_distributions: distributions.slice(0, 5),
                discrepancy_count: distributions.filter(d => d.has_discrepancies).length,
                avg_completion_time: 0
            };

            // Initialize status counts
            DISTRIBUTION_STATUSES.forEach(status => {
                stats.by_status[status.value] = 0;
            });

            // Count by status and calculate completion time
            let totalCompletionTime = 0;
            let completedCount = 0;

            distributions.forEach(dist => {
                stats.by_status[dist.status]++;

                if (dist.status === 'completed' && dist.created_at && dist.receiver_verified_at) {
                    const createdTime = new Date(dist.created_at).getTime();
                    const completedTime = new Date(dist.receiver_verified_at).getTime();
                    totalCompletionTime += (completedTime - createdTime) / (1000 * 60 * 60 * 24);
                    completedCount++;
                }
            });

            stats.avg_completion_time = completedCount > 0 ? totalCompletionTime / completedCount : 0;

            setStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const isAdmin = session.user.role === "admin";

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Distribution Dashboard</h1>
                        <p className="text-muted-foreground">Overview of document distribution activities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/distributions/create">
                            <Button className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                New Distribution
                            </Button>
                        </Link>
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

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_distributions || 0}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.by_status.completed || 0}</div>
                            <p className="text-xs text-muted-foreground">Successfully completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">With Discrepancies</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats?.discrepancy_count || 0}</div>
                            <p className="text-xs text-muted-foreground">Need attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats?.avg_completion_time ? `${stats.avg_completion_time.toFixed(1)}d` : '0d'}
                            </div>
                            <p className="text-xs text-muted-foreground">Average time to complete</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Overview & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Distribution Status Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Distribution Status Overview
                            </CardTitle>
                            <CardDescription>Current status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {DISTRIBUTION_STATUSES.map(status => (
                                    <div key={status.value} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(status.value)} variant="secondary">
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {stats?.by_status[status.value] || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Distributions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Recent Distributions
                            </CardTitle>
                            <CardDescription>Latest distribution activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats?.recent_distributions.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No distributions yet</p>
                                ) : (
                                    stats?.recent_distributions.map(dist => (
                                        <div key={dist.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                            <div className="space-y-1">
                                                <Link href={`/distributions/${dist.id}`} className="text-sm font-medium hover:underline">
                                                    {dist.distribution_number}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">
                                                    {dist.origin_department?.name} → {dist.destination_department?.name}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(dist.status)} variant="secondary">
                                                    {dist.status.replace('_', ' ')}
                                                </Badge>
                                                {dist.has_discrepancies && (
                                                    <div className="text-xs text-orange-600 mt-1">
                                                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                                                        Has issues
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {(stats?.recent_distributions.length || 0) > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <Link href="/distributions">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Distributions
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* User Info & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome, {session.user.name}!</CardTitle>
                            <CardDescription>Your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p><strong>Email:</strong> {session.user.email}</p>
                                {session.user.department && (
                                    <p><strong>Department:</strong> {session.user.department.name} ({session.user.department.location_code})</p>
                                )}
                                {session.user.role && (
                                    <p>
                                        <strong>Role:</strong>{" "}
                                        <Badge className={session.user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                                            {session.user.role}
                                        </Badge>
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                                <Link href="/distributions/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Create New Distribution
                                    </Button>
                                </Link>
                                <Link href="/distributions">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="h-4 w-4 mr-2" />
                                        View All Distributions
                                    </Button>
                                </Link>
                                <Link href="/distributions/reports">
                                    <Button variant="outline" className="w-full justify-start">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Detailed Reports
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isAdmin && (
                    <div className="mt-6">
                        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-purple-800">Admin Actions</CardTitle>
                                <CardDescription>Administrative functions and management tools</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Link href="/users" className="w-full">
                                        <Button variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50 hover:text-purple-800">
                                            <UsersIcon className="h-4 w-4 mr-2 text-purple-600" />
                                            User Management
                                        </Button>
                                    </Link>
                                    <Link href="/distribution-types" className="w-full">
                                        <Button variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50 hover:text-purple-800">
                                            <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                                            Distribution Types
                                        </Button>
                                    </Link>
                                    <Link href="/distributions/reports" className="w-full">
                                        <Button variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50 hover:text-purple-800">
                                            <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                                            System Reports
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