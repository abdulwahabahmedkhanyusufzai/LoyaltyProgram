"use client";
import React from "react";
import { rewards } from "../data/customData";

const RewardBadge = ({ count, label }: { count: string; label: string }) => {
  return (
    <div
      className="flex items-center bg-[#2C2A25] text-white border border-[#2C2A25] rounded-[20px] 
                 w-[100px] sm:w-[120px] lg:w-[148px] 
                 h-[30px] sm:h-[36px] lg:h-[34px] 
                 px-2 sm:px-3 lg:px-4"
    >
      {/* Circle */}
     <div
  className="flex justify-center items-center border border-[#FEFCED] rounded-full bg-[#FEFCED] 
             w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] lg:w-[30px] lg:h-[30px] 
             text-[10px] sm:text-[12px] lg:text-[12px] text-black font-semibold"
>
  {count}
</div>

      {/* Label */}
      <div className="ml-2 sm:ml-3 lg:ml-3 text-[10px] sm:text-[12px] lg:text-[12px] font-medium">
        {label}
      </div>
    </div>
  );
};

const RewardsRow = () => {
  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-1 lg:space-x-2 overflow-x-auto py-2">
      {rewards.map((reward) => (
        <RewardBadge key={reward.count} count={reward.count} label={reward.label} />
      ))}
    </div>
  );
};

export default RewardsRow;
