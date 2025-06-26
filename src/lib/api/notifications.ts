import api from "@/lib/axios";

export interface Notification {
  id: number;
  type:
    | "distribution_created"
    | "distribution_sent"
    | "distribution_received"
    | "distribution_completed"
    | "distribution_discrepancy";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  limit?: number;
}

export const notificationService = {
  // Get user's notifications
  getAll: async (filters?: NotificationFilters): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.read !== undefined)
      params.append("read", filters.read.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(`/api/notifications?${params.toString()}`);
    return response.data.data || [];
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/api/notifications/mark-all-read");
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/api/notifications/unread-count");
    return response.data.data?.unread_count || 0;
  },

  // Delete notification
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },
};

// Mock notification data for demonstration (since backend notifications are logged)
export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "distribution_discrepancy",
    title: "Distribution Discrepancy Found",
    message:
      "Distribution 25/000H-ACC/U/00001 has 2 discrepancies reported by Finance Department",
    data: {
      distribution_id: 1,
      distribution_number: "25/000H-ACC/U/00001",
      missing_count: 1,
      damaged_count: 1,
      reporter: "Jane Doe",
    },
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: "distribution_completed",
    title: "Distribution Completed",
    message: "Distribution 25/000H-FIN/N/00005 has been completed successfully",
    data: {
      distribution_id: 5,
      distribution_number: "25/000H-FIN/N/00005",
    },
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: "distribution_received",
    title: "Distribution Received",
    message:
      "Your distribution 25/000H-ACC/N/00003 has been received by IT Department",
    data: {
      distribution_id: 3,
      distribution_number: "25/000H-ACC/N/00003",
    },
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
