"use client";
import { useState } from "react";
import { Header } from "../components/Header";

 function AdventCalendar() {
  const [month, setMonth] = useState("Aug");

  // Example data (can be dynamic from API)
  const calendarData = {
    "2": { event: "10% Off", type: "discount" },
    "6": { event: "20% Off", type: "discount" },
    "11": { event: "20% Off", type: "discount" },
    "18": { event: "10% Off", type: "discount"  },
    "21": { event: "20% Off", type: "discount"},
  };

  // Generate days (1–30 for demo)
  const daysInMonth = 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (dayIndex) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[dayIndex % 7]; // fake rotation
  };

  return (
        <div className="p-4 sm:p-7 space-y-6 bg-[#fffef9] min-h-screen lg:ml-[342px]">
         <Header/>
    
      <div className="max-w-5xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <div className="flex justify-start items-center">
           <img alt="" src="PremiumLoyalty.png" className="h-[37px] w-[37px]"/>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Advent Calendar
          </h2>
            </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:ring-2 focus:ring-yellow-500"
          >
            <option>Aug</option>
            <option>Sep</option>
            <option>Oct</option>
            <option>Nov</option>
            <option>Dec</option>
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="grid lg:grid-cols-7 grid-cols-3">
          {days.map((day, idx) => {
            const info = calendarData[day];
            return (
              <div
                key={day}
                className={`relative border p-2 text-center text-sm h-24 flex flex-col justify-between ${
                  info?.type === "discount"
                    ? "bg-[#734A00] text-white"
                    : "bg-[#fdfdf9] text-[#8B8B8B]"
                }`}
              >
                {/* Day label */}
                <div className="text-xs font-medium">
                  {getDayName(idx)} <br />
                  <span className="font-bold">{day}</span>
                </div>

                {/* Event */}
                {info ? (
                  <div>
                    <p className="font-bold">{info.event}</p>
                    {info.tag && (
                      <span className="absolute top-1 right-1 text-[10px] bg-black text-white px-1 rounded">
                        {info.tag}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Nothing To Do</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdventCalendar;