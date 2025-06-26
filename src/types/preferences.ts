export interface UserPreferences {
  user_id: number;
  theme: "light" | "dark" | "system";
  dashboard_layout?: any[];
  notification_settings: number;
  email_notifications: boolean;
  push_notifications: boolean;
  language: "en" | "id";
  timezone: "Asia/Jakarta" | "UTC";
  updated_at?: string;
}

export interface PreferencesResponse {
  status: "success" | "error";
  data?: UserPreferences;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ThemeUpdateRequest {
  theme: "light" | "dark" | "system";
}

export interface NotificationSettingsRequest {
  settings: number;
}

export interface DashboardLayoutRequest {
  layout: any[];
}

export interface PreferencesUpdateRequest {
  theme?: "light" | "dark" | "system";
  dashboard_layout?: any[];
  notification_settings?: number;
  email_notifications?: boolean;
  push_notifications?: boolean;
  language?: "en" | "id";
  timezone?: "Asia/Jakarta" | "UTC";
}

// Notification type constants (matching backend)
export const NotificationTypes = {
  DISTRIBUTION_CREATED: 1,
  DISTRIBUTION_VERIFIED: 2,
  DISTRIBUTION_RECEIVED: 4,
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];
