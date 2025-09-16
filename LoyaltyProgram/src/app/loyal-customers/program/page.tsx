"use client";
import { useState, useEffect } from "react";
import NewOfferModal from "@/app/components/NewOfferModal";

const Spinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-[#734A00] rounded-full animate-spin"></div>
  </div>
);


type Offer = {
  id: string | number;
  name: string;
  description: string;
  image?: string;
};

const ProgramLoyal2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleEdit = (offer: Offer) => {
  setOfferToEdit(offer);
  setIsOpen(true);
};

  const handleCreateNew = () => {
  setOfferToEdit(null); // No offer, we are creating a new one
  setIsOpen(true);
};
  // 🔍 Fetch offers from API
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
              onClick={handleCreateNew}
              className="cursor-pointer bg-[#734A00] text-white text-sm px-6 h-11 rounded-full 
                         hover:bg-[#5a3900] transition-colors duration-200"
            >
              Create New Offer
            </button>
          </div>

          {/* Offers List */}
          <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
            {loading ? (
            <Spinner/>
            ) : offers.length === 0 ? (
<Spinner/>
            ) : (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center gap-4 py-3 hover:bg-[#ECE9DF] rounded-lg transition"
                >
                  {/* Image */}
                   <button
                className="rounded-full min-w-[50px] aspect-square bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${offer.image})` }}
              />    

                  {/* Text */}
                  <div className="flex flex-col items-start justify-center">
                    <h1 className="text-sm font-semibold text-[#2C2A25]">
                      {offer.name}
                    </h1>
                    <p className="text-xs text-[#757575]">
                      {offer.description}
                    </p>
                  </div>

                  {/* Edit Button */}
                  <button
                    className="cursor-pointer ml-auto flex items-center gap-1 px-5 py-1.5 text-xs font-medium
                               border border-black rounded-full text-black
                               hover:bg-black hover:text-white transition"
                  onClick={() => handleEdit(offer)}
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NewOfferModal closeModal={closeModal} isOpen={isOpen} setIsOpen={setIsOpen}  offerToEdit={offerToEdit}/>
    </div>
  );
};

export default ProgramLoyal2;
