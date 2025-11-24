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
  
  // We keep the socket in a ref to access it elsewhere if needed, 
  // but we control it inside useEffect
  const wsRef = useRef<Socket | null>(null);

  // 1. Handle Click Outside (UI Logic)
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

  // 2. WebSocket Connection Logic (The Fix)
  useEffect(() => {
    // Determine URL dynamically
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    // NOTE: socket.io automatically handles protocol, usually just the host is enough
    const serverUrl = `${window.location.protocol}//${host}`;

    console.log("[IO] Initializing connection to:", serverUrl);

    const socket = io(serverUrl, {
      path: "/ws", // Ensure this matches your server config exactly
      transports: ["websocket"],
      reconnectionAttempts: 5, // Stop trying after 5 fails
    });

    wsRef.current = socket;

    // --- Event Listeners ---

    socket.on("connect", () => {
      console.log("[IO] Connected successfully. ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[IO] Connection failed:", err.message);
    });

    // Handle "Initial" load (History)
    socket.on("initial", (data: Notification[]) => {
      console.log("[IO] 'initial' event received", data);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    });

    // Handle "New" notification (Real-time)
    socket.on("new", (payload: Notification | Notification[]) => {
      console.log("[IO] 'new' event received:", payload);

      // 🛑 BUG FIX: Handle if server sends an Array OR a single Object
      const newItems = Array.isArray(payload) ? payload : [payload];

      setNotifications((prev) => {
        // Add new items to the top, keep list at 50 max
        return [...newItems, ...prev].slice(0, 50);
      });

      setUnreadCount((prev) => prev + newItems.length);
    });

    // Cleanup: This runs when the component unmounts
    return () => {
      console.log("[IO] Component unmounting, disconnecting...");
      socket.disconnect();
    };
  }, []); // Empty dependency array = runs once on mount

  // 3. UI Actions
  const toggleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => {
      if (!prev) {
        // If opening, mark visible as read (optional UX choice)
        // Or you might want to do this only when clicking specific items
        // setUnreadCount(0); 
      }
      return !prev;
    });
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