"use client";

import React, { useEffect, useState } from "react";

const COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
];

function getRandomColor(seed: string) {
  // Use the seed (like email or name) to pick consistent random color
  const index = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  return COLORS[index];
}
// Reusable item component
const CustomerItem = ({ name, email }: { name: string; email: string }) => {
  
  const initial = (name?.trim()?.[0] || email?.[0] || "?").toUpperCase();
    const bgColor = getRandomColor(name || email);
  return(
  <div className="flex items-center gap-3 xl:gap-4 mb-1 mt-1">
     <div className="flex items-center justify-center rounded-full min-w-[50px] aspect-square bg-[#2C2A25] text-white text-lg font-bold"
     style={{backgroundColor:bgColor}}>
        {initial}
      </div>
    <div className="flex flex-col items-start justify-center">
      <h1 className="text-[10px] 2xl:text-[14px] lg:text-[12px] font-semibold text-[#2C2A25]">
        {name}
      </h1>
      <p className="text-[10px] lg:text-[11px] 2xl:text-[13px] text-[#757575]">{email}</p>
    </div>
  </div>

)
};

const SkeletonOffer = () => (
  <div className="flex items-center gap-8 animate-pulse">
    {/* Image Circle Placeholder */}
    <div className="rounded-full min-w-[50px] aspect-square bg-gray-300" />

    {/* Text Placeholder */}
    <div className="flex flex-col gap-2 w-full">
      <div className="h-3 w-24 bg-gray-300 rounded" />
      <div className="h-2 w-35 bg-gray-200 rounded" />
    </div>
  </div>
);

export const LoyalCustomer = () => {
  const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?first=3`); // ✅ you can adjust your API to support ?first=3
        const data = await res.json();
       
        if (data.customers) {
          const formatted = data.customers.slice(0,3).map((c: any) => ({
            name: `${c.firstName ?? ""} ${c.lastName ?? ""}`,
            email: c.email ?? "N/A",
            src: "/default-avatar.png", // Shopify doesn’t provide profile pics, use placeholder
          }));
          setCustomers(formatted);
        }
      } catch (err) {
        console.error("❌ Error fetching customers:", err);
      }finally{
        setLoading(false)
      }
    };

    fetchCustomers();
  }, []);
  
    
  return (
    <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
      {loading ? (
  <>
    <SkeletonOffer />
    <SkeletonOffer />
    <SkeletonOffer />
  </>
) : (
  customers.map((customer, index) => (
    <CustomerItem key={index} {...customer} />
  ))
)}

    </div>
  );
};
