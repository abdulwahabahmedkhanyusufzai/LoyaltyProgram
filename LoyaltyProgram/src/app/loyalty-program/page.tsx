"use client";
import React, { useRef, useState } from "react";
import { tiers,rows } from "../data/customData";
import { useRouter } from "next/navigation";

const PremiumLoyaltyProgram = () => {
   const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-8 bg-[#ffffff] min-h-screen">
      <div className="bg-[#F6F5EF] rounded-2xl border border-[#2C2A25] p-4 sm:p-6 lg:p-8 w-full">
        {/* Heading */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-[10px] justify-start">
            <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]" />
            <h2 className="text-[14px] sm:text-2xl font-bold text-[#2C2A25]">
              Premium Loyalty Program
            </h2>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <button onClick={() => router.push("/loyal-customers/program")} className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              <span>Add New</span>
              <span className="text-[14px] sm:text-[18px]">+</span>
            </button>
            <button className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              Edit
            </button>
          </div>
        </div>

        <p className="my-[15px] text-sm sm:text-base text-[#2C2A25]">
          €10 = 1 point
        </p>

        {/* Responsive Table with drag scroll */}
        <div
          ref={scrollRef}
          className="overflow-x-auto lg:overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          <table className="min-w-max border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm sm:text-[14px] font-semibold text-[#2C2A25]">
                  Advantages
                </th>
                {tiers.map((tier, idx) => (
                  <th
                    key={idx}
                    style={{ color: tier.color }}
                    className="px-3 py-2 text-sm sm:text-[14px] font-semibold whitespace-nowrap"
                  >
                    {tier.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="text-xs sm:text-sm lg:text-[12px] 2xl:text-[14px]"
                >
                  <td className="px-3 py-2 font-medium text-[#2C2A25] whitespace-normal">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      style={i >= 0 ? { color: tiers[i].color } : {}}
                      className="px-3 py-2 whitespace-normal"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoyaltyProgram;
