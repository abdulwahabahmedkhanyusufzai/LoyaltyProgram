"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type Notification = {
  data: any;
  id: string;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
  read?: boolean;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const wsRef = useRef<Socket | null>(null);

  useEffect(() => {
    const WS_URL =
      process.env.NODE_ENV === "production"
        ? `https://${window.location.host}`
        : "http://localhost:3001";

    const socket = io(WS_URL, {
      transports: ["websocket"],
      path: "/socket.io",
    });

    wsRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to notifications socket:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });

    socket.on("OLD_NOTIFICATIONS", (oldNotifications: Notification[]) => {
      console.log("Received old notifications:", oldNotifications.length);
      setNotifications(oldNotifications);
      const unread = oldNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    socket.on("NEW_NOTIFICATION", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("NEW_NOTIFICATION");
      socket.off("OLD_NOTIFICATIONS");
      socket.disconnect();
    };
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => !prev);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    notificationsOpen,
    bellRef,
    toggleNotifications,
    markAllRead,
  };
}
