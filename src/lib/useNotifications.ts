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

  // 1. Handle Click Outside
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

  // 2. WebSocket Connection (Simplified)
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const serverUrl = `${window.location.protocol}//${host}`;

    console.log(`[IO] Connecting to ${serverUrl}...`);

    const socket = io(serverUrl, {
      path: "/ws",
      transports: ["websocket"],
      reconnectionAttempts: 5,
      // No query needed anymore
    });

    wsRef.current = socket;

    socket.on("connect", () => {
      console.log("[IO] Connected. Socket ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[IO] Connection failed:", err.message);
    });

    // Handle History (Last 50 items)
    socket.on("initial", (data: Notification[]) => {
      console.log("[IO] Initial Load:", data);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    });

    // Handle Live Updates
    socket.on("new", (payload: Notification | Notification[]) => {
      console.log("[IO] 🔔 LIVE Notification:", payload);
      
      const newItems = Array.isArray(payload) ? payload : [payload];

      setNotifications((prev) => {
        const newIds = new Set(newItems.map(i => i.id));
        const filteredPrev = prev.filter(p => !newIds.has(p.id));
        return [...newItems, ...filteredPrev].slice(0, 50);
      });

      setUnreadCount((prev) => prev + newItems.length);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Run once on mount

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