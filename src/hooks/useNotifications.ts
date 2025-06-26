import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationFilter } from "@/types/notification";
import notificationService from "@/services/notificationService";
import { toast } from "sonner";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<NotificationFilter>({});

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (options?: {
      page?: number;
      filters?: NotificationFilter;
      append?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const page = options?.page || currentPage;
        const filterOptions = options?.filters || filters;

        const response = await notificationService.getNotifications({
          ...filterOptions,
          page,
        });

        if (options?.append) {
          setNotifications((prev) => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }

        setCurrentPage(response.meta.current_page);
        setTotalPages(response.meta.last_page);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications"
        );
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, filters]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await notificationService.markAsRead(notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );

        // Update unread count
        await fetchUnreadCount();

        toast.success("Notification marked as read");
      } catch (err) {
        toast.error("Failed to mark notification as read");
      }
    },
    [fetchUnreadCount]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
      toast.success(`Marked ${response.data.count} notifications as read`);
    } catch (err) {
      toast.error("Failed to mark all notifications as read");
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await notificationService.deleteNotification(notificationId);

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        if (
          deletedNotification &&
          notificationService.isUnread(deletedNotification)
        ) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        toast.success("Notification deleted");
      } catch (err) {
        toast.error("Failed to delete notification");
      }
    },
    [notifications]
  );

  // Bulk actions
  const bulkAction = useCallback(
    async (action: "mark_read" | "delete", notificationIds: number[]) => {
      try {
        const response = await notificationService.bulkAction({
          action,
          notification_ids: notificationIds,
        });

        if (action === "mark_read") {
          setNotifications((prev) =>
            prev.map((notification) =>
              notificationIds.includes(notification.id)
                ? { ...notification, read_at: new Date().toISOString() }
                : notification
            )
          );
          await fetchUnreadCount();
        } else if (action === "delete") {
          setNotifications((prev) =>
            prev.filter((n) => !notificationIds.includes(n.id))
          );
          // Update unread count
          const deletedUnreadCount = notifications.filter(
            (n) =>
              notificationIds.includes(n.id) && notificationService.isUnread(n)
          ).length;
          setUnreadCount((prev) => Math.max(0, prev - deletedUnreadCount));
        }

        toast.success(response.message);
      } catch (err) {
        toast.error(`Failed to ${action.replace("_", " ")} notifications`);
      }
    },
    [notifications, fetchUnreadCount]
  );

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (notificationService.isUnread(notification)) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Update notification (for real-time updates)
  const updateNotification = useCallback(
    (notificationId: number, updates: Partial<Notification>) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, ...updates }
            : notification
        )
      );
    },
    []
  );

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (currentPage < totalPages && !loading) {
      await fetchNotifications({
        page: currentPage + 1,
        append: true,
      });
    }
  }, [currentPage, totalPages, loading, fetchNotifications]);

  // Apply filters
  const applyFilters = useCallback(
    async (newFilters: NotificationFilter) => {
      setFilters(newFilters);
      setCurrentPage(1);
      await fetchNotifications({
        page: 1,
        filters: newFilters,
        append: false,
      });
    },
    [fetchNotifications]
  );

  // Clear filters
  const clearFilters = useCallback(async () => {
    setFilters({});
    setCurrentPage(1);
    await fetchNotifications({
      page: 1,
      filters: {},
      append: false,
    });
  }, [fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await Promise.all([
      fetchNotifications({ page: 1, append: false }),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,
    filters,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkAction,
    addNotification,
    updateNotification,
    loadMore,
    applyFilters,
    clearFilters,
    refresh,

    // Computed
    hasMore: currentPage < totalPages,
    isEmpty: notifications.length === 0,
    unreadNotifications: notifications.filter((n) =>
      notificationService.isUnread(n)
    ),
    readNotifications: notifications.filter(
      (n) => !notificationService.isUnread(n)
    ),
  };
};
