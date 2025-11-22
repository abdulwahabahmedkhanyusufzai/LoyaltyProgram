"use client";

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { useTranslations } from "next-intl";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

type HeaderProps = {
  onToggle?: Dispatch<SetStateAction<boolean>>; // for mobile sidebar toggle
};

export const Header = ({ onToggle }: HeaderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const t = useTranslations();
  const { user } = useUser();

  // toggle notifications dropdown
  const toggleNotifications = () => {
    setNotificationsOpen((prev) => {
      if (!prev) {
        setNotifications((prevNotifs) =>
          prevNotifs.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
      return !prev;
    });
  };

  // toggle sidebar (mobile)
  const toggleSidebar = () => {
    if (onToggle) onToggle((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // WebSocket connection
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
        } else if (type === "new") {
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

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow relative">
      {/* Mobile toggle button */}
      <button
        className="lg:hidden p-2 mr-2"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div className="text-xl font-bold flex-1">WARO</div>

      {/* Notifications */}
      <button
        ref={bellRef}
        onClick={toggleNotifications}
        className="relative"
      >
        <img src="/bell-icon.png" alt="bell" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {notificationsOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg max-h-72 overflow-y-auto z-50">
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
