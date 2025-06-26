import { useState, useEffect, useCallback, useMemo } from "react";
import { analyticsService } from "@/services/analyticsService";
import {
  DashboardMetrics,
  WeeklySummary,
  WorkflowMetrics,
  RealTimeData,
  UsagePatterns,
  PerformanceAlert,
  ActivitySummary,
  DepartmentMetrics,
  SystemHealth,
  AnalyticsFilters,
  MetricCard,
  ANALYTICS_REFRESH_INTERVALS,
} from "@/types/analytics";

// Base analytics hook
export function useAnalytics<T>(
  fetchFunction: () => Promise<T>,
  refreshInterval?: number,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Dashboard Analytics Hook
export function useDashboardAnalytics() {
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useAnalytics(
    () => analyticsService.getDashboardMetrics(),
    ANALYTICS_REFRESH_INTERVALS.DASHBOARD
  );

  const metricCards = useMemo(() => {
    if (!dashboardData) return [];
    return analyticsService.createDashboardMetricCards(dashboardData);
  }, [dashboardData]);

  return {
    dashboardData,
    metricCards,
    loading,
    error,
    refetch,
  };
}

// Weekly Analytics Hook
export function useWeeklyAnalytics(weeks: number = 12) {
  return useAnalytics(
    () => analyticsService.getWeeklyAnalytics(weeks),
    ANALYTICS_REFRESH_INTERVALS.WEEKLY,
    [weeks]
  );
}

// Performance Analytics Hook
export function usePerformanceAnalytics(filters: AnalyticsFilters = {}) {
  const {
    data: performanceData,
    loading,
    error,
    refetch,
  } = useAnalytics(
    () => analyticsService.getPerformanceMetrics(filters),
    undefined,
    [JSON.stringify(filters)]
  );

  const statusChart = useMemo(() => {
    if (!performanceData?.status_breakdown) return null;
    return analyticsService.transformStatusBreakdownToChart(
      performanceData.status_breakdown
    );
  }, [performanceData]);

  return {
    performanceData,
    statusChart,
    loading,
    error,
    refetch,
  };
}

// Real-time Data Hook
export function useRealTimeData() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = analyticsService.startRealTimePolling((realTimeData) => {
      setData(realTimeData);
      setLoading(false);
      setError(null);
    }, ANALYTICS_REFRESH_INTERVALS.REAL_TIME);

    // Initial load
    analyticsService
      .getRealTimeData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return cleanup;
  }, []);

  return { data, loading, error };
}

// Workflow Metrics Hook
export function useWorkflowMetrics(period: string = "30d") {
  const {
    data: workflowData,
    loading,
    error,
    refetch,
  } = useAnalytics(
    () => analyticsService.getWorkflowMetrics(period),
    undefined,
    [period]
  );

  const statusChart = useMemo(() => {
    if (!workflowData?.status_breakdown) return null;
    return analyticsService.transformStatusBreakdownToChart(
      workflowData.status_breakdown
    );
  }, [workflowData]);

  return {
    workflowData,
    statusChart,
    loading,
    error,
    refetch,
  };
}

// Usage Patterns Hook
export function useUsagePatterns(period: string = "30d") {
  const {
    data: usageData,
    loading,
    error,
    refetch,
  } = useAnalytics(() => analyticsService.getUsagePatterns(period), undefined, [
    period,
  ]);

  const peakHoursChart = useMemo(() => {
    if (!usageData?.peak_hours) return null;
    return analyticsService.transformPeakHoursToChart(usageData.peak_hours);
  }, [usageData]);

  const departmentChart = useMemo(() => {
    if (!usageData?.department_activity) return null;
    return analyticsService.transformDepartmentStatsToChart(
      usageData.department_activity
    );
  }, [usageData]);

  return {
    usageData,
    peakHoursChart,
    departmentChart,
    loading,
    error,
    refetch,
  };
}

// Performance Comparison Hook
export function usePerformanceComparison() {
  return useAnalytics(
    () => analyticsService.getPerformanceComparison(),
    ANALYTICS_REFRESH_INTERVALS.DASHBOARD
  );
}

