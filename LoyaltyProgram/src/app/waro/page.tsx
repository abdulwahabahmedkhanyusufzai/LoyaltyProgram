"use client";

import React, { useState, useRef } from "react";
import { LoyaltyProgram } from "../components/loyaltyprogramcard";
import { TopSellingProducts } from "../components/topSellingProduct";
import { LoyalCustomer } from "../components/loyalcustomers";
import { LoyaltyTable } from "../components/TableLoyalty";
import { ActivityCalendar } from "../components/LoyalCalendar";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Loyalty Program", content: <LoyaltyProgram />,redirect: "/loyal-customers/program" },
  { label: "Top Selling Products", content: <TopSellingProducts /> },
  {
    label: "Total Registered Customers",
    content: (
      <div className="text-center flex items-center justify-center mt-6 text-[45px] sm:text-[36px] lg:text-[51px] 2xl:text-[71px] font-extrabold text-[#2C2A25]">
        25K+
      </div>
    ),
    redirect:"/send-email"
  },
  { label: "Loyal Customers", content: <LoyalCustomer /> ,redirect: "/loyal-customers" },
];

const WaroPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const router = useRouter();
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-8 bg-[#ffffff] min-h-screen">
      {/* Scrollable Stats */}
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex justify-start sm:justify-center gap-4 sm:gap-6 w-full min-w-max">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${
                stat.label === "Top Selling Products"
                  ? "bg-[#2C2A25]"
                  : "bg-[#E8E6D9]"
              } rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-lg w-[180px] sm:w-[220px] 2xl:w-[320px] h-[200px] sm:h-[200px] 2xl:h-[280px] flex flex-col flex-shrink-0`}
            >
              {/* Heading + arrow */}
              <div className="flex items-center justify-between">
                <p
                  className={`${
                    stat.label === "Top Selling Products"
                      ? "text-white"
                      : "text-[#000000]"
                  } text-[12px] sm:text-[14px] 2xl:text-[18px] font-semibold`}
                >
                  {stat.label}
                </p>
                <button
                onClick={() => router.push(`${stat.redirect}`)}
                  className={`${
                    stat.label === "Top Selling Products"
                      ? "border-[#E8E6D9]"
                      : "border-[#2C2A25]"
                  }  cursor-pointer w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] 2xl:w-[48px] 2xl:h-[48px] rounded-full border flex items-center justify-center hover:bg-[#D9D9D9] transition`}
                >
                  <img
                    src={
                      stat.label === "Top Selling Products"
                        ? `Arrow1.png`
                        : `arrow.png`
                    }
                    alt="arrow"
                  />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center">
                {stat.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table + Calendar */}
      <div className="lg:p-5 flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-2 2xl:space-x-[12px] mt-8">
        <LoyaltyTable />
        <ActivityCalendar />
      </div>
    </div>
  );
};

export default WaroPage;
