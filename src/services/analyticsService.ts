import axios from "@/lib/axios";
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
  ExportOptions,
  ChartData,
  MetricCard,
  ChartOptions,
  CHART_COLORS,
  DashboardAnalyticsResponse,
  WeeklyAnalyticsResponse,
  PerformanceAnalyticsResponse,
  RealTimeDataResponse,
  WorkflowMetricsResponse,
  UsagePatternsResponse,
  PerformanceAlertsResponse,
  UserActivityResponse,
  DepartmentMetricsResponse,
  SystemHealthResponse,
} from "@/types/analytics";

class AnalyticsService {
  private baseUrl = "/api/analytics";

  /**
   * Dashboard Analytics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await axios.get<DashboardAnalyticsResponse>(
      `${this.baseUrl}/dashboard`
    );
    return response.data.data;
  }

  async getWeeklyAnalytics(weeks: number = 12): Promise<WeeklySummary> {
    const response = await axios.get<WeeklyAnalyticsResponse>(
      `${this.baseUrl}/weekly`,
      {
        params: { weeks },
      }
    );
    return response.data.data;
  }

  async getPerformanceMetrics(
    filters: AnalyticsFilters = {}
  ): Promise<WorkflowMetrics> {
    const response = await axios.get<PerformanceAnalyticsResponse>(
      `${this.baseUrl}/performance`,
      {
        params: filters,
      }
    );
    return response.data.data;
  }

  async getRealTimeData(): Promise<RealTimeData> {
    const response = await axios.get<RealTimeDataResponse>(
      `${this.baseUrl}/realtime`
    );
    return response.data.data;
  }

  /**
   * Specific Analytics
   */
  async getWorkflowMetrics(period: string = "30d"): Promise<WorkflowMetrics> {
    const response = await axios.get<WorkflowMetricsResponse>(
      `${this.baseUrl}/workflow-metrics`,
      {
        params: { period },
      }
    );
    return response.data.data;
  }

  async getUsagePatterns(period: string = "30d"): Promise<UsagePatterns> {
    const response = await axios.get<UsagePatternsResponse>(
      `${this.baseUrl}/usage-patterns`,
      {
        params: { period },
      }
    );
    return response.data.data;
  }