// Performance Alerts Hook
export function usePerformanceAlerts() {
  const {
    data: alerts,
    loading,
    error,
    refetch,
  } = useAnalytics(
    () => analyticsService.getPerformanceAlerts(),
    ANALYTICS_REFRESH_INTERVALS.DASHBOARD
  );

  const groupedAlerts = useMemo(() => {
    if (!alerts) return {};
    return analyticsService.groupAlertsBySeverity(alerts);
  }, [alerts]);

  const alertCount = useMemo(() => {
    return alerts?.length || 0;
  }, [alerts]);

  const highPriorityCount = useMemo(() => {
    return alerts?.filter((alert) => alert.severity === "high").length || 0;
  }, [alerts]);

  return {
    alerts,
    groupedAlerts,
    alertCount,
    highPriorityCount,
    loading,
    error,
    refetch,
  };
}

// System Health Hook
export function useSystemHealth() {
  return useAnalytics(
    () => analyticsService.getSystemHealth(),
    ANALYTICS_REFRESH_INTERVALS.REAL_TIME
  );
}

// User Activity Hook
export function useUserActivity(userId: number, period: string = "30d") {
  return useAnalytics(
    () => analyticsService.getUserActivity(userId, period),
    undefined,
    [userId, period]
  );
}

// Department Metrics Hook
export function useDepartmentMetrics(departmentId: number) {
  const {
    data: departmentData,
    loading,
    error,
    refetch,
  } = useAnalytics(
    () => analyticsService.getDepartmentMetrics(departmentId),
    undefined,
    [departmentId]
  );

  const statusChart = useMemo(() => {
    if (!departmentData?.status_breakdown) return null;
    return analyticsService.transformStatusBreakdownToChart(
      departmentData.status_breakdown
    );
  }, [departmentData]);

  const typeChart = useMemo(() => {
    if (!departmentData?.type_breakdown) return null;
    return analyticsService.transformStatusBreakdownToChart(
      departmentData.type_breakdown
    );
  }, [departmentData]);

  return {
    departmentData,
    statusChart,
    typeChart,
    loading,
    error,
    refetch,
  };
}

// Analytics Export Hook
export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(
    async (filename: string, format: "csv" | "excel" | "pdf" = "csv") => {
      try {
        setExporting(true);
        setError(null);
        await analyticsService.downloadReport({}, filename, format);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed");
      } finally {
        setExporting(false);
      }
    },
    []
  );

  return {
    exportReport,
    exporting,
    error,
  };
}

// Analytics Admin Hook (for admin operations)
export function useAnalyticsAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await analyticsService.collectAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Collection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanupData = useCallback(async (retentionDays: number = 365) => {
    try {
      setLoading(true);
      setError(null);
      await analyticsService.cleanupOldData(retentionDays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cleanup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    collectAnalytics,
    cleanupData,
    loading,
    error,
  };
}

// Combined Analytics Hook (for comprehensive dashboard)
export function useCombinedAnalytics() {
  const {
    dashboardData,
    metricCards,
    loading: dashboardLoading,
  } = useDashboardAnalytics();
  const { data: weeklyData, loading: weeklyLoading } = useWeeklyAnalytics();
  const { data: realTimeData, loading: realTimeLoading } = useRealTimeData();
  const { alerts, alertCount, loading: alertsLoading } = usePerformanceAlerts();
  const { data: systemHealth, loading: healthLoading } = useSystemHealth();

  const loading =
    dashboardLoading ||
    weeklyLoading ||
    realTimeLoading ||
    alertsLoading ||
    healthLoading;

  const trendChart = useMemo(() => {
    if (!weeklyData?.trend_data) return null;
    return analyticsService.transformTrendDataToChart(weeklyData.trend_data);
  }, [weeklyData]);

  const departmentChart = useMemo(() => {
    if (!weeklyData?.department_breakdown) return null;
    return analyticsService.transformDepartmentStatsToChart(
      weeklyData.department_breakdown
    );
  }, [weeklyData]);

  return {
    // Data
    dashboardData,
    weeklyData,
    realTimeData,
    alerts,
    systemHealth,

    // Processed data
    metricCards,
    trendChart,
    departmentChart,
    alertCount,

    // Status
    loading,
  };
}

// Chart Data Hook (for specific chart requirements)
export function useChartData<T>(
  data: T | null,
  transformFunction: (data: T) => any,
  dependencies: any[] = []
) {
  return useMemo(() => {
    if (!data) return null;
    return transformFunction(data);
  }, [data, transformFunction, ...dependencies]);
}

// Auto-refresh Hook (for manual control)
export function useAutoRefresh(
  callback: () => void,
  interval: number,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(callback, interval);
    return () => clearInterval(intervalId);
  }, [callback, interval, enabled]);
}
