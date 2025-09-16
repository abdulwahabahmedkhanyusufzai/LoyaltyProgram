"use client";
import { useEffect, useState } from "react";
import { FloatingInput } from "./FloatingInput";
import { FloatingTextarea } from "./FloatingTextArea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Offer } from "../models/Offer";
import { OfferService } from "../utils/OfferService";

const TIER_OPTIONS = ["Bronze", "Silver", "Gold"];

const NewOfferModal = ({ closeModal, isOpen, setIsOpen,offerToEdit }) => {
  const [offer, setOffer] = useState(new Offer());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    if (offerToEdit) {
      setOffer(new Offer({
        offerName: offerToEdit.name,
        description: offerToEdit.description,
        points: offerToEdit.pointsCost,
        startDate: offerToEdit.startDate,
        tillDate: offerToEdit.endDate,
        eligibleTiers: offerToEdit.tiers,
      }));
      setPreview(offerToEdit.image || null);
    } else {
      setOffer(new Offer());
      setPreview(null);
    }
  }, [offerToEdit]);

  
const handleChange = (
  field: keyof Offer,
  value: string | number | File | string[] | null
) => {
  const updated = new Offer({ ...offer, [field]: value });
  setOffer(updated);
  setErrors((prev) => ({ ...prev, [field]: updated.validateField(field) }));
};

   const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const validationErrors = offer.validateAll();
  setErrors(validationErrors);
  if (Object.keys(validationErrors).length > 0) return;

  try {
    const isUpdate = !!offerToEdit?.id;
    await OfferService.saveOffer(offer, isUpdate, offerToEdit?.id);

    alert(isUpdate ? "✅ Offer updated successfully!" : "✅ Offer created successfully!");
    setIsOpen(false);
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert("❌ Error: " + err.message);
    } else {
      alert("❌ Error: " + String(err));
    }
  }
};


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    handleChange("image", file);
    setPreview(URL.createObjectURL(file));
  }
};

const handleTierToggle = (tier: string) => {
  const updatedTiers = offer.eligibleTiers.includes(tier)
    ? offer.eligibleTiers.filter((t) => t !== tier)
    : [...offer.eligibleTiers, tier];

  handleChange("eligibleTiers", updatedTiers);
};


  if (!isOpen) return null;

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm">{errors[field]}</p>
    ) : null;

  if (!isOpen) return null;

  return (
    <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-lg lg:max-w-xl relative">
        <button
          onClick={closeModal}
          className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6 scroll-y-auto">
          <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
          <h3 className="text-lg font-semibold">Create New Offer</h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Left: Image */}
          <div className="flex flex-col items-center gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-[100px] w-[100px] object-cover rounded-full border"
              />
            ) : (
              <div className="bg-[#D9D9D9] border-[#D2D1CA] text-center rounded-full mt-2 w-[100px] h-[100px] flex items-center justify-center border text-black text-sm">
                Offer Image
              </div>
            )}
            <label
              htmlFor="offerImage"
              className="cursor-pointer bg-[#734A00] text-white py-2 px-6 rounded-full hover:bg-[#5a3900] transition text-sm font-medium"
            >
              Upload Image
            </label>
            <input
              id="offerImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <ErrorMsg field="image" />
          </div>

          {/* Right: Full-width Inputs */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <FloatingInput
              id="offerName"
              placeholder="Offer Name"
              value={offer.offerName}
              onChange={(e) => handleChange("offerName", e.target.value)}
            />
            <ErrorMsg field="offerName" />

            <FloatingTextarea
              id="description"
              placeholder="Description"
              value={offer.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <ErrorMsg field="description" />

            <FloatingInput
              id="points"
              placeholder="Points Cost / % Discount"
              value={offer.points !== undefined && offer.points !== null ? String(offer.points) : ""}
              onChange={(e) => handleChange("points", e.target.value)}
            />
            <ErrorMsg field="points" />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={
                    offer.startDate ? new Date(offer.startDate) : null
                  }
                  onChange={(date: Date | null) =>
                    handleChange(
                      "startDate",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  dateFormat="yyyy-MM-dd"
                  className="w-full border rounded-full px-4 py-2"
                  placeholderText="Select Start Date"
                />
                <ErrorMsg field="startDate" />
              </div>

              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1">
                  Till Date
                </label>
                <DatePicker
                  selected={
                    offer.tillDate ? new Date(offer.tillDate) : null
                  }
                  onChange={(date: Date | null) =>
                    handleChange(
                      "tillDate",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  dateFormat="yyyy-MM-dd"
                  className="w-full border rounded-full px-4 py-2"
                  placeholderText="Select Till Date"
                />
                <ErrorMsg field="tillDate" />
              </div>
            </div>

            {/* Multi-select Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="cursor-pointer w-full border-[#D2D1CA] text-gray-500 border rounded-full px-4 py-2 text-left"
              >
                {offer.eligibleTiers.length
                  ? offer.eligibleTiers.join(", ")
                  : "Select Eligible Tiers"}
              </button>
              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
                  {TIER_OPTIONS.map((tier) => (
                    <label
                      key={tier}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={offer.eligibleTiers.includes(tier)}
                        onChange={() => handleTierToggle(tier)}
                        className="mr-2"
                      />
                      {tier}
                    </label>
                  ))}
                </div>
              )}
              <ErrorMsg field="eligibleTiers" />
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-[#734A00] text-white py-3 rounded-full hover:bg-[#5a3900] transition text-lg font-medium mt-2"
            >
              Save Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOfferModal;
