"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { name: "Waro", icon: "/waro-off.png", icon2: "/waro_on.png", path: "/waro" },
  { name: "Analytics", icon: "/analytics-off.png", icon2: "/analytics-on.png", path: "/analytics" },
  { name: "View the loyalty program", icon: "/viewloyaltyoff.png", icon2: "/viewloyaltyon.png", path: "/loyalty-program" },
  { name: "View the list of loyal customers", icon: "/loyal-customers-off.png", icon2: "/loyal-customers-on.png", path: "/loyal-customers" },
  { name: "Add or remove a loyal customer", icon: "/addorremoveloyal.png", icon2: "/addorremoveloyal-on.png", path: "/add-remove-loyal" },
  { name: "Send an email", icon: "/email.png", icon2: "/email-on.png", path: "/send-email" },
  { name: "Advent calendar", icon: "/calendar.png", icon2: "/calendar-on.png", path: "/calendar" },
];

const bottomItems = [
  { name: "Account Settings", icon: "/calendar.png", icon2: "/calendar-on.png", path: "/account-settings" },
  { name: "Logout", icon: "/logout-off.png", icon2: "/logout-off.png", path: "/logout" },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>("Waro");
  const [open, setOpen] = useState(false);

  const renderNavItem = (item: { name: string; icon: string; icon2?: string; path: string }) => (
    <li key={item.name} className="relative">
      {activeItem === item.name && (
        <div className="absolute inset-y-[-20px] left-[-30px] right-[-30px] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(254,252,237,0.15)_0%,transparent_70%)]"></div>
      )}
      {activeItem === item.name && (
        <div className="absolute left-[-10px] top-0 h-full w-[4px] bg-[#FEFCED] rounded-r z-10"></div>
      )}

      <button
        onClick={() => {
          setActiveItem(item.name);
          router.push(item.path);
          setOpen(false); // close on mobile after navigation
        }}
        className={`relative z-10 flex items-center gap-[25px] lg:text-[14px] 2xl:text-[18px] w-full text-left transition-colors 
          ${pathname === item.path || activeItem === item.name ? "text-white" : "text-[#8D8D8D] hover:text-white"}`}
      >
        <img src={activeItem === item.name && item.icon2 ? item.icon2 : item.icon} alt={item.name} />
        {item.name}
      </button>
    </li>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#2C2A25] text-white p-2 rounded-md"
      >
        {open ? "✖" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#2C2A25] flex flex-col transform transition-transform duration-300 ease-in-out
        2xl:w-[342px] lg:w-[290px] w-[200px] z-40
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* Logo Section */}
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

        {/* Nav Section */}
        <nav className="pl-[20px] mt-[45px] flex-1 p-4">
          <ul className="lg:space-y-[14px] 2xl:space-y-[23px] space-y-[10px]">{navItems.map(renderNavItem)}</ul>
        </nav>

        {/* Bottom Section */}
        <div className="lg:pl-[18px] 2xl:pl-[20px] p-4 mt-auto">
          <ul className="xl:space-y-[23px] space-y-[10px]">{bottomItems.map(renderNavItem)}</ul>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0  bg-opacity-40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
