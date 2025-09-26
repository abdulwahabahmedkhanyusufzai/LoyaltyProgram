"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  onToggle?: (open: boolean) => void; // optional callback
};

export const Header = ({ onToggle }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onToggle?.(newOpen);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.profilePicUrl) {
            setProfilePic(data.profilePicUrl);
          } else {
            setProfilePic("/profile.jpg"); // fallback
          }
        } else {
          console.warn("User not logged in");
          setProfilePic("/profile.jpg");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfilePic("/profile.jpg");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="ml-0 lg:ml-[290px] 2xl:ml-[342px] flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      {/* Left side: hamburger + title */}
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
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="flex items-center justify-center p-2 rounded-full border border-gray-300 w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[55px] lg:h-[55px] hover:bg-gray-100">
          <img src="/bell-icon.png" className="h-5 w-5 sm:h-6 sm:w-6" alt="bell" />
        </button>

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
