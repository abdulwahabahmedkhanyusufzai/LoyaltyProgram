"use client";
import { TopSellingProductsVertical } from "../components/VerticalScroller";

const ProgramLoyal2 = () => {

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
           Top Selling Products
          </h2>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#E8E6D9] p-6 shadow-md w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-lg font-semibold text-[#2C2A25]">
              Top Selling Products
            </h2>

          </div>

          {/* Offers List */}
          <TopSellingProductsVertical/>
        </div>
      </div>

    </div>
  );
};

export default ProgramLoyal2;
