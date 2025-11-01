"use client";
import { useState, useEffect } from "react";
import { Offer } from "../../../models/Offer";
import { OfferService } from "../../../utils/OfferService";
import toast from "react-hot-toast";
import OfferImageUploader from "./ui/OfferImageUploader";
import OfferFormFields from "./ui/OfferFormField";

const NewOfferModal = ({ closeModal, isOpen, setIsOpen, offerToEdit }) => {
  const [offer, setOffer] = useState(new Offer());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
console.log("offer to Edit",offerToEdit);
useEffect(() => {
  if (offerToEdit) {
    const mappedOffer = {
      ...offerToEdit,
      offerName: offerToEdit.name || "",
      tillDate: offerToEdit.endDate || "",
    };
    setOffer(new Offer(mappedOffer));
    setPreview(offerToEdit.image || null);
  } else {
    setOffer(new Offer());
    setPreview(null);
  }
}, [offerToEdit, isOpen]);


  const handleChange = (field: keyof Offer, value: any) => {
    const updated = new Offer({ ...offer, [field]: value });
    setOffer(updated);
    setErrors((prev) => ({ ...prev, [field]: updated.validateField(field) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const obj = URL.createObjectURL(file);
    handleChange("image", file);
    setPreview(obj);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("🟡 handleSubmit triggered");

  // Log current offer state
  console.log("➡️ Current offer state:", offer);
  console.log("➡️ offerToEdit:", offerToEdit);

  // Step 1: Validate input
  const validationErrors = offer.validateAll?.() || {};
  console.log("✅ Validation result:", validationErrors);

  setErrors(validationErrors);
  if (Object.keys(validationErrors).length > 0) {
    console.warn("⚠️ Validation failed. Aborting submit.");
    return;
  }

  // Step 2: Start loading
  setLoading(true);
  console.log("⏳ Saving offer...");

  try {
    // Step 3: Save offer
    const isEditing = !!offerToEdit?.id;
    console.log(`📝 Action: ${isEditing ? "Update existing offer" : "Create new offer"}`);
    console.log("🧩 OfferService.saveOffer params:", { offer, isEditing, id: offerToEdit?.id });

    const response = await OfferService.saveOffer(offer, isEditing, offerToEdit?.id);

    // Step 4: Log the service response
    console.log("✅ OfferService response:", response);

    toast.success(isEditing ? "✅ Offer updated!" : "✅ Offer created!");
    setIsOpen(false);
  } catch (err: any) {
    // Step 5: Detailed error logging
    console.error("❌ Error during offer save:", err);
    toast.error("❌ Error: " + (err?.message || String(err)));
  } finally {
    // Step 6: Always cleanup
    setLoading(false);
    console.log("🏁 handleSubmit finished. Loading reset to false.");
  }
};


  if (!isOpen) return null;

  return (
    <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={closeModal}
          disabled={loading}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6">
          <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
          <h3 className="text-lg font-semibold">
            {offerToEdit ? "Edit an Offer" : "Create New Offer"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OfferImageUploader preview={preview} handleImageChange={handleImageChange} errors={errors.image} />
          <OfferFormFields offer={offer} handleChange={handleChange} errors={errors}  loading={loading} handleSubmit={handleSubmit}/>
          <div>
        
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOfferModal;
