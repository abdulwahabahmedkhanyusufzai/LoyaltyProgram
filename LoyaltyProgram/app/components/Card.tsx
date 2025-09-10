// components/Card.tsx
import React from 'react';

interface CardProps {
  label: string;
  isDark?: boolean; // Keep for flexibility if needed elsewhere, but not used here
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ label, children }) => {
  // These cards are all light-themed based on the screenshot
  const bgColor = "bg-[#E8E6D9]"; // Consistent light background for these cards
  const textColor = "text-[#2C2A25]"; // Dark text color

  return (
    <div
      className={`${bgColor} rounded-[32px] p-6 shadow-md w-auto h-auto flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4"> {/* Added margin-bottom */}
        <p className={`${textColor} text-[18px] font-semibold`}>
          {label}
        </p>
        {/* The arrow icon is not present in these cards, so we'll remove it or make it optional */}
        {/* If you ever need an arrow in a Card, you can add an 'hasArrow' prop */}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};