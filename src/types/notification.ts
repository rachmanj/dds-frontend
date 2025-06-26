export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export type NotificationType =
  | "distribution_created"
  | "distribution_verified_sender"
  | "distribution_sent"
  | "distribution_received"
  | "distribution_verified_receiver"
  | "distribution_completed"
  | "distribution_discrepancy"
  | "document_attachment"
  | "system_message";

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  per_page?: number;
  page?: number;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface NotificationBulkAction {
  action: "mark_read" | "delete";
  notification_ids: number[];
}

export interface NotificationTypeMap {
  [key: string]: string;
}

export interface RealtimeNotificationEvent {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
  created_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  distribution_notifications: boolean;
  system_notifications: boolean;
}
