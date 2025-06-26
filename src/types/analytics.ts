// Analytics Data Structures for Phase 3 Implementation

export interface WeeklyAnalytics {
  id: number;
  week_start: string;
  total_distributions: number;
  completed_distributions: number;
  avg_completion_hours: number;
  active_users: number;
  department_stats: Record<string, DepartmentStats>;
  performance_metrics: PerformanceMetrics;
  created_at: string;
  completion_rate: number;
  efficiency_score: number;
  week_range: string;
}

export interface DepartmentStats {
  total: number;
  completed: number;
  completion_rate: number;
  avg_hours: number;
}

export interface PerformanceMetrics {
  completion_rate: number;
  avg_verification_time: number;
  bottlenecks: Bottleneck[];
  top_performers: TopPerformer[];
  efficiency_score: number;
}

export interface Bottleneck {
  stage: string;
  count: number;
  description: string;
  severity?: "low" | "medium" | "high";
}

export interface TopPerformer {
  user_id: number;
  name: string;
  distributions_created: number;
  distributions_completed: number;
  completion_rate: number;
}

export interface UserActivity {
  id: number;
  user_id: number;
  activity_type: string;
  entity_type?: string;
  entity_id?: number;
  duration_seconds?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// Dashboard Metrics Response
export interface DashboardMetrics {
  weekly_analytics: WeeklySummary;
  user_metrics: UserMetrics;
  department_metrics: DepartmentMetrics;
  current_week_performance: CurrentWeekPerformance;
  last_updated: string;
}

export interface WeeklySummary {
  total_distributions: number;
  total_completed: number;
  avg_completion_rate: number;
  avg_completion_hours: number;
  total_active_users: number;
  trend_data: TrendData[];
  department_breakdown: Record<string, DepartmentStats>;
  weeks_analyzed: number;
}

export interface TrendData {
  week: string;
  week_start: string;
  distributions: number;
  completed: number;
  completion_rate: number;
  avg_hours: number;
  efficiency_score: number;
}

export interface UserMetrics {
  total_distributions_created: number;
  total_distributions_handled: number;
  completion_rate: number;
  avg_handling_time: number;
  activity_summary: ActivitySummary;
}

export interface ActivitySummary {
  total_activities: number;
  daily_breakdown: Record<string, number>;
  activity_types: Record<string, number>;
  peak_hours: number[];
  engagement_score: number;
}

export interface DepartmentMetrics {
  total_distributions: number;
  status_breakdown: Record<string, number>;
  completion_rate: number;
  avg_completion_time: number;
  daily_distribution_count: Record<string, number>;
  type_breakdown: Record<string, number>;
  department_flow: Record<string, FlowMetrics>;
}

export interface FlowMetrics {
  count: number;
  completed: number;
  completion_rate: number;
  avg_hours: number;
}

export interface CurrentWeekPerformance {
  distributions_this_week: number;
  completed_this_week: number;
  completion_rate: number;
  active_users: number;
  compared_to_last_week: PerformanceComparison;
}

export interface PerformanceComparison {
  distributions_change: number;
  completion_rate_change: number;
  avg_hours_change: number;
  users_change: number;
}

// Real-time Dashboard Data
export interface RealTimeData {
  distributions_today: number;
  distributions_this_week: number;
  pending_verifications: number;
  active_users_today: number;
  recent_completions: number;
  system_health: SystemHealth;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  response_time: number;
  error_rate: number;
  active_sessions: number;
}

// Workflow Metrics
export interface WorkflowMetrics {
  status_breakdown: Record<string, number>;
  stage_durations: Record<string, StageDuration>;
  bottlenecks: Bottleneck[];
  department_workflow: Record<string, FlowMetrics>;
  total_distributions: number;
  period: string;
}

export interface StageDuration {
  average: number;
  count: number;
}

// Usage Patterns
export interface UsagePatterns {
  peak_hours: Record<string, number>;
  department_activity: Record<string, number>;
  user_engagement: UserEngagement;
  feature_usage: Record<string, number>;
  period: string;
}

export interface UserEngagement {
  highly_active: number;
  moderately_active: number;
  low_activity: number;
  inactive: number;
}

// Performance Alerts
export interface PerformanceAlert {
  type: string;
  severity: "low" | "medium" | "warning" | "high";
  message: string;
  current_value?: number;
  previous_value?: number;
  count?: number;
  average_value?: number;
}

// Chart Data Structures
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Widget Configuration
export interface WidgetConfig {
  id: string;
  title: string;
  type: "chart" | "metric" | "list" | "table";
  chart_type?: "line" | "bar" | "doughnut" | "pie";
  size: "small" | "medium" | "large";
  refresh_interval?: number;
  data_source: string;
  options?: Record<string, any>;
}

// API Response Types
export interface AnalyticsResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedAnalyticsResponse<T = any>
  extends AnalyticsResponse<T> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Filter Options
export interface AnalyticsFilters {
  department_id?: number;
  user_id?: number;
  period?: "7d" | "30d" | "90d" | "1y";
  date_range?: {
    start: string;
    end: string;
  };
  status?: string;
  activity_type?: string;
}

// Export Options
export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  data_type: "dashboard" | "performance" | "weekly" | "user_activity";
  filters?: AnalyticsFilters;
  date_range?: {
    start: string;
    end: string;
  };
}

// Metric Card Data
export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: string;
  color: string;
  description?: string;
  loading?: boolean;
}

// Chart Options
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: "top" | "bottom" | "left" | "right";
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      beginAtZero?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

// Analytics Service Response Types
export type DashboardAnalyticsResponse = AnalyticsResponse<DashboardMetrics>;
export type WeeklyAnalyticsResponse = AnalyticsResponse<WeeklySummary>;
export type PerformanceAnalyticsResponse = AnalyticsResponse<WorkflowMetrics>;
export type RealTimeDataResponse = AnalyticsResponse<RealTimeData>;
export type WorkflowMetricsResponse = AnalyticsResponse<WorkflowMetrics>;
export type UsagePatternsResponse = AnalyticsResponse<UsagePatterns>;
export type PerformanceAlertsResponse = AnalyticsResponse<PerformanceAlert[]>;
export type UserActivityResponse = AnalyticsResponse<ActivitySummary>;
export type DepartmentMetricsResponse = AnalyticsResponse<DepartmentMetrics>;
export type SystemHealthResponse = AnalyticsResponse<SystemHealth>;

// Constants
export const ANALYTICS_REFRESH_INTERVALS = {
  REAL_TIME: 30000, // 30 seconds
  DASHBOARD: 300000, // 5 minutes
  WEEKLY: 3600000, // 1 hour
  REPORTS: 7200000, // 2 hours
} as const;

export const CHART_COLORS = {
  PRIMARY: "#3b82f6",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  DANGER: "#ef4444",
  INFO: "#06b6d4",
  SECONDARY: "#6b7280",
} as const;

export const ACTIVITY_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  DASHBOARD_VIEW: "dashboard_view",
  DISTRIBUTION_CREATE: "distribution_create",
  DISTRIBUTION_VIEW: "distribution_view",
  DISTRIBUTION_VERIFY: "distribution_verify",
  DOCUMENT_UPLOAD: "document_upload",
  DOCUMENT_DOWNLOAD: "document_download",
  REPORT_GENERATE: "report_generate",
  ANALYTICS_VIEW: "analytics_view",
} as const;
