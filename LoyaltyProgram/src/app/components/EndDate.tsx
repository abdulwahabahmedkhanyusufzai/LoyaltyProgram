import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

interface StartDatePickerProps {
  offer: { tillDate: string };
  handleChange: (field: string, value: string) => void;
}

export default function EndDatePicker({ offer, handleChange }: StartDatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1">
      {/* Floating Label */}
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            offer.tillDate || isFocused
              ? "-top-2 text-sm text-gray-700 bg-white px-1"
              : "top-4 text-gray-500 text-base"
          }`}
      >
        Till Date
      </label>

      <DatePicker
        selected={offer.tillDate ? new Date(offer.tillDate) : null}
        onChange={(date: Date | null) =>
          handleChange("tillDate", date ? date.toISOString().split("T")[0] : "")
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
