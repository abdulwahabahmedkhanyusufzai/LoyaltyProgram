"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../lib/UserContext";
import { useTranslations } from "next-intl";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean; // track read/unread
};

type HeaderProps = {
  onToggle?: (open: boolean) => void;
};

export const Header = ({ onToggle }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const t = useTranslations();
  const { user } = useUser();

  const toggleSidebar = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onToggle?.(newOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => {
      if (!prev) {
        // Mark all notifications as read when dropdown opens
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
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

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
const wsUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;


  console.log("[WS] Trying to connect to:", wsUrl);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("[WS] Connected to WebSocket server");
  ws.onmessage = (event) => {
    console.log("[WS] Incoming:", event.data);
    try {
      const { type, notifications } = JSON.parse(event.data);

      if (type === "initial") {
        setNotifications(notifications);
        setUnreadCount(
          notifications.filter((n: any) => !n.read).length
        );
      }

      if (type === "new") {
        setNotifications((prev) => [notifications[0], ...prev]);
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.error("[WS] JSON parse error:", err);
    }
  };

  ws.onerror = (err) => console.error("[WS] Error:", err);
  ws.onclose = () => console.log("[WS] Disconnected");

  return () => ws.close();
}, []);


  return (
    <div className="sticky top-0 z-50 ml-0 lg:ml-[290px] 2xl:ml-[342px] flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-[#2C2A25] text-2xl focus:outline-none lg:hidden">
          ☰
        </button>
        <div className="flex flex-col">
          <h1 className="text-[28px] sm:text-[35px] lg:text-[30px] font-bold text-[#2C2A25]">WARO</h1>
          <p className="text-[#2C2A25] text-sm sm:text-base">{t("welcome")}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Bell Icon */}
        <button
          ref={bellRef}
          onClick={toggleNotifications}
          className="cursor-pointer relative flex items-center justify-center p-2 rounded-full border border-gray-300 w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[55px] lg:h-[55px] hover:bg-gray-100"
        >
          <img src="/bell-icon.png" className="h-5 w-5 sm:h-6 sm:w-6" alt="bell" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>

        {/* Notifications Dropdown */}
        {notificationsOpen && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{t("notifications")}</h2>
              <button onClick={toggleNotifications} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                ×
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">{t("noNotifications")}</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex flex-col p-3 rounded-lg cursor-pointer shadow-sm transition ${
                      n.read ? "bg-gray-50 hover:bg-gray-100" : "bg-yellow-50 hover:bg-yellow-100"
                    }`}
                  >
                    <p className="text-gray-800 text-sm">{n.message}</p>
                    <span className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile */}
        <button
          onClick={() => router.push("/account-settings")}
          className="cursor-pointer p-1 rounded-full hover:ring-2 hover:ring-gray-300"
        >
          {user ? (
            <img
              src={user?.profilePicUrl || "/profile.jpg"}
              className="h-[45px] w-[45px] sm:h-[50px] sm:w-[50px] lg:h-[55px] lg:w-[55px] object-cover rounded-full bg-white"
              alt="profile"
            />
          ) : (
            <div className="flex items-center justify-center bg-white rounded-full h-[45px] w-[45px] sm:h-[50px] sm:w-[50px] lg:h-[55px] lg:w-[55px]">
              <div className="h-6 w-6 border-2 border-gray-300 border-t-[#734A00] rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
