"use client";
import { useRef, useState } from "react";
import { Header } from "../components/Header";
import { CustomersUsageChart } from "../components/CustomerUsageChart";
import { ActiveCustomersCard } from "../components/ActiveCustomersChart";

const stats = [
  { label: "Points Issued", value: "25K+" },
  { label: "Points Redeemed", value: "35K+" },
  { label: "Active Campaigns", value: "03" },
  { label: "Avg. Redemption Rate", value: "16.6+" },
  { label: "Most Active Tier", value: "Silver" },
];

const Analytics = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen ">
      

      {/* Heading */}
      <div className="flex items-center gap-2 sm:gap-3 text-[20px] sm:text-[25px] font-medium">
        <img src="/analyticshead.png" alt="" className="w-6 sm:w-auto h-6 sm:h-auto" />
        <h1>Analytics</h1>
      </div>

      {/* Scrollable stats */}
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex gap-2 sm:gap-6 min-w-max">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#E8E6D9] rounded-2xl sm:rounded-[32px] 
                         p-3 sm:p-6 shadow-md sm:shadow-lg 
                         w-[140px] xs:w-[160px] sm:w-[220px] lg:w-[180px] 2xl:w-[250px] 
                         h-[120px] xs:h-[140px] sm:h-[200px] 2xl:h-[200px] 
                         lg:h-[170px] flex flex-col flex-shrink-0"
            >
              {/* Heading + arrow */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] xs:text-[12px] sm:text-[12px] 2xl:text-[16px] font-semibold text-black">
                  {stat.label}
                </p>
                <div className="w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] 2xl:w-[48px] 2xl:h-[48px] rounded-full border border-[#2C2A25] flex items-center justify-center">
                  <img src="arrow.png" alt="arrow" className="2xl:h-[25px] 2xl:w-[25px] lg:h-[10px] lg:w-[10px] w-[8px] h-[8px]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center">
                <span className="mt-2 text-[20px] xs:text-[24px] sm:text-[36px] lg:text-[51px] 2xl:text-[60px] font-extrabold text-[#2C2A25]">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
 {/* Responsive charts section */}
<div className="flex flex-col lg:flex-row justify-center items-stretch gap-5 w-full">
  <div className="flex-1">
    <CustomersUsageChart />
  </div>
  <div className="flex-1">
    <ActiveCustomersCard />
  </div>
</div>

    </div>
  );
};

export default Analytics;
