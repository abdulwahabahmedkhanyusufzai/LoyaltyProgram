"use client";
import { useState } from "react";
import { offers } from "@/app/data/customData";
import NewOfferModal from "@/app/components/NewOfferModal";

const ProgramLoyal2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      <div className="rounded-2xl border border-black p-6 w-full max-w-4xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img
            src="/PremiumLoyalty.png"
            alt="Premium Loyalty"
            className="h-[40px] w-[40px]"
          />
          <h2 className="text-xl font-semibold text-[#2C2A25]">
            Discount & Special Offers
          </h2>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#E8E6D9] p-6 shadow-md w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-lg font-semibold text-[#2C2A25]">
              Loyalty Program
            </h2>
            <button
              onClick={openModal}
              className="bg-[#734A00] text-white text-sm px-6 h-11 rounded-full 
                         hover:bg-[#5a3900] transition-colors duration-200"
            >
              Create New Offer
            </button>
          </div>

          {/* Offers */}
          <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 hover:bg-[#ECE9DF] rounded-lg transition"
              >
                <button className="p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25] transition">
                  <img
                    src={`/${offer.src}`}
                    alt={offer.alt}
                    className="2xl:h-[60px] 2xl:w-[60px] lg:h-[40px] lg:w-[40px] h-[32px] w-[32px] object-cover rounded-full"
                  />
                </button>

                <div className="flex flex-col items-start justify-center">
                  <h1 className="text-sm font-semibold text-[#2C2A25]">
                    {offer.title}
                  </h1>
                  <p className="text-xs text-[#757575]">{offer.desc}</p>
                </div>

                <button
                  className="ml-auto flex items-center gap-1 px-5 py-1.5 text-xs font-medium
                             border border-black rounded-full text-black
                             hover:bg-black hover:text-white transition"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    <NewOfferModal closeModal={closeModal} isOpen={isOpen} setIsOpen={setIsOpen}/>
    </div>
  );
};

export default ProgramLoyal2;
