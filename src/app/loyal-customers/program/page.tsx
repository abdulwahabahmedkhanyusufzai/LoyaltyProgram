"use client";
import { useState, useEffect } from "react";
import NewOfferModal from "@/app/loyal-customers/program/component/NewOfferModal";
import { Offer } from "@/app/models/Offer";
const Spinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-[#734A00] rounded-full animate-spin"></div>
  </div>
);



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
    setOfferToEdit(null);
    setIsOpen(true);
  };

  // 🔍 Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/offers");
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        console.log(data,"offer array")
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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6 bg-white">
      <div className="rounded-2xl border border-black p-4 sm:p-6 w-full max-w-4xl flex flex-col gap-6 bg-[#fffef9] shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/PremiumLoyalty.png"
              alt="Premium Loyalty"
              className="h-10 w-10"
            />
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C2A25]">
              Discount & Special Offers
            </h2>
          </div>
          <button
            onClick={handleCreateNew}
            className="w-full sm:w-auto bg-[#734A00] text-white text-sm px-6 h-11 rounded-full hover:bg-[#5a3900] transition-colors duration-200"
          >
            Create New Offer
          </button>
        </div>

        {/* Offers Card */}
        <div className="rounded-2xl bg-[#E8E6D9] p-4 sm:p-6 shadow-md w-full">
          <h2 className="text-lg font-semibold text-[#2C2A25] mb-4">
            Loyalty Program
          </h2>

          {/* Offers List */}
          <div className="flex flex-col divide-y divide-[#D2D1CA] w-full">
            {loading ? (
              <Spinner />
            ) : offers.length === 0 ? (
              <p className="text-center py-6 text-gray-500 text-sm">
                No offers available. Click “Create New Offer” to add one.
              </p>
            ) : (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 hover:bg-[#ECE9DF] rounded-lg transition"
                >
                  {/* Image */}
                  {offer.image ? (
                    <div
                      className="rounded-full min-w-[50px] aspect-square bg-center bg-cover bg-no-repeat"
                      style={{ backgroundImage: `url(${offer.image})` }}
                    />
                  ) : (
                    <div className="rounded-full min-w-[50px] aspect-square bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      No Img
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex flex-col items-start justify-center flex-1 text-left">
                    <h1 className="text-sm sm:text-base font-semibold text-[#2C2A25]">
                      {offer.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#757575] break-words max-w-full sm:max-w-[70%]">
                      {offer.description}
                    </p>
                  </div>

                  {/* Edit Button */}
                  <button
                    className="cursor-pointer w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-1 px-4 py-2 text-xs sm:text-sm font-medium border border-black rounded-full text-black hover:bg-black hover:text-white transition"
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

      {/* Modal */}
      <NewOfferModal
        closeModal={closeModal}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        offerToEdit={offerToEdit}
      />
    </div>
  );
};

export default ProgramLoyal2;
