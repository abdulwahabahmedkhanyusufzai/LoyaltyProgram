"use client";
import { useState, useRef, useEffect } from "react";

export default function MonthDropdown({
  currentMonth,
  onMonthChange,
}: {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer flex items-center justify-between gap-2 border rounded-[20px] sm:rounded-[25px] border-[#a59f9f]  px-4 h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition min-w-[80px]"
      >
        <span>{currentMonth.slice(0, 3)}</span>
        {open ? (
          // Chevron Up
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          // Chevron Down
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-[150px] bg-white border border-[#2C2A25] rounded-[12px] shadow-lg z-50">
          {months.map((month) => (
            <div
              key={month}
              onClick={() => {
                onMonthChange(month);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#2C2A25] hover:text-white transition ${currentMonth === month ? "bg-[#2C2A25] text-white" : ""
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
