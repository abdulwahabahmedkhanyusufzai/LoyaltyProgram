"use client";
import { useState } from "react";

type TabsProps = {
  type?: "default" | "emails";
  activeTab?: string;
  onChange?: (tab: string) => void;
};

export default function Tabs({ type = "default", activeTab, onChange }: TabsProps) {
  const tabs = ["Home", "Clients", "Program"];
  const emailsTabs = ["Home", "Customers", "Send an Email"];

  // Pick which list to use based on prop
  const tabList = type === "emails" ? emailsTabs : tabs;

  // Fallback to internal state if no activeTab is provided
  const [internalActive, setInternalActive] = useState(tabList[0]);
  const currentActive = activeTab ?? internalActive;

  const handleClick = (tab: string) => {
    if (onChange) {
      onChange(tab); // notify parent
    } else {
      setInternalActive(tab); // use internal state
    }
  };

  return (
    <div className="my-[10px] mb-6">
      <div
        className="
          flex justify-center 
          lg:justify-center  /* desktop: center align */
          overflow-x-auto lg:overflow-visible /* mobile: scroll, desktop: normal */
        "
      >
        <div
          className="
            inline-flex flex-nowrap rounded-full border border-gray-300 overflow-hidden shadow-sm
            min-w-max /* ensures buttons can stretch freely */
          "
        >
          {tabList.map((tab) => (
            <button
              key={tab}
              onClick={() => handleClick(tab)}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap
                ${
                  currentActive === tab
                    ? "bg-[#6a4e1e] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
