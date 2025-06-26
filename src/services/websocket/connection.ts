import { io, Socket } from "socket.io-client";

export interface WebSocketEvent {
  event: string;
  callback: (data: any) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: WebSocketEvent[] = [];

  constructor() {
    // Auto-reconnect when network comes back
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (!this.socket?.connected && this.userId) {
          this.connect(this.userId);
        }
      });
    }
  }

  connect(userId: number): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
    this.isConnecting = false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Store listener for reconnection
    this.eventListeners.push({ event, callback });
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }

    // Remove from stored listeners
    this.eventListeners = this.eventListeners.filter(
      (listener) =>
        listener.event !== event || (callback && listener.callback !== callback)
    );
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("WebSocket not connected, cannot emit event:", event);
    }
  }

  joinUserChannel(userId: number): void {
    this.emit("join-user-channel", { userId });
  }

  leaveUserChannel(userId: number): void {
    this.emit("leave-user-channel", { userId });
  }

  ping(): void {
    if (this.socket?.connected) {
      this.emit("ping", { timestamp: Date.now() });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return "disconnected";
    return this.socket.connected ? "connected" : "disconnected";
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;

      // Authenticate with the server
      if (this.userId) {
        this.socket?.emit("authenticate", { userId: this.userId });
      }

      // Re-register all event listeners
      this.eventListeners.forEach(({ event, callback }) => {
        this.socket?.on(event, callback);
      });

      // Start ping interval
      this.startPingInterval();
    });

    this.socket.on("authenticated", (data) => {
      console.log("WebSocket authenticated:", data);
    });

    this.socket.on("auth_error", (error) => {
      console.error("WebSocket authentication error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("WebSocket reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
    });

    this.socket.on("pong", (data) => {
      // Handle pong response if needed
      console.debug("Received pong:", data);
    });
  }

  private startPingInterval(): void {
    if (typeof window === "undefined") return;

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService();
  }
  return webSocketService;
};

export default WebSocketService;
