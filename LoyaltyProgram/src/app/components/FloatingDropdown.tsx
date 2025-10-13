import { useState } from "react";

interface FloatingDropdownProps {
  offer: { eligibleTiers: string };
  handleChange: (field: string, value: string) => void;
  TIER_OPTIONS: string[];
  ErrorMsg: React.ComponentType<{ field: string }>;
}

export default function FloatingDropdown({
  offer,
  handleChange,
  TIER_OPTIONS,
  ErrorMsg,
}: FloatingDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = Boolean(offer.eligibleTiers);

  return (
    <div className="relative flex-1">
      {/* Floating Label */}
      <label
        className={`absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
          ${
            hasValue || isFocused
              ? "-top-2 text-sm text-gray-700 bg-white"
              : "top-3.5 text-gray-500 text-base"
          }`}
        style={{
          padding: "0 0.25rem",
          lineHeight: "1rem",
        }}
      >
        Eligible Tier
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => {
          setShowDropdown(!showDropdown);
          setIsFocused(!showDropdown);
        }}
        className={`w-full text-left border rounded-full px-4 py-[10px] focus:outline-none transition-all duration-150
          ${hasValue ? "text-black" : "text-gray-500"} 
          ${isFocused ? "border-yellow-500 ring-1 ring-yellow-300" : "border-[#D2D1CA]"}
          min-h-[42px]`} // 👈 ensures same height always
      >
        {offer.eligibleTiers || <span className="invisible">placeholder</span>}
        {/* 👆 keeps the element height consistent before value selection */}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute z-10 bottom-5 mt-0 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {TIER_OPTIONS.map((tier) => (
            <label
              key={tier}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="radio"
                name="eligibleTier"
                checked={offer.eligibleTiers === tier}
                onChange={() => {
                  handleChange("eligibleTiers", tier);
                  setShowDropdown(false);
                  setIsFocused(false);
                }}
                className="mr-2 accent-yellow-500"
              />
              {tier}
            </label>
          ))}
        </div>
      )}

      <ErrorMsg field="eligibleTiers" />
    </div>
  );
}
