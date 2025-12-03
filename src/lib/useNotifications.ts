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
    wsRef.current?.emit("MARK_ALL_READ");
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    wsRef.current?.emit("MARK_READ", id);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsOpen &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  return {
    notifications,
    unreadCount,
    notificationsOpen,
    bellRef,
    dropdownRef,
    toggleNotifications,
    markAllRead,
    markRead,
  };
}
