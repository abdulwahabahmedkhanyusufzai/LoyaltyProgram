"use client";

import { useEffect, useState, useRef, useCallback } from "react";

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

  const wsRef = useRef<WebSocket | null>(null);
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
    const wsUrl = `${protocol}://${window.location.host}/ws`;
    console.log("[WS] Attempting connection to", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("[WS] Connected to server");

    ws.onmessage = (event) => {
      try {
        const { type, notifications: newNotifications } = JSON.parse(event.data);

        if (type === "initial") {
          setNotifications(newNotifications);
          setUnreadCount(newNotifications.filter((n: any) => !n.read).length);
        } else if (type === "new") {
          setNotifications((prev) =>
            [newNotifications[0], ...prev].slice(0, 50)
          );
          setUnreadCount((c) => c + 1);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onerror = (err) => console.error("[WS] Error:", err);

    ws.onclose = () => {
      console.warn("[WS] Disconnected. Reconnecting in 3s...");
      reconnectRef.current = window.setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
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
