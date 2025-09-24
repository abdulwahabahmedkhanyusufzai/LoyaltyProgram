"use client";
import { useState,useEffect } from "react";

function AdventCalendar() {
  const [month, setMonth] = useState("Aug");

  // Editable calendar data
  const [calendarData, setCalendarData] = useState<{
    [key: number]: { event: string; type: string };
  }>({
    2: { event: "10% Off", type: "discount" },
    6: { event: "20% Off", type: "discount" },
    11: { event: "20% Off", type: "discount" },
    18: { event: "10% Off", type: "discount" },
    21: { event: "20% Off", type: "discount" },
  });

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const daysInMonth = 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (dayIndex: number) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[dayIndex % 7];
  };

  const handleChange = (day: number, field: "event" | "type", value: string) => {
    setCalendarData((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveCalendar = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/save-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, calendarData }),
      });
      if (!res.ok) throw new Error("Failed to save calendar");
      alert("Calendar saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving calendar");
    } finally {
      setSaving(false);
    }
  };

 

const fetchCalendarData = async (month: string) => {
  const res = await fetch(`/api/get-calendar?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch calendar");
  const data = await res.json();

  // data.calendarData contains your day-keyed object
  return data.calendarData || {};
};
useEffect(() => {
  const loadCalendar = async () => {
    try {
      const data = await fetchCalendarData(month);
      setCalendarData(data);
    } catch (err) {
      console.error(err);
    }
  };
  loadCalendar();
}, [month]);

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-[#fffef9] min-h-screen">
      <div className="max-w-5xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-start items-center gap-2">
            <img alt="" src="PremiumLoyalty.png" className="h-[37px] w-[37px]" />
            <h2 className="text-xl font-semibold text-gray-800">Advent Calendar</h2>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:ring-2 focus:ring-yellow-500"
          >
            <option>Aug</option>
            <option>Sep</option>
            <option>Oct</option>
            <option>Nov</option>
            <option>Dec</option>
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="grid lg:grid-cols-7 grid-cols-3 gap-2">
          {days.map((day, idx) => {
            const info = calendarData[day];
            const isEditing = editingDay === day;

            return (
              <div
                key={day}
                className={`relative border p-2 text-center text-sm h-[60px] lg:h-24 flex flex-col justify-between cursor-pointer ${
                  info ? "bg-[#734A00] text-white" : "bg-[#fdfdf9] text-[#8B8B8B]"
                }`}
                onClick={() => setEditingDay(day)}
              >
                {/* Day label */}
                <div className="text-xs font-medium">
                  {getDayName(idx)} <br />
                  <span className="font-bold">{day}</span>
                </div>

                {/* Event */}
                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={info?.event || ""}
                      onChange={(e) => handleChange(day, "event", e.target.value)}
                      placeholder="Event name"
                      className="text-black text-xs px-1 py-0.5 rounded"
                    />
                    <select
                      value={info?.type || "discount"}
                      onChange={(e) => handleChange(day, "type", e.target.value)}
                      className="text-black text-xs px-1 py-0.5 rounded"
                    >
                      <option value="discount">Discount</option>
                      <option value="cashback">Cashback</option>
                      <option value="loyalty">Loyalty</option>
                    </select>
                    <button
                      onClick={() => setEditingDay(null)}
                      className="mt-1 text-[10px] bg-gray-200 rounded px-1"
                    >
                      Done
                    </button>
                  </div>
                ) : info ? (
                  <div>
                    <p className="font-bold">{info.event}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Nothing To Do</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveCalendar}
            disabled={saving}
            className="bg-[#734A00] text-white px-4 py-2 rounded-lg hover:bg-[#5a3600] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdventCalendar;
