import { useState } from "react";

interface FloatingOfferTypeDropdownProps {
  offer: { offerType: string };
  handleChange: (field: string, value: string) => void;
  OFFER_TYPES: { label: string; value: string }[];
  ErrorMsg: React.ComponentType<{ field: string }>;
}

export default function FloatingOfferTypeDropdown({
  offer,
  handleChange,
  OFFER_TYPES,
  ErrorMsg,
}: FloatingOfferTypeDropdownProps) {
  const [showOfferTypeDropdown, setShowOfferTypeDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = Boolean(offer.offerType);

  return (
    <div className="relative flex-1">
      {/* Floating Label */}
      <label
        className={`absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
          ${
            hasValue || isFocused
              ? "-top-2 text-sm text-gray-700 bg-white px-1"
              : "top-[0.9rem] text-gray-500 text-base"
          }`}
      >
        Offer Type
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => {
          setShowOfferTypeDropdown((prev) => !prev);
          setIsFocused(true);
        }}
        onBlur={() => {
          // Close dropdown and reset focus if user clicks outside
          setTimeout(() => setIsFocused(false), 100);
        }}
        className={`w-full text-left border rounded-full px-4 py-[0.75rem] focus:outline-none transition-all duration-150
          ${hasValue ? "text-black" : "text-gray-500"} 
          ${isFocused ? "border-yellow-500 ring-1 ring-yellow-300" : "border-[#D2D1CA]"}
          min-h-[48px]`}
      >
        {hasValue
          ? OFFER_TYPES.find((t) => t.value === offer.offerType)?.label
          : "Select Offer Type"}
      </button>

      {/* Dropdown Menu */}
      {showOfferTypeDropdown && (
        <div className="absolute z-10 bottom-5 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {OFFER_TYPES.map((type) => (
            <div
              key={type.value}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 ${
                offer.offerType === type.value ? "bg-yellow-50 font-medium" : ""
              }`}
              onClick={() => {
                handleChange("offerType", type.value);
                setShowOfferTypeDropdown(false);
                setIsFocused(false);
              }}
            >
              {type.label}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      <ErrorMsg field="offerType" />
    </div>
  );
}
