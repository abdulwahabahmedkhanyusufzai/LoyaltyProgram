"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import toast from "react-hot-toast";

// Helper functions
const monthMap: Record<string, number> = { "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11 };

const getDaysInMonth = (monthStr: string, year: number) =>
  new Date(monthMap[monthStr]! + 1, year, 0).getDate();

const getFirstDayOfWeek = (monthStr: string, year: number) =>
  new Date(year, monthMap[monthStr]!, 1).getDay();

function AdventCalendar() {
  const t = useTranslations(); // Translation hook
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState("Aug");
  const [isEditable, setIsEditable] = useState(false);
  const [calendarData, setCalendarData] = useState<Record<number, { event: string; type: string }>>({});
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const daysInCurrentMonth = getDaysInMonth(month, currentYear);
  const startDayOfWeek = getFirstDayOfWeek(month, currentYear);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  const calendarDays = Array.from({ length: startDayOfWeek }, () => null).concat(days);

  const handleChange = (day: number, field: "event" | "type", value: string) => {
    setCalendarData(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const formatDayWithSuffix = (day: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = day % 100;
    return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const handleSaveCalendar = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/save-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, calendarData }),
      });
      if (!res.ok) throw new Error(t("errors.failedToSave"));
      toast.success(t("messages.calendarSaved"));
    } catch (err) {
      console.error(err);
      toast.error(t("errors.failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  const fetchCalendarData = async (selectedMonth: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-calendar?month=${selectedMonth}`);
      if (!res.ok) throw new Error(t("errors.failedToLoadCalendar"));
      const data = await res.json();
      setCalendarData(data.calendarData || {});
    } catch (err) {
      console.error(err);
      toast.error(t("errors.failedToLoadCalendar"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendarData(month); }, [month]);

  const handleDayClick = (day: number) => { if (isEditable) setEditingDay(day); };

  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(d => t(`weekdays.${d}`));
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec"].map(m => t(`months.${m}`));

  if (loading) {
    return (
      <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-[#fffef9] min-h-screen">
      <div className="max-w-5xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-start items-center gap-2">
            <img alt="" src="PremiumLoyalty.png" className="h-[37px] w-[37px]" />
            <h2 className="text-xl font-semibold text-gray-800">{t("title")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsEditable(!isEditable); setEditingDay(null); }}
              className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${isEditable ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {isEditable ? t("buttons.exitEdit") : t("buttons.editCalendar")}
            </button>
            <select
              value={month}
              onChange={e => { setMonth(e.target.value); setEditingDay(null); }}
              className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:ring-2 focus:ring-yellow-500"
              disabled={isEditable}
            >
              {months.map((m, i) => <option key={i} value={["Aug", "Sep", "Oct", "Nov", "Dec"][i]}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-gray-500 mb-2">
          {weekdays.map((d, i) => <div key={i}>{d}</div>)}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-6">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={idx}></div>;
            const info = calendarData[day];
            const isEditing = editingDay === day;
            const cursorStyle = isEditable ? "cursor-pointer" : "cursor-default";

            return (
              <div
                key={day}
                className={`relative border-[0.8px] p-2 text-center text-sm border-[#E3E3E3] h-[60px] lg:h-24 flex flex-col justify-between transition-colors ${cursorStyle} ${info ? "bg-[#734A00] text-white border-[#734A00]" : "bg-[#fdfdf9] text-[#8B8B8B]" + (isEditable ? "hover:bg-gray-50" : "")
                  }`}
                onClick={() => handleDayClick(day)}
              >
                <div className={`flex justify-between text-[13px] font-semibold ${info ? "text-white" : "text-black"}`}>
                  <div className="flex justify-start items-start">
                    {weekdays[(startDayOfWeek + day - 1) % 7]}
                  </div>
                  {info && (
                    <div className="flex items-end justify-end pointer-events-none">
                      <p className="flex justify-end font-bold text-center text-[11px] px-2 py-1 leading-tight text-black bg-white rounded-full">{info.event}</p>
                    </div>
                  )}
                </div>

                {!info && (
                  <div className="flex items-center justify-center pointer-events-none">
                    <p className="flex justify-center font-bold text-center text-[11px] px-2 py-1 leading-tight text-[#8B8B8B] rounded-full">{t("messages.nothingToDo")}</p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex flex-col gap-1 z-10 p-1 absolute inset-0 bg-white shadow-lg text-left">
                    <input
                      type="text"
                      value={info?.event || ""}
                      onChange={e => handleChange(day, "event", e.target.value)}
                      placeholder={t("placeholders.eventName")}
                      className="text-black text-xs px-1 py-0.5 rounded border border-gray-300 w-full"
                      onClick={e => e.stopPropagation()}
                    />
                    <select
                      value={info?.type || "discount"}
                      onChange={e => handleChange(day, "type", e.target.value)}
                      className="text-black text-xs px-1 py-0.5 rounded border border-gray-300 w-full"
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="discount">{t("types.discount")}</option>
                      <option value="cashback">{t("types.cashback")}</option>
                      <option value="loyalty">{t("types.loyalty")}</option>
                    </select>
                    <button
                      onClick={e => { e.stopPropagation(); setEditingDay(null); }}
                      className="mt-1 text-[10px] bg-[#734A00] text-white rounded px-1 py-0.5 hover:bg-[#5a3600]"
                    >
                      {t("buttons.done")}
                    </button>
                  </div>
                )}

                <div className={`${info ? "text-white" : "text-black"} flex justify-end items-end`}>
                  <span className="font-bold">{formatDayWithSuffix(day)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveCalendar}
            disabled={saving || !isEditable}
            className="bg-[#734A00] text-white px-4 py-2 rounded-lg hover:bg-[#5a3600] disabled:opacity-50 transition"
          >
            {saving ? t("buttons.saving") : t("buttons.saveCalendar")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdventCalendar;
