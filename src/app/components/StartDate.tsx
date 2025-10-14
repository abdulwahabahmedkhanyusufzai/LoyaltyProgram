import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

interface StartDatePickerProps {
  offer: { startDate: string };
  handleChange: (field: string, value: string) => void;
}

export default function StartDatePicker({ offer, handleChange }: StartDatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1">
      {/* Floating Label */}
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            offer.startDate || isFocused
              ? "-top-2 text-sm text-gray-700 bg-white px-1"
              : "top-4 text-gray-500 text-base"
          }`}
      >
        Start Date
      </label>

      <DatePicker
        selected={offer.startDate ? new Date(offer.startDate) : null}
        onChange={(date: Date | null) =>
          handleChange("startDate", date ? date.toISOString().split("T")[0] : "")
        }
        dateFormat="yyyy-MM-dd"
        className="peer w-full border border-gray-300 rounded-full bg-white px-4 py-2 mt-1 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
        placeholderText=""
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
