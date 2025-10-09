"use client";
import React from "react";
import { rewards } from "../data/customData";

interface RewardBadgeProps {
  date: number; // always a marked date
  label: string;
}

const RewardBadge = ({ date, label }: RewardBadgeProps) => {
  return (
    <div
      className="flex items-center bg-[#2C2A25] text-white border border-[#2C2A25] 
                 rounded-[20px] w-[100px] sm:w-[120px] lg:w-[100px] 
                 h-[30px] sm:h-[36px] lg:h-[34px]"
    >
      {/* White Circle showing marked date */}
      <div
        className="flex justify-center items-center flex-shrink-0 
                   w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] lg:w-[28px] lg:h-[28px] 
                   rounded-full border border-[#FEFCED] bg-[#FEFCED] 
                   text-[10px] sm:text-[12px] lg:text-[12px] font-semibold text-black ml-1"
      >
        {date}
      </div>

      {/* Label */}
      <div className="ml-2 sm:ml-3 lg:ml-1 text-[10px] sm:text-[12px] lg:text-[12px] font-medium truncate">
        {label}
      </div>
    </div>
  );
};

interface RewardsRowProps {
  markedDates: number[];
}

const RewardsRow = ({ markedDates }: RewardsRowProps) => {
  // Filter only rewards that have marked dates
  const badgesToShow = rewards
    .map((reward, idx) => ({ ...reward, date: markedDates[idx] }))
    .filter((r) => r.date !== undefined)
    .slice(0, 3); // show at most 3 badges

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-1 lg:space-x-2 overflow-x-auto py-2">
      {badgesToShow.map((reward, idx) => (
        <RewardBadge key={idx} date={reward.date!} label={reward.label} />
      ))}
    </div>
  );
};

export default RewardsRow;
