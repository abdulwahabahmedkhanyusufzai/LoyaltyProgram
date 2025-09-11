import { useState } from "react";
import RewardsRow from "./RewardBadge";
import { useRouter } from "next/navigation";

export const ActivityCalendar = () => {
  const router = useRouter();
  const [currentDate] = useState(new Date());

  // Dates to highlight
  const markedDates = [2, 4, 6, 10, 11, 12, 17, 20, 25, 26, 27, 29, 30, 31];

  // Generate days for the current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="
      w-full h-auto 
      sm:w-[300px] sm:h-[400px] 
      lg:w-[340px] lg:h-[500px] 
      2xl:w-[502px] 2xl:h-[526px] 
      border border-[#2C2A25] rounded-[32px] 
      p-4 sm:p-6 flex flex-col
    ">
      {/* Header */}
      <div className="border-b border-[#D2D1CA] pb-[8px] sm:pb-[10px]">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] sm:text-[18px] font-semibold">Activity</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => router.push("/calendar")} className="cursor-pointer hover:bg-[#D9D9D9] w-[38px] h-[38px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center border-[#2C2A25]">
              <img src="arrow.png" className="w-4 h-4 sm:w-auto sm:h-auto" alt="arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="
        grid grid-cols-7 gap-1 sm:gap-2 mt-3 sm:mt-4 
        text-center text-[12px] sm:text-[14px] flex-1
      ">
        {/* Weekdays */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-medium text-[#757575]">
            {day}
          </div>
        ))}

        {/* Days */}
        {daysArray.map((day, i) => {
          const isMarked = markedDates.includes(day as number);

          return (
            <div
              key={i}
              className={`
                h-[26px] sm:lg:h-[30px] 2xl:h-[50px] 
                flex items-center justify-center 
                rounded-full 
                text-[13px] sm:text-[15px] 
                ${day ? "hover:bg-[#2C2A25] hover:text-white cursor-pointer transition" : ""} 
                ${isMarked ? "bg-[#2C2A25] text-white" : ""}
              `}
            >
              {day || ""}
            </div>
          );
        })}
      </div>

      <RewardsRow />
    </div>
  );
};
