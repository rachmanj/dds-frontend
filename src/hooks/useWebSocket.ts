import { useState, useRef, useEffect, useCallback } from "react";
import { getWebSocketService } from "@/services/websocket/connection";
import { RealtimeNotificationEvent } from "@/types/notification";

export const useWebSocket = (userId?: number) => {
  // Permanently disable WebSocket connections for development
  const WEBSOCKET_DISABLED = true;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<string>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const webSocketService = useRef(getWebSocketService());
  const eventHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  const connect = useCallback(
    (id?: number) => {
      if (WEBSOCKET_DISABLED) {
        console.log("WebSocket: Temporarily disabled for login debugging");
        return;
      }

      const userIdToUse = id || userId;
      if (!userIdToUse) {
        setError("User ID is required for WebSocket connection");
        return;
      }

      try {
        setError(null);
        webSocketService.current.connect(userIdToUse);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to connect to WebSocket"
        );
      }
    },
    [userId, WEBSOCKET_DISABLED]
  );

  const disconnect = useCallback(() => {
    if (WEBSOCKET_DISABLED) return;

    webSocketService.current.disconnect();
    setIsConnected(false);
    setConnectionState("disconnected");
    setError(null);
  }, [WEBSOCKET_DISABLED]);

  const emit = useCallback(
    (event: string, data: any) => {
      if (WEBSOCKET_DISABLED) return;

      try {
        webSocketService.current.emit(event, data);
      } catch (err) {
        console.error("Failed to emit WebSocket event:", err);
      }
    },
    [WEBSOCKET_DISABLED]
  );

  const on = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (WEBSOCKET_DISABLED) return;

      eventHandlers.current.set(event, callback);

      try {
        webSocketService.current.on(event, callback);
      } catch (err) {
        console.error("Failed to subscribe to WebSocket event:", err);
      }
    },
    [WEBSOCKET_DISABLED]
  );

  const off = useCallback(
    (event: string, callback?: (data: any) => void) => {
      if (WEBSOCKET_DISABLED) return;

      try {
        webSocketService.current.off(event, callback);

        if (!callback) {
          eventHandlers.current.delete(event);
        }
      } catch (err) {
        console.error("Failed to unsubscribe from WebSocket event:", err);
      }
    },
    [WEBSOCKET_DISABLED]
  );

  const onNotification = useCallback(
    (callback: (notification: RealtimeNotificationEvent) => void) => {
      on("notification.new", callback);
    },
    [on]
  );

  const onNotificationRead = useCallback(
    (callback: (data: { id: number }) => void) => {
      on("notification.read", callback);
    },
    [on]
  );

  const onAllNotificationsRead = useCallback(
    (callback: (data: { count: number }) => void) => {
      on("notification.all_read", callback);
    },
    [on]
  );

  const ping = useCallback(() => {
    if (WEBSOCKET_DISABLED) return;
    webSocketService.current.ping();
  }, [WEBSOCKET_DISABLED]);

  // Connection management
  useEffect(() => {
    if (WEBSOCKET_DISABLED) {
      console.log("WebSocket: Disabled - skipping connection setup");
      return;
    }

    const service = webSocketService.current;

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionState("connected");
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionState("disconnected");
    };

    const handleConnectError = (err: any) => {
      setIsConnected(false);
      setConnectionState("error");
      setError(err?.message || "Connection failed");
    };

    service.on("connect", handleConnect);
    service.on("disconnect", handleDisconnect);
    service.on("connect_error", handleConnectError);

    if (userId) {
      connect(userId);
    }

    return () => {
      service.off("connect", handleConnect);
      service.off("disconnect", handleDisconnect);
      service.off("connect_error", handleConnectError);

      eventHandlers.current.forEach((handler, event) => {
        service.off(event, handler);
      });
      eventHandlers.current.clear();
    };
  }, [userId, connect, WEBSOCKET_DISABLED]);

  // Heartbeat
  useEffect(() => {
    if (WEBSOCKET_DISABLED || !isConnected) return;

    const pingInterval = setInterval(() => {
      ping();
    }, 30000); // 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, ping, WEBSOCKET_DISABLED]);

  return {
    isConnected: WEBSOCKET_DISABLED ? false : isConnected,
    connectionState: WEBSOCKET_DISABLED ? "disconnected" : connectionState,
    error: WEBSOCKET_DISABLED ? null : error,
    connect,
    disconnect,
    emit,
    on,
    off,
    onNotification,
    onNotificationRead,
    onAllNotificationsRead,
    ping,
    canEmit: WEBSOCKET_DISABLED ? false : isConnected,
    isConnecting: WEBSOCKET_DISABLED ? false : connectionState === "connecting",
    hasError: WEBSOCKET_DISABLED ? false : !!error,
  };
};
