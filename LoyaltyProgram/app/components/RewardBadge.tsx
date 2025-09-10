"use client";
import React from "react";

const rewards = [
  { count: "2", label: "10% OFF" },
  { count: "4", label: "15% OFF" },
  { count: "6", label: "20% OFF" },
];

const RewardBadge = ({ count, label }: { count: string; label: string }) => {
  return (
    <div className="flex items-center lg:h-[34px] 2xl:h-[54px] bg-[#2C2A25] text-white w-[148px] border border-[#2C2A25] rounded-[25px]">
      {/* Circle */}
      <div className="text-black flex justify-center items-center border border-[#FEFCED] rounded-full bg-[#FEFCED] 
                      lg:h-[30px] lg:w-[30px] 2xl:h-[46px] 2xl:w-[46px] 
                      lg:text-[12px] 2xl:text-[14px]">
        {count}
      </div>
      {/* Label */}
      <div className="mx-[10px] lg:text-[12px] 2xl:text-[14px]">{label}</div>
    </div>
  );
};

const RewardsRow = () => {
  return (
    <div className="flex justify-center items-center space-x-[10px]">
      {rewards.map((reward) => (
        <RewardBadge key={reward.count} count={reward.count} label={reward.label} />
      ))}
    </div>
  );
};

export default RewardsRow;
