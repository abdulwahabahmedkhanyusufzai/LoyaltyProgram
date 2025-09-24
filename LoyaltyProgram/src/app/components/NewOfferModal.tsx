"use client";
import { useEffect, useRef, useState } from "react";
import { FloatingInput } from "./FloatingInput";
import { FloatingTextarea } from "./FloatingTextArea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Offer } from "../models/Offer";
import { OfferService } from "../utils/OfferService";
import toast from "react-hot-toast";

const TIER_OPTIONS = ["Bronze", "Silver", "Gold"];
const OFFER_TYPES = [
  { label: "Discount", value: "DISCOUNT" },
  { label: "Cashback", value: "CASHBACK" },
  { label: "Buy One Get One", value: "BOGO" },
];

const NewOfferModal = ({ closeModal, isOpen, setIsOpen, offerToEdit }) => {
  const [offer, setOffer] = useState(new Offer());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const [showOfferTypeDropdown, setShowOfferTypeDropdown] = useState(false);

  useEffect(() => {
    if (offerToEdit) {
      const cleanTiers = offerToEdit.tierRequired?.replace(/"/g, "") || "";

      setOffer(
        new Offer({
          offerName: offerToEdit.name,
          description: offerToEdit.description,
          points: offerToEdit.pointsCost,
          startDate: offerToEdit.startDate,
          tillDate: offerToEdit.endDate,
          eligibleTiers: cleanTiers,
          image: offerToEdit.image ?? null,
          offerType: offerToEdit.offerType,
        })
      );
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
    setLoading(true);
    try {
      const isUpdate = !!offerToEdit?.id;
      console.log("Submitting offer:", offer, "isUpdate:", isUpdate);
      console.log("Offer to edit ID:", offerToEdit?.id);
      await OfferService.saveOffer(offer, isUpdate, offerToEdit?.id);

      toast.success(
        isUpdate
          ? "✅ Offer updated successfully!"
          : "✅ Offer created successfully!"
      );
      setIsOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("❌ Error: " + err.message);
      } else {
        toast.error("❌ Error: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke previous generated object URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const obj = URL.createObjectURL(file);
    previewUrlRef.current = obj;

    handleChange("image", file); // store the File on the Offer instance
    setPreview(obj); // show preview
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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
          disabled={loading}
          className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6 scroll-y-auto">
          <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
          <h3 className="text-lg font-semibold">
            {" "}
            {offerToEdit ? "Edit an Offer" : "Create New Offer"}
          </h3>
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
              value={
                offer.points !== undefined && offer.points !== null
                  ? String(offer.points)
                  : ""
              }
              onChange={(e) => handleChange("points", e.target.value)}
            />
            <ErrorMsg field="points" />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={offer.startDate ? new Date(offer.startDate) : null}
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
                  selected={offer.tillDate ? new Date(offer.tillDate) : null}
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
            <div className="flex gap-4">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="cursor-pointer w-full border-[#D2D1CA] text-gray-500 border rounded-full px-4 py-2 text-left"
                >
                  {offer.eligibleTiers
                    ? offer.eligibleTiers
                    : "Select Eligible Tier"}
                </button>

                {showDropdown && (
                  <div className="bottom-20 absolute z-10 mt-1 w-auto bg-white border rounded shadow">
                    {TIER_OPTIONS.map((tier) => (
                      <label
                        key={tier}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="eligibleTier"
                          checked={offer.eligibleTiers === tier}
                          onChange={() => {
                            handleChange("eligibleTiers", tier);
                            setShowDropdown(false);
                          }}
                          className="mr-2"
                        />
                        {tier}
                      </label>
                    ))}
                  </div>
                )}
                <ErrorMsg field="eligibleTiers" />
              </div>

              <div className="flex-1">
                <button
                  type="button"
                  onClick={() =>
                    setShowOfferTypeDropdown(!showOfferTypeDropdown)
                  }
                  className="cursor-pointer w-full border-[#D2D1CA] text-gray-500 border rounded-full px-4 py-2 text-left"
                >
                  {offer.offerType || "Select Offer Type"}
                </button>

                {showOfferTypeDropdown && (
                  <div className="bottom-20 absolute z-10 mt-1 w-auto bg-white border rounded shadow">
                    {OFFER_TYPES.map((type) => (
                      <div
                        key={type.label}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleChange("offerType", type.value);
                          setShowOfferTypeDropdown(false);
                        }}
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                )}
                <ErrorMsg field="offerType" />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`cursor-pointer w-full bg-[#734A00] text-white py-3 rounded-full hover:bg-[#5a3900] transition text-lg font-medium mt-2"  ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#734A00] text-white hover:bg-[#5a3900]"
              }`}
            >
              {loading ? "Saving..." : "Save Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOfferModal;
