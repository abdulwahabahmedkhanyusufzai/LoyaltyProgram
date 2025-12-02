"use client";
import { useState } from "react";
import { useTranslations } from "use-intl";

type TabsProps = {
  type?: "default" | "emails";
  activeTab?: string;
  onChange?: (tab: string) => void;
};

export default function Tabs({ type = "default", activeTab, onChange }: TabsProps) {
  const t = useTranslations("tabs"); // Translation namespace

  // Translated tab labels with stable IDs
  const tabs = [
    { id: "home", label: t("home") },
    { id: "clients", label: t("clients") },
    { id: "program", label: t("program") },
  ];
  
  const emailsTabs = [
    { id: "home", label: t("home") },
    { id: "customers", label: t("customers") },
    { id: "sendEmail", label: t("sendEmail") },
  ];

  const tabList = type === "emails" ? emailsTabs : tabs;

  const [internalActive, setInternalActive] = useState(tabList[0].id);
  const currentActive = activeTab ?? internalActive;

  const handleClick = (tabId: string) => {
    if (onChange) onChange(tabId);
    else setInternalActive(tabId);
  };

  return (
    <div className="my-[10px] mb-6">
      <div className="flex justify-center lg:justify-center overflow-x-auto lg:overflow-visible">
        <div className="inline-flex flex-nowrap rounded-full border border-gray-300 overflow-hidden shadow-sm min-w-max">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap
                ${currentActive === tab.id
                  ? "bg-[#6a4e1e] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
