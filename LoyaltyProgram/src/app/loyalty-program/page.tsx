"use client";
import React, { useRef, useState } from "react";
import { tiers, rows as initialRows } from "../data/customData";
import { useRouter } from "next/navigation";

const PremiumLoyaltyProgram = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ✅ Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState(initialRows);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // ✅ Update table cell value
  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx].values[colIdx] = value;
    setRows(updatedRows);
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
            <button
              onClick={() => router.push("/loyal-customers/program")}
              className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition"
            >
              <span>Add New</span>
              <span className="text-[14px] sm:text-[18px]">+</span>
            </button>

            {/* Edit / Save Toggle */}
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="border rounded-[20px] sm:rounded-[25px] border-green-600 px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] bg-green-600 text-white hover:bg-green-700 transition"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <p className="my-[15px] text-sm sm:text-base text-[#2C2A25]">
          €10 = 1 point
        </p>

        {/* Table */}
        <div
          ref={scrollRef}
          className="overflow-x-auto lg:overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          <table className="md:min-w-min min-w-max border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm sm:text-[14px] font-semibold text-[#2C2A25]">
                  Advantages
                </th>
                {tiers.map((tier, idx) => (
                  <th
                    key={idx}
                    style={{ color: tier.color }}
                    className="px-3 py-2 text-sm sm:text-[14px] font-semibold md:whitespace-normal whitespace-nowrap"
                  >
                    {tier.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="text-xs sm:text-sm lg:text-[12px] 2xl:text-[14px]"
                >
                  <td className="px-3 py-2 font-medium text-[#2C2A25] whitespace-normal">
                    {row.label}
                  </td>

                  {row.values.map((val, colIdx) => (
                    <td
                      key={colIdx}
                      style={colIdx >= 0 ? { color: tiers[colIdx].color } : {}}
                      className="px-3 py-2 whitespace-normal"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            handleCellChange(rowIdx, colIdx, e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded text-xs sm:text-sm"
                        />
                      ) : (
                        val
                      )}
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
