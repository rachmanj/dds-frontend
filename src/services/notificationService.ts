import api from "@/lib/axios";
import {
  Notification,
  NotificationResponse,
  NotificationFilter,
  UnreadCountResponse,
  NotificationBulkAction,
  NotificationTypeMap,
} from "@/types/notification";

class NotificationService {
  private baseURL = "/api/notifications";

  async getNotifications(
    filters?: NotificationFilter
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.read !== undefined)
      params.append("read", filters.read.toString());
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const response = await api.get(`${this.baseURL}?${params.toString()}`);
    return response.data;
  }

  async markAsRead(
    notificationId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`${this.baseURL}/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{
    success: boolean;
    message: string;
    data: { count: number };
  }> {
    const response = await api.post(`${this.baseURL}/mark-all-read`);
    return response.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get(`${this.baseURL}/unread-count`);
    return response.data;
  }

  async getNotificationTypes(): Promise<{
    success: boolean;
    data: NotificationTypeMap;
  }> {
    const response = await api.get(`${this.baseURL}/types`);
    return response.data;
  }

  async deleteNotification(
    notificationId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.baseURL}/${notificationId}`);
    return response.data;
  }

  async bulkAction(
    action: NotificationBulkAction
  ): Promise<{ success: boolean; message: string; data: { count: number } }> {
    const response = await api.post(`${this.baseURL}/bulk-action`, action);
    return response.data;
  }

  async sendTestNotification(data: {
    type: string;
    title: string;
    message?: string;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; message: string; data: Notification }> {
    const response = await api.post(`${this.baseURL}/test`, data);
    return response.data;
  }

  formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case "distribution_created":
        return "📝";
      case "distribution_verified_sender":
        return "✅";
      case "distribution_sent":
        return "📤";
      case "distribution_received":
        return "📥";
      case "distribution_verified_receiver":
        return "🔍";
      case "distribution_completed":
        return "🎉";
      case "distribution_discrepancy":
        return "⚠️";
      case "document_attachment":
        return "📎";
      case "system_message":
        return "🔔";
      default:
        return "📨";
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case "distribution_created":
        return "blue";
      case "distribution_verified_sender":
        return "green";
      case "distribution_sent":
        return "blue";
      case "distribution_received":
        return "purple";
      case "distribution_verified_receiver":
        return "green";
      case "distribution_completed":
        return "green";
      case "distribution_discrepancy":
        return "red";
      case "document_attachment":
        return "yellow";
      case "system_message":
        return "gray";
      default:
        return "blue";
    }
  }

  isUnread(notification: Notification): boolean {
    return !notification.read_at;
  }

  getDistributionLink(notification: Notification): string | null {
    if (notification.data?.distribution_id) {
      return `/distributions/${notification.data.distribution_id}`;
    }
    return null;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
