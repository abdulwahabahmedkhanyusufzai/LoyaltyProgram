'use client';
import React from 'react';
import {offers} from "../data/customData"


export const LoyaltyProgram = () => {
  return (
    <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
      {offers.map((offer, idx) => (
        <div key={idx} className="flex items-center gap-8 ">
          <button className="p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25] transition">
            <img
              src={offer.src}
              alt={offer.alt}
              className="2xl:h-[60px] 2xl:w-[60px] lg:h-[35px] lg:w-[35px] w-[30px] h-[30px] object-cover rounded-full"
            />
          </button>
          <div className="flex flex-col items-start justify-center">
            <h1 className="2xl:text-[14px] lg:text-[12px] text-[9px] font-semibold text-[#2C2A25]">
              {offer.title}
            </h1>
            <p className="lg:text-[11px] 2xl:text-[13px] text-[6px] text-[#757575]">
              {offer.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

