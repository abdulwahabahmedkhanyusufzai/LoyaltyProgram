"use client";

import { useEffect, useState } from "react";
import RewardsRow from "./RewardBadge";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const ActivityCalendar = () => {
  const router = useRouter();
  const [currentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Record<number, { event: string; type: string }>>({});
  const [hoveredEvent, setHoveredEvent] = useState<{ date: number; label: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Current month/year
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthName = monthNames[month];

  // Days array with leading nulls for first week alignment
  const daysArray = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-calendar?month=${monthName}`);
      if (!res.ok) throw new Error("Failed to fetch calendar data");
      const data = await res.json();
      setCalendarEvents(data.calendarData || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const markedDates = Object.keys(calendarEvents).map(Number);

  return (
    <div className="w-full h-auto sm:w-[300px] sm:h-[400px] lg:w-[340px] lg:h-[500px] 2xl:w-[502px] 2xl:h-[526px] border border-[#a59f9f] rounded-[32px] p-4 sm:p-6 flex flex-col">
      
      {/* Header */}
      <div className="border-b border-[#D2D1CA] pb-[8px] sm:pb-[10px] flex justify-between items-center">
        <h1 className="text-[16px] sm:text-[18px] font-semibold">Activity</h1>
        <button
          onClick={() => router.push("/calendar")}
          className="cursor-pointer hover:bg-[#D9D9D9] w-[38px] h-[38px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center border-[#a59f9f]"
        >
          <img src="Arrow1.svg" className="w-4 h-4 sm:w-auto sm:h-auto" alt="arrow" />
        </button>
      </div>

      {/* Loader OR Calendar */}
      {loading ? (
        <div className="flex-1 mt-4 animate-pulse">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-[26px] sm:h-[30px] 2xl:h-[50px] bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <div className="flex justify-center items-center space-x-2 sm:space-x-1 lg:space-x-2 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[100px] sm:w-[120px] lg:w-[100px] h-[30px] sm:h-[36px] lg:h-[34px] bg-gray-200 rounded-[20px]"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div 
            className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 sm:mt-4 text-center text-[12px] sm:text-[14px] flex-1"
            onMouseLeave={() => setHoveredEvent(null)}
          >
            {["Sn", "M", "Tue", "W", "Thu", "F", "St"].map((day) => (
              <div key={day} className="font-medium text-[#757575]">{day}</div>
            ))}

            {daysArray.map((day, i) => {
              const isMarked = day !== null && markedDates.includes(day);

              return (
                <div
                  key={i}
                  onMouseEnter={() => {
                    if (day && isMarked) {
                      setHoveredEvent({ date: day, label: calendarEvents[day].event });
                    } else {
                      setHoveredEvent(null);
                    }
                  }}
                  className={`relative group h-[26px] sm:h-[30px] 2xl:h-[50px] flex items-center justify-center rounded-full text-[13px] sm:text-[15px]
                    ${day ? "cursor-pointer transition" : ""}
                    ${isMarked ? "bg-[#2C2A25] text-white" : "hover:bg-[#2C2A25] hover:text-white"}
                  `}
                >
                  {day || ""}

                  {/* Tooltip removed as per user request */}
                </div>
              );
            })}
          </div>

          {/* Rewards Row */}
          <RewardsRow calendarEvents={calendarEvents} hoveredEvent={hoveredEvent} />
        </>
      )}
    </div>
  );
};
