"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io,Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

export type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

const wsRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const reconnectRef = useRef<number | null>(null);

  // Toggle dropdown & mark all as read
  const toggleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => {
      if (!prev) {
        setNotifications((prevNotifs) =>
          prevNotifs.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
      return !prev;
    });
  }, []);

  // WebSocket connection
  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    // Socket.IO is smart enough to figure out the path and transport,
    // but you need to connect to the base URL and specify the 'path'.
    const serverUrl = `${window.location.protocol}//${window.location.host}`;
    console.log("[IO] Attempting connection to", serverUrl);

    // 💡 Use the Socket.IO client to connect
    const socket = io(serverUrl, {
      path: "/ws", // Must match the 'path' configured on the server
      transports: ["websocket"], // Optional: forces WebSocket transport
    });

    wsRef.current = socket;

    socket.on("connect", () => console.log("[IO] Connected to server"));
    socket.on("disconnect", () =>
      console.warn("[IO] Disconnected. Attempting to reconnect...")
    ); // Socket.IO handles automatic reconnection by default!

    // 💡 Listen for the exact events emitted by your server
    socket.on("initial", (newNotifications: Notification[]) => {
      console.log("[IO] Received initial data");
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    });

    socket.on("new", (newNotifications: Notification[]) => {
      console.log("[IO] Received new notification");
      setNotifications((prev) =>
        [newNotifications[0], ...prev].slice(0, 50)
      );
      setUnreadCount((c) => c + 1);
    });

    socket.on("connect_error", (err) => console.error("[IO] Connection Error:", err));
    
    // Cleanup function (important!)
    return () => {
      socket.close(); // Disconnects the socket
    }

  }, []);

  useEffect(() => {
    // 💡 Connect and get the cleanup function
    const disconnect = connect();

    return () => {
      // 💡 Execute the cleanup function
      if (disconnect) disconnect();
    };
  }, [connect]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    notificationsOpen,
    toggleNotifications,
    markAllRead,
  };
}
