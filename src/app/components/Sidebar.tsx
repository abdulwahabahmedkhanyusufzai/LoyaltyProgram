"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNavData } from "../data/customData";
import { useUser } from "../../lib/UserContext"; // ✅ import context
import { useTranslations } from "next-intl";

const Sidebar = ({ open, setOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser(); // ✅ get user + setter from context
  const t = useTranslations("nav");
  const { navItems } = useNavData(t);;
  const bottomItems = [
    {
      name: t("bottom.accountSettings"),
      icon: "/calendar.png",
      icon2: "/calendar-on.png",
      path: "/account-settings",
    },
  ];

  // ✅ Auth item changes automatically based on context
  const authItem = user
    ? { name: t("bottom.logout"), icon: "/logout-off.png", path: "/logout" }
    : { name: t("bottom.login"), icon: "/logout-off.png", path: "/login" };

  const handleAuthClick = async (item) => {
    if (item.path === "/logout") {

      router.push("/logout");
    } else {
      router.push("/login");
    }
    setOpen(false);
  };

  const renderNavItem = (item) => {
    const isActive = pathname === item.path;

    const onClick =
      item.path === "/login" || item.path === "/logout"
        ? () => handleAuthClick(item)
        : () => {
          router.push(item.path);
          setOpen(false);
        };

    return (
      <li key={item.name} className="relative">
        {isActive && (
          <>
            <div className="absolute inset-y-[-20px] left-[-30px] right-[-30px] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(254,252,237,0.15)_0%,transparent_70%)]"></div>
            <div className="absolute left-[-10px] top-0 h-full w-[4px] bg-[#FEFCED] rounded-r z-10"></div>
          </>
        )}
        <button
          onClick={onClick}
          className={`relative z-10 flex items-center gap-[25px] lg:text-[14px] 2xl:text-[18px] w-full text-left transition-colors
            ${isActive ? "text-white" : "text-[#8D8D8D] hover:text-white"}`}
        >
          <img
            src={isActive && item.icon2 ? item.icon2 : item.icon}
            alt={item.name}
          />
          {item.name}
        </button>
      </li>
    );
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#2C2A25] flex flex-col transform transition-transform duration-300 ease-in-out
        2xl:w-[342px] lg:w-[290px] w-[267px] z-40
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
          <img
            src="/waro2.png"
            alt="Logo Icon"
            className="2xl:h-[44.81px] 2xl:w-[72.27px] lg:h-[39px] lg:w-[52px] h-[29px] w-[48px]"
          />
          <img
            src="/waro.png"
            alt="Logo Text"
            className="2xl:h-[44.81px] lg:h-[39px] h-[19px] w-auto"
          />
        </div>

        {/* Nav Items */}
        <nav className="pl-[20px] mt-[45px] flex-1 p-4">
          <ul className="lg:space-y-[14px] 2xl:space-y-[23px] space-y-[10px]">
            {navItems.map(renderNavItem)}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="lg:pl-[18px] 2xl:pl-[20px] p-4 mt-auto">
          <ul className="xl:space-y-[23px] space-y-[10px]">
            {bottomItems.map(renderNavItem)}
            {renderNavItem(authItem)}
          </ul>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-opacity-40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
