"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "use-intl";

export default function MonthDropdown({
  currentMonth,
  onMonthChange,
}: {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}) {
  const t = useTranslations("loyaltyTable");

  // map numbers 0-11 to translated month names
  const monthNames: string[] = Array.from({ length: 12 }, (_, i) => t(`${i}`));

  const currentIndex = monthNames.findIndex((m) => m === currentMonth);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    currentIndex >= 0 ? currentIndex : new Date().getMonth()
  );

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthSelect = (index: number) => {
    setSelectedMonthIndex(index);
    onMonthChange(monthNames[index]);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer flex items-center justify-between gap-2 border rounded-[20px] sm:rounded-[25px] border-[#a59f9f] px-4 h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition min-w-[80px]"
      >
        <span>{monthNames[selectedMonthIndex]?.slice(0, 3)}</span>
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute mt-2 w-[150px] bg-white border border-[#2C2A25] rounded-[12px] shadow-lg z-50">
          {monthNames.map((month, index) => (
            <div
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#2C2A25] hover:text-white transition ${selectedMonthIndex === index ? "bg-[#2C2A25] text-white" : ""
                }`}
            >
              {month}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
