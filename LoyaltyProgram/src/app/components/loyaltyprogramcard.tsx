'use client';
import React, { useEffect, useState } from 'react';

const Spinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-[#734A00] rounded-full animate-spin"></div>
  </div>
);

type Offer = {
  image: string;
  name: string;
  description: string;
};

export const LoyaltyProgram = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchOffers = async () => {
        try {
          const res = await fetch("/api/offers");
          if (!res.ok) throw new Error("Failed to fetch offers");
          const data = await res.json();
          setOffers(data.offers || []);
        } catch (err) {
          console.error("❌ Error fetching offers:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOffers();
    }, []);
  return (
    <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
      <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
        {loading ? (
          <Spinner />
        ) : offers.length === 0 ? (
          <Spinner />
        ) : (
          offers.map((offer, idx) => (
            <div key={idx} className="flex items-center gap-8 ">
              <button
                className="rounded-full min-w-[50px] aspect-square bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${offer.image})` }}
              />                
              <div className="flex flex-col items-start justify-center">
                <h1 className="2xl:text-[14px] lg:text-[11px] text-[9px] font-semibold text-[#2C2A25]">
                  {offer.name}
                </h1>
                <p className="lg:text-[10px] 2xl:text-[13px] text-[6px] text-[#757575]">
                  {offer.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

