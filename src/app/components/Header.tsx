"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { useTranslations } from "next-intl";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export const Header = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const t = useTranslations();
  const { user } = useUser();

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => {
      if (!prev) {
        // Mark all notifications as read
        setNotifications((prevNotifs) =>
          prevNotifs.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
      return !prev;
    });
  };

  // Close dropdown when clicking outside
useEffect(() => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${protocol}://${window.location.host}/api/ws`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("WebSocket connected");

  ws.onmessage = (event) => {
    try {
      const { type, data } = JSON.parse(event.data);

      if (type === "initial") {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }

      if (type === "new") {
        setNotifications((prev) => {
          const ids = new Set(prev.map((n) => n.id));
          const newItems = data
            .filter((n: any) => !ids.has(n.id))
            .map((n: any) => ({ ...n, read: false }));
          setUnreadCount((uc) => uc + newItems.length);
          return [...newItems, ...prev].slice(0, 50);
        });
      }
    } catch (err) {
      console.error("WS parse error:", err);
    }
  };

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onclose = () => console.log("WebSocket disconnected");

  return () => ws.close();
}, []);


  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);

        if (type === "initial") {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        }

        if (type === "new") {
          setNotifications((prev) => {
            const ids = new Set(prev.map((n) => n.id));
            const newItems = data
              .filter((n: any) => !ids.has(n.id))
              .map((n: any) => ({ ...n, read: false }));
            setUnreadCount((uc) => uc + newItems.length);
            return [...newItems, ...prev].slice(0, 50);
          });
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WS error:", err);

    return () => ws.close();
  }, []);

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow">
      <button ref={bellRef} onClick={toggleNotifications} className="relative">
        <img src="/bell-icon.png" alt="bell" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {notificationsOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center p-3">{t("noNotifications")}</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b cursor-pointer ${
                  n.read ? "bg-gray-50" : "bg-yellow-50"
                }`}
              >
                <p>{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