  async getPerformanceComparison() {
    const response = await axios.get(`${this.baseUrl}/performance-comparison`);
    return response.data.data;
  }

  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    const response = await axios.get<PerformanceAlertsResponse>(
      `${this.baseUrl}/performance-alerts`
    );
    return response.data.data;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await axios.get<SystemHealthResponse>(
      `${this.baseUrl}/system-health`
    );
    return response.data.data;
  }

  /**
   * Department and User Analytics
   */
  async getDepartmentMetrics(departmentId: number): Promise<DepartmentMetrics> {
    const response = await axios.get<DepartmentMetricsResponse>(
      `${this.baseUrl}/departments/${departmentId}/metrics`
    );
    return response.data.data;
  }

  async getUserActivity(
    userId: number,
    period: string = "30d"
  ): Promise<ActivitySummary> {
    const response = await axios.get<UserActivityResponse>(
      `${this.baseUrl}/users/${userId}/activity`,
      {
        params: { period },
      }
    );
    return response.data.data;
  }

  /**
   * Export and Admin Functions
   */
  async exportReport(options: ExportOptions): Promise<Blob> {
    const response = await axios.post(
      `${this.baseUrl}/export-report`,
      options,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  async collectAnalytics(): Promise<void> {
    await axios.post(`${this.baseUrl}/collect-analytics`);
  }

  async cleanupOldData(retentionDays: number = 365): Promise<void> {
    await axios.delete(`${this.baseUrl}/cleanup-old-data`, {
      params: { retention_days: retentionDays },
    });
  }

  /**
   * Data Transformation Utilities
   */
  transformTrendDataToChart(trendData: any[]): ChartData {
    return {
      labels: trendData.map((item) => item.week),
      datasets: [
        {
          label: "Distributions",
          data: trendData.map((item) => item.distributions),
          backgroundColor: CHART_COLORS.PRIMARY + "20",
          borderColor: CHART_COLORS.PRIMARY,
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Completed",
          data: trendData.map((item) => item.completed),
          backgroundColor: CHART_COLORS.SUCCESS + "20",
          borderColor: CHART_COLORS.SUCCESS,
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  }

  transformStatusBreakdownToChart(
    statusBreakdown: Record<string, number>
  ): ChartData {
    const labels = Object.keys(statusBreakdown);
    const data = Object.values(statusBreakdown);

    return {
      labels: labels.map((status) => status.replace("_", " ").toUpperCase()),
      datasets: [
        {
          label: "Distributions by Status",
          data,
          backgroundColor: [
            CHART_COLORS.INFO,
            CHART_COLORS.WARNING,
            CHART_COLORS.PRIMARY,
            CHART_COLORS.SECONDARY,
            CHART_COLORS.SUCCESS,
            CHART_COLORS.DANGER,
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  transformDepartmentStatsToChart(
    departmentStats: Record<string, any>
  ): ChartData {
    const departments = Object.keys(departmentStats);
    const completionRates = departments.map(
      (dept) => departmentStats[dept].completion_rate || 0
    );

    return {
      labels: departments,
      datasets: [
        {
          label: "Completion Rate (%)",
          data: completionRates,
          backgroundColor: CHART_COLORS.PRIMARY + "80",
          borderColor: CHART_COLORS.PRIMARY,
          borderWidth: 1,
        },
      ],
    };
  }

  transformPeakHoursToChart(peakHours: Record<string, number>): ChartData {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const data = hours.map((hour) => peakHours[hour.toString()] || 0);

    return {
      labels: hours.map((hour) => `${hour}:00`),
      datasets: [
        {
          label: "Activity Count",
          data,
          backgroundColor: CHART_COLORS.INFO + "60",
          borderColor: CHART_COLORS.INFO,
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  }

  /**
   * Metric Card Helpers
   */
  createMetricCard(
    title: string,
    value: string | number,
    change?: number,
    icon: string = "📊",
    color: string = CHART_COLORS.PRIMARY
  ): MetricCard {
    const changeType =
      change === undefined
        ? "neutral"
        : change > 0
        ? "increase"
        : change < 0
        ? "decrease"
        : "neutral";

    return {
      title,
      value,
      change,
      changeType,
      icon,
      color,
    };
  }

  createDashboardMetricCards(dashboardMetrics: DashboardMetrics): MetricCard[] {
    const { weekly_analytics, current_week_performance } = dashboardMetrics;

    return [
      this.createMetricCard(
        "Total Distributions",
        weekly_analytics.total_distributions,
        current_week_performance.compared_to_last_week.distributions_change,
        "📋",
        CHART_COLORS.PRIMARY
      ),
      this.createMetricCard(
        "Completion Rate",
        `${weekly_analytics.avg_completion_rate}%`,
        current_week_performance.compared_to_last_week.completion_rate_change,
        "✅",
        CHART_COLORS.SUCCESS
      ),
      this.createMetricCard(
        "Avg. Completion Time",
        `${weekly_analytics.avg_completion_hours}h`,
        current_week_performance.compared_to_last_week.avg_hours_change,
        "⏱️",
        CHART_COLORS.WARNING
      ),
      this.createMetricCard(
        "Active Users",
        weekly_analytics.total_active_users,
        current_week_performance.compared_to_last_week.users_change,
        "👥",
        CHART_COLORS.INFO
      ),
    ];
  }

  /**
   * Chart Options Generators
   */
  getDefaultLineChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time Period",
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Count",
          },
        },
      },
    };
  }

  getDefaultBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
        },
        y: {
          display: true,
          beginAtZero: true,
        },
      },
    };
  }

  getDefaultDoughnutChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "right",
        },
      },
    };
  }

  /**
   * Utility Functions
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(1)}h`;
  }

  getChangeIndicator(change: number): string {
    if (change > 0) return "↗️";
    if (change < 0) return "↘️";
    return "➡️";
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case "high":
        return CHART_COLORS.DANGER;
      case "warning":
        return CHART_COLORS.WARNING;
      case "medium":
        return CHART_COLORS.INFO;
      case "low":
        return CHART_COLORS.SUCCESS;
      default:
        return CHART_COLORS.SECONDARY;
    }
  }

  /**
   * Real-time Data Polling
   */
  startRealTimePolling(
    callback: (data: RealTimeData) => void,
    interval: number = 30000
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const data = await this.getRealTimeData();
        callback(data);
      } catch (error) {
        console.error("Failed to fetch real-time data:", error);
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Performance Alert Helpers
   */
  groupAlertsBySeverity(
    alerts: PerformanceAlert[]
  ): Record<string, PerformanceAlert[]> {
    return alerts.reduce((acc, alert) => {
      const severity = alert.severity;
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push(alert);
      return acc;
    }, {} as Record<string, PerformanceAlert[]>);
  }

  getAlertIcon(alertType: string): string {
    const iconMap: Record<string, string> = {
      completion_rate_drop: "📉",
      processing_time_increase: "⏰",
      stuck_distributions: "🚫",
      low_user_activity: "👤",
      system_error: "⚠️",
      performance_degradation: "🐌",
    };
    return iconMap[alertType] || "🔔";
  }

  /**
   * Export Helpers
   */
  async downloadReport(
    data: any,
    filename: string,
    format: "csv" | "excel" | "pdf" = "csv"
  ): Promise<void> {
    const blob = await this.exportReport({
      format,
      data_type: "dashboard",
      filters: {},
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const analyticsService = new AnalyticsService();
