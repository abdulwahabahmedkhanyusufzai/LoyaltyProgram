"use client";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const PremiumLoyaltyProgram = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Data state
  const [tiers, setTiers] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // fetching
  const [saving, setSaving] = useState(false); // saving

  // ✅ Fetch data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/loyalty-program");
        const data = await res.json();
        if (data.success) {
          setTiers(data.program.tiers);
          setRows(data.program.rows);
          toast.success("Loyalty Program loaded 🎉");
        } else {
          toast.error("Failed to load program");
        }
      } catch (err) {
        console.error("🔥 Error fetching program:", err);
        toast.error("Error fetching program");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Table scrolling
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

  // ✅ Edit table cell
  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx].values[colIdx] = value;
    setRows(updatedRows);
  };

  // ✅ Save API call
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/loyalty-program/1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers, rows }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Program updated successfully ✅");
        setIsEditing(false);
      } else {
        toast.error("Update failed ❌");
      }
    } catch (err) {
      console.error("🔥 Error saving program:", err);
      toast.error("Error saving program");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Circle loader for fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`border rounded-[20px] sm:rounded-[25px] px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] flex items-center gap-2 transition ${
                  saving
                    ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                    : "bg-[#734A00] border-[#734A00] text-white hover:bg-[#734A00]"
                }`}
              >
                {saving && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {saving ? "Saving..." : "Save"}
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
                  {row.values.map((val: string, colIdx: number) => (
                    <td
                      key={colIdx}
                      style={{ color: tiers[colIdx]?.color }}
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
