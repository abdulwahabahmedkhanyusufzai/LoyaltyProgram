"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Helper function to get the number of days in a month (for Aug, Sep, Oct, Nov, Dec)
const getDaysInMonth = (monthStr: string, year: number) => {
  // Map month string to 0-indexed month number for Date object
  const monthMap: { [key: string]: number } = {
    "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  const monthIndex = monthMap[monthStr];
  
  // Date object automatically handles the last day of the month when you pass 0 as the day
  return new Date(year, monthIndex + 1, 0).getDate();
};

// Helper function to get the weekday index of the first day of the month (0=Sun, 1=Mon, etc.)
const getFirstDayOfWeek = (monthStr: string, year: number) => {
  const monthMap: { [key: string]: number } = {
    "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  const monthIndex = monthMap[monthStr];
  
  // Day 1 of the month
  return new Date(year, monthIndex, 1).getDay();
};

function AdventCalendar() {
  const currentYear = new Date().getFullYear(); 

  const [month, setMonth] = useState("Aug");
  const [isEditable, setIsEditable] = useState(false); // New state for edit mode toggle

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

  // --- Calculated Calendar State ---
  const daysInCurrentMonth = getDaysInMonth(month, currentYear);
  const startDayOfWeek = getFirstDayOfWeek(month, currentYear); // 0 (Sun) to 6 (Sat)
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Array of days including null placeholders for alignment
  const calendarDays = Array.from({ length: startDayOfWeek }, () => null).concat(days);
  // --- End Calculated Calendar State ---


  const handleChange = (day: number, field: "event" | "type", value: string) => {
    setCalendarData((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveCalendar = async () => {
    try {
      setSaving(true);
      // NOTE: Replace '/api/save-calendar' with your actual API endpoint
      const res = await fetch("/api/save-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, calendarData }),
      });
      if (!res.ok) throw new Error("Failed to save calendar");
      toast("Calendar saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving calendar");
    } finally {
      setSaving(false);
    }
  };

  const fetchCalendarData = async (selectedMonth: string) => {
    // NOTE: Replace '/api/get-calendar' with your actual API endpoint
    const res = await fetch(`/api/get-calendar?month=${selectedMonth}`);
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

  // Function to enter editing mode only if isEditable is true
  const handleDayClick = (day: number) => {
    if (isEditable) {
      setEditingDay(day);
    }
  };


  return (
    <div className="p-4 sm:p-7 space-y-6 bg-[#fffef9] min-h-screen">
      <div className="max-w-5xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-start items-center gap-2">
            <img alt="" src="PremiumLoyalty.png" className="h-[37px] w-[37px]" />
            <h2 className="text-xl font-semibold text-gray-800">Advent Calendar</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Edit Toggle Button */}
            <button
              onClick={() => {
                setIsEditable(!isEditable);
                setEditingDay(null); // Exit any active day edit mode
              }}
              className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                isEditable 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isEditable ? "Exit Edit Mode" : "Edit Calendar"}
            </button>

            {/* Month Selector */}
            <select
              value={month}
              onChange={(e) => {
                  setMonth(e.target.value);
                  setEditingDay(null);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:ring-2 focus:ring-yellow-500"
              disabled={isEditable} // Disable month change while actively editing
            >
              <option>Aug</option>
              <option>Sep</option>
              <option>Oct</option>
              <option>Nov</option>
              <option>Dec</option>
            </select>
          </div>
        </div>
        
        {/* Calendar Grid Header (Weekdays) */}
        <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-gray-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center">{day}</div>
            ))}
        </div>

        {/* Calendar Grid (Days) */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
                return <div key={idx} className="h-[60px] lg:h-24"></div>;
            }

            const info = calendarData[day];
            const isEditing = editingDay === day;
            const cursorStyle = isEditable ? "cursor-pointer" : "cursor-default";


            return (
              <div
                key={day}
                className={`relative border p-2 text-center text-sm h-[60px] lg:h-24 flex flex-col justify-between transition-colors ${cursorStyle} ${
                  info 
                    ? "bg-[#734A00] text-white border-[#734A00]" 
                    : "bg-[#fdfdf9] text-[#8B8B8B] " + (isEditable ? "hover:bg-gray-50" : "")
                }`}
                onClick={() => handleDayClick(day)} // Use new conditional click handler
              >
                {/* Day label */}
                <div className="text-xs font-medium self-end">
                  <span className="font-bold">{day}</span>
                </div>

                {/* Event or Input */}
                {isEditing ? (
                  <div className="flex flex-col gap-1 z-10 p-1 absolute inset-0 bg-white shadow-lg text-left">
                    <input
                      type="text"
                      value={info?.event || ""}
                      onChange={(e) => handleChange(day, "event", e.target.value)}
                      placeholder="Event name"
                      className="text-black text-xs px-1 py-0.5 rounded border border-gray-300 w-full" 
                      onClick={(e) => e.stopPropagation()}
                    />
                    <select
                      value={info?.type || "discount"}
                      onChange={(e) => handleChange(day, "type", e.target.value)}
                      className="text-black text-xs px-1 py-0.5 rounded border border-gray-300 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="discount">Discount</option>
                      <option value="cashback">Cashback</option>
                      <option value="loyalty">Loyalty</option>
                    </select>
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setEditingDay(null);
                      }}
                      className="mt-1 text-[10px] bg-[#734A00] text-white rounded px-1 py-0.5 hover:bg-[#5a3600]"
                    >
                      Done
                    </button>
                  </div>
                ) : info ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="font-bold text-center text-sm p-1 leading-tight">{info.event}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Add Event</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveCalendar}
            disabled={saving || !isEditable} // Disable save button unless in edit mode
            className="bg-[#734A00] text-white px-4 py-2 rounded-lg hover:bg-[#5a3600] disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdventCalendar;