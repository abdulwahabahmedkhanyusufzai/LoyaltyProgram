"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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
  const bellRef = useRef<HTMLButtonElement>(null);
  const wsRef = useRef<Socket | null>(null);

  // 1. Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsOpen &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  // 2. Socket.IO connection
  useEffect(() => {
    // Connect to server
    const WS_URL =
  process.env.NODE_ENV === "production"
    ? "wss://" + window.location.hostname + "/ws" +  "/socket.io/"
    : "ws://localhost:3001";

const socket = io(WS_URL, { transports: ["websocket"] });


    wsRef.current = socket;

    // Listen for new notifications
    socket.on("NEW_NOTIFICATION", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("connect", () => {
      console.log("Connected to notifications socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notifications socket");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });

    return () => {
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
