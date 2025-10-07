"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  onToggle?: (open: boolean) => void;
};

export const Header = ({ onToggle }: HeaderProps) => {
  const [open, setOpen] = useState(false); // sidebar toggle
  const [notificationsOpen, setNotificationsOpen] = useState(false); // bell modal toggle
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const bellRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onToggle?.(newOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProfilePic(data?.profilePicUrl || "/profile.jpg");
        } else {
          setProfilePic("/profile.jpg");
        }
      } catch {
        setProfilePic("/profile.jpg");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Dummy notifications
  const notifications = [
    { id: 1, message: "Your loyalty points have been updated!" },
    { id: 2, message: "New offer: 20% off selected items" },
    { id: 3, message: "Your subscription will expire in 5 days" },
  ];

  return (
    <div className="ml-0 lg:ml-[290px] 2xl:ml-[342px] flex items-center justify-between px-4 py-3 bg-white shadow-sm relative">
      {/* Left: Hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-[#2C2A25] text-2xl focus:outline-none lg:hidden"
        >
          ☰
        </button>
        <div className="flex flex-col">
          <h1 className="text-[28px] sm:text-[35px] lg:text-[45px] font-bold text-[#2C2A25]">
            WARO
          </h1>
          <p className="text-[#2C2A25] mt-1 text-sm sm:text-base">
            Welcome to the Loyalty Program.
          </p>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Bell Icon */}
        <button
          ref={bellRef}
          onClick={toggleNotifications}
          className="relative flex items-center justify-center p-2 rounded-full border border-gray-300 w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[55px] lg:h-[55px] hover:bg-gray-100"
        >
          <img src="/bell-icon.png" className="h-5 w-5 sm:h-6 sm:w-6" alt="bell" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
{/* Notification Dropdown */}
{notificationsOpen && (
  <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
    {/* Header */}
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
      <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
      <button
        onClick={toggleNotifications}
        className="text-gray-400 hover:text-gray-600 font-bold text-xl"
      >
        ×
      </button>
    </div>

    {/* Notifications List */}
    <div className="max-h-72 overflow-y-auto p-3 space-y-2">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="flex flex-col p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer shadow-sm"
          >
            <p className="text-gray-800 text-sm">{n.message}</p>
            <span className="text-gray-400 text-xs mt-1">Just now</span>
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
          {loading ? (
            <div className="flex items-center justify-center bg-white rounded-full h-[45px] w-[45px] sm:h-[50px] sm:w-[50px] lg:h-[55px] lg:w-[55px]">
              <div className="h-6 w-6 border-2 border-gray-300 border-t-[#734A00] rounded-full animate-spin"></div>
            </div>
          ) : (
            <img
              src={profilePic || "/profile.jpg"}
              className="h-[45px] w-[45px] sm:h-[50px] sm:w-[50px] lg:h-[55px] lg:w-[55px] object-cover rounded-full bg-white"
              alt="profile"
            />
          )}
        </button>
      </div>
    </div>
  );
};
