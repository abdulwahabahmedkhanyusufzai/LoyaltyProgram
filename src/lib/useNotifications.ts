"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
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

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("[IO] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("[IO] Disconnected");
    });

    socket.on("initial", (data) => {
      console.log("[IO] Initial:", data);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    });

    socket.on("new", (list) => {
      console.log("[IO] LIVE NEW:", list);

      const items = Array.isArray(list) ? list : [list];

      setNotifications((prev) => {
        const ids = new Set(items.map((i) => i.id));
        const filteredPrev = prev.filter((p) => !ids.has(p.id));
        return [...items, ...filteredPrev].slice(0, 50);
      });

      setUnreadCount((prev) => prev + items.length);
    });

    return () => {
      // ❗ DO NOT DISCONNECT HERE
      // It will kill the socket for all pages
      console.log("[IO] Cleanup listeners only");
      socket.off("initial");
      socket.off("new");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [])
  
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