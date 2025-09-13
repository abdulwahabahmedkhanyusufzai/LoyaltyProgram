"use client"
import { useState } from "react";
import { offers } from "@/app/data/customData";

const ProgramLoyal2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      {/* Discount & Special Offers Section (with border) */}
      <div className="rounded-2xl border border-black p-6 w-full max-w-4xl flex flex-col gap-6">
        {/* Heading (left-aligned) */}
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

        {/* Loyalty Program Card */}
        <div className="rounded-2xl bg-[#E8E6D9] p-6 shadow-md w-full flex flex-col items-center">
          {/* Header */}
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

          {/* Offers list */}
          <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 hover:bg-[#ECE9DF] rounded-lg transition"
              >
                {/* Avatar */}
                <button className="p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25] transition">
                  <img
                    src={`/${offer.src}`}
                    alt={offer.alt}
                    className="2xl:h-[60px] 2xl:w-[60px] lg:h-[40px] lg:w-[40px] h-[32px] w-[32px] object-cover rounded-full"
                  />
                </button>

                {/* Offer Info */}
                <div className="flex flex-col items-start justify-center">
                  <h1 className="text-sm font-semibold text-[#2C2A25]">
                    {offer.title}
                  </h1>
                  <p className="text-xs text-[#757575]">{offer.desc}</p>
                </div>

                {/* Edit Button */}
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

      {/* Modal */}
      {isOpen && (
        <div className="bg-black/40 backdrop-blur-sm fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <div className="flex flex-col items-center justify-center">
              <img src="/Login.png" className="w-12 h-12 text-[#734A00]" alt="" />            
            <h3 className="text-lg font-semibold mb-4">Create New Offer</h3>
            </div>
            <form className="flex flex-col gap-4">
             <div className="relative w-full">
             <input
    type="text"
    id="offerName"
    placeholder="Offer Name"
    className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
               focus:outline-none focus:ring-2 focus:ring-[#734A00] 
               placeholder-transparent"
  />
  <label
    htmlFor="offerName"
    className="absolute left-4 top-3 text-gray-500 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
               peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
               bg-white px-1 rounded"
  >
    Offer Name
  </label>
</div>

{/* Description */}
<div className="relative w-full">
  <textarea
    id="description"
    placeholder="Description"
    className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
               focus:outline-none focus:ring-2 focus:ring-[#734A00] 
               placeholder-transparent resize-none"
    rows={3}
  />
  <label
    htmlFor="description"
    className="absolute left-4 top-3 text-gray-500 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
               peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
               bg-white px-1 rounded"
  >
    Description
  </label>
</div>

{/* Points Cost / % Discount */}
<div className="relative w-full">
  <input
    type="text"
    id="points"
    placeholder="Points Cost / % Discount"
    className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
               focus:outline-none focus:ring-2 focus:ring-[#734A00] 
               placeholder-transparent"
  />
  <label
    htmlFor="points"
    className="absolute left-4 top-3 text-gray-500 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
               peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
               bg-white px-1 rounded"
  >
    Points Cost / % Discount
  </label>
</div>

            
               {/* Start & Till Dates */}
<div className="flex gap-4">
  {/* Start Date */}
  <div className="relative flex-1">
    <input
      type="text"
      id="startDate"
      className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
                 focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                 placeholder-transparent"
      placeholder="Start Date"
    />
    <label
      htmlFor="startDate"
      className="absolute left-4 top-3 text-gray-500 text-sm transition-all 
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 
                 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:left-3 peer-focus:text-xs 
                 peer-focus:text-[#734A00] bg-[#FFF9EC] px-1 rounded"
    >
      Start Date
    </label>
  </div>

  {/* Till Date */}
  <div className="relative flex-1">
    <input
      type="text"
      id="tillDate"
      className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
                 focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                 placeholder-transparent"
      placeholder="Till Date"
    />
    <label
      htmlFor="tillDate"
      className="absolute left-4 top-3 text-gray-500 text-sm transition-all 
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 
                 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:left-3 peer-focus:text-xs 
                 peer-focus:text-[#734A00] bg-[#FFF9EC] px-1 rounded"
    >
      Till Date
    </label>
  </div>
</div>


             {/* Eligible Tiers */}
<div className="relative w-full">
  <input
    type="text"
    id="eligibleTiers"
    placeholder="Eligible tiers (Bronze / Silver / Gold)"
    className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
               focus:outline-none focus:ring-2 focus:ring-[#734A00] 
               placeholder-transparent"
  />
  <label
    htmlFor="eligibleTiers"
    className="absolute left-4 top-3 text-gray-500 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
               peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
               bg-white px-1 rounded"
  >
    Eligible tiers (Bronze / Silver / Gold)
  </label>
</div>


              <button
                type="submit"
                className="w-full bg-[#734A00] text-white py-3 rounded-full hover:bg-[#5a3900] transition text-lg font-medium mt-2"
              >
                Save Offer
              </button>
            </form>
          </div>
        </div>
      
      )}
    </div>
  );
};

export default ProgramLoyal2;
