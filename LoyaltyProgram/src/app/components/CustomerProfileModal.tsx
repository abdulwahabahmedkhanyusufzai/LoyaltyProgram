"use client";

import React from "react";

interface CustomerProfileModalProps {
  customer: {
    id: string;
    name: string;
    email: string;
    points: number;
    orders: number;
    bgColor?: string; // optional profile image URL
  } | null;
  onClose: () => void;
}

const getLoyaltyTier = (points: number) => {
  if (points >= 1000) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 200) return "Silver";
  return "Bronze";
};

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  onClose,
}) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer hover:opacity-65 absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Customer Info */}
        <div className="flex flex-col items-center gap-4">
        <div
                      className="text-[28px] w-[28px] h-[28px] sm:w-[62px] sm:h-[62px] rounded-full flex items-center justify-center text-white font-bold mr-[12px] sm:mr-[20px]"
                      style={{ backgroundColor: customer.bgColor }}
                    >
                      {customer.initial}
                    </div>
          <h2 className="text-xl font-semibold">{customer.name}</h2>
          <p className="text-gray-500">{customer.email}</p>

          <div className="flex gap-4 mt-2">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Points</p>
              <p className="font-semibold">{customer.points}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Orders</p>
              <p className="font-semibold">{customer.orders}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Tier</p>
              <p className="font-semibold">{getLoyaltyTier(customer.points)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileModal;
