import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

interface ExpiryDatePickerProps {
  form: { expiry: string };
  setForm: React.Dispatch<React.SetStateAction<{ expiry: string }>>;
}

export default function ExpiryDatePicker({ form, setForm }: ExpiryDatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      {/* Floating Label */}
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${form.expiry || isFocused 
            ? "-top-2 text-sm text-gray-700 bg-white px-1" 
            : "top-4 text-gray-500 text-lg"
          }`}
      >
        Expiry Date
      </label>

      <DatePicker
      className="!flex"
        selected={form.expiry ? new Date(form.expiry) : null}
        onChange={(date: Date | null) =>
          setForm((prev) => ({
            ...prev,
            expiry: date ? date.toISOString().split("T")[0] : "",
          }))
        }
        dateFormat="yyyy-MM-dd"
        className="w-full border rounded-full px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        placeholderText=""
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
