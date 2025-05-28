'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Calendar,
    Filter,
    FileText,
    TrendingUp,
    Building2,
    Clock,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Distribution,
    DistributionType,
    Department,
    DistributionFilters,
    getStatusLabel,
    getStatusColor,
    DISTRIBUTION_STATUSES
} from '@/types/distribution';
import { distributionService, distributionTypeService } from '@/lib/api/distribution';

interface ReportData {
    distributions: Distribution[];
    summary: {
        total: number;
        by_status: Record<string, number>;
        by_type: Record<string, number>;
        by_department: Record<string, number>;
        avg_completion_time: number;
    };
}

export function DistributionReports() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'summary' | 'detailed' | 'performance'>('summary');

    // Filters
    const [filters, setFilters] = useState<DistributionFilters>({
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        date_to: new Date().toISOString().split('T')[0],
    });

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load report data when filters change
    useEffect(() => {
        if (distributionTypes.length > 0 && departments.length > 0) {
            loadReportData();
        }
    }, [filters, distributionTypes, departments]);

    const loadInitialData = async () => {
        try {
            const [typesData, departmentsData] = await Promise.all([
                distributionTypeService.getAll(),
                // TODO: Replace with actual departments API call
                Promise.resolve([
                    {
                        id: 1,
                        name: 'Accounting Department',
                        project: 'Main Project',
                        location_code: 'ACC',
                        transit_code: 'ACC-001',
                        akronim: 'ACC',
                        sap_code: 'ACC001'
                    },
                    {
                        id: 2,
                        name: 'Finance Department',
                        project: 'Main Project',
                        location_code: 'FIN',
                        transit_code: 'FIN-001',
                        akronim: 'FIN',
                        sap_code: 'FIN001'
                    },
                    {
                        id: 3,
                        name: 'Operations Department',
                        project: 'Main Project',
                        location_code: 'OPS',
                        transit_code: 'OPS-001',
                        akronim: 'OPS',
                        sap_code: 'OPS001'
                    }
                ] as Department[])
            ]);

            setDistributionTypes(typesData);
            setDepartments(departmentsData);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            toast.error('Failed to load report data');
        }
    };

    const loadReportData = async () => {
        try {
            setLoading(true);

            // Load distributions with filters
            const distributionsResponse = await distributionService.getAll({
                ...filters,
                per_page: 1000, // Get all for reporting
            });

            const distributions = distributionsResponse.data;

            // Calculate summary statistics
            const summary = {
                total: distributions.length,
                by_status: {} as Record<string, number>,
                by_type: {} as Record<string, number>,
                by_department: {} as Record<string, number>,
                avg_completion_time: 0
            };

            // Initialize counters
            DISTRIBUTION_STATUSES.forEach(status => {
                summary.by_status[status.value] = 0;
            });

            distributionTypes.forEach(type => {
                summary.by_type[type.name] = 0;
            });

            departments.forEach(dept => {
                summary.by_department[dept.name] = 0;
            });

            // Calculate statistics
            let totalCompletionTime = 0;
            let completedCount = 0;

            distributions.forEach(dist => {
                // Status counts
                summary.by_status[dist.status]++;

                // Type counts
                if (dist.type) {
                    summary.by_type[dist.type.name]++;
                }

                // Department counts (origin)
                if (dist.origin_department) {
                    summary.by_department[dist.origin_department.name]++;
                }

                // Completion time calculation
                if (dist.status === 'completed' && dist.created_at && dist.receiver_verified_at) {
                    const createdTime = new Date(dist.created_at).getTime();
                    const completedTime = new Date(dist.receiver_verified_at).getTime();
                    totalCompletionTime += (completedTime - createdTime) / (1000 * 60 * 60 * 24); // Days
                    completedCount++;
                }
            });

            summary.avg_completion_time = completedCount > 0 ? totalCompletionTime / completedCount : 0;

            setReportData({
                distributions,
                summary
            });
        } catch (error) {
            console.error('Failed to load report data:', error);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof DistributionFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleExportReport = async () => {
        try {
            // TODO: Implement actual report export
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Failed to export report:', error);
            toast.error('Failed to export report');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Distribution Reports</h2>
                    <p className="text-muted-foreground">
                        Analyze distribution performance and generate reports
                    </p>
                </div>
                <Button onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Report Filters
                    </CardTitle>
                    <CardDescription>
                        Configure the parameters for your distribution report
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Report Type */}
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="summary">Summary Report</SelectItem>
                                    <SelectItem value="detailed">Detailed Report</SelectItem>
                                    <SelectItem value="performance">Performance Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Input
                                type="date"
                                value={filters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {DISTRIBUTION_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Loading report data...</div>
                        </div>
                    </CardContent>
                </Card>
            ) : reportData ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reportData.summary.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    In selected period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reportData.summary.by_status.completed || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {reportData.summary.total > 0
                                        ? `${Math.round((reportData.summary.by_status.completed || 0) / reportData.summary.total * 100)}% completion rate`
                                        : 'No data'
                                    }
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData.summary.avg_completion_time.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Days on average
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Distributions</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(reportData.summary.by_status.sent || 0) + (reportData.summary.by_status.received || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    In progress
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Report Content */}
                    {reportType === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribution by Status</CardTitle>
                                    <CardDescription>
                                        Breakdown of distributions by current status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {DISTRIBUTION_STATUSES.map((status) => {
                                            const count = reportData.summary.by_status[status.value] || 0;
                                            const percentage = reportData.summary.total > 0
                                                ? (count / reportData.summary.total * 100).toFixed(1)
                                                : '0';

                                            return (
                                                <div key={status.value} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={status.color}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-medium">{count}</span>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            ({percentage}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Type Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribution by Type</CardTitle>
                                    <CardDescription>
                                        Breakdown of distributions by type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {distributionTypes.map((type) => {
                                            const count = reportData.summary.by_type[type.name] || 0;
                                            const percentage = reportData.summary.total > 0
                                                ? (count / reportData.summary.total * 100).toFixed(1)
                                                : '0';

                                            return (
                                                <div key={type.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                        <span>{type.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-medium">{count}</span>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            ({percentage}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {reportType === 'detailed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Distribution List</CardTitle>
                                <CardDescription>
                                    Complete list of distributions in the selected period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Distribution Number</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Completed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.distributions.map((distribution) => (
                                            <TableRow key={distribution.id}>
                                                <TableCell className="font-medium">
                                                    {distribution.distribution_number}
                                                </TableCell>
                                                <TableCell>
                                                    {distribution.type && (
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="w-3 h-3 rounded"
                                                                style={{ backgroundColor: distribution.type.color }}
                                                            />
                                                            <span>{distribution.type.name}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {distribution.origin_department?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {distribution.destination_department?.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(distribution.status)}>
                                                        {getStatusLabel(distribution.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(distribution.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    {distribution.receiver_verified_at
                                                        ? formatDate(distribution.receiver_verified_at)
                                                        : '-'
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {reportType === 'performance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Performance</CardTitle>
                                <CardDescription>
                                    Distribution activity by department
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {departments.map((dept) => {
                                        const count = reportData.summary.by_department[dept.name] || 0;
                                        const percentage = reportData.summary.total > 0
                                            ? (count / reportData.summary.total * 100).toFixed(1)
                                            : '0';

                                        return (
                                            <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{dept.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {dept.location_code} - {dept.project}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{count} distributions</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {percentage}% of total
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : null}
        </div>
    );
} 