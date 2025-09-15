"use client";
import { useState } from "react";
import { FloatingInput } from "./FloatingInput";
import { FloatingTextarea } from "./FloatingTextArea";

const TIER_OPTIONS = ["Bronze", "Silver", "Gold"];

const NewOfferModal = ({ closeModal, isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({
    offerName: "",
    description: "",
    points: "",
    startDate: "",
    tillDate: "",
    eligibleTiers: [] as string[],
    image: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const validateField = (field: string, value) => {
    let error = "";
    if (field === "offerName" && !value.trim()) error = "Offer name is required.";
    if (field === "description" && !value.trim()) error = "Description is required.";
    if (field === "points") {
      const isNumber = /^[1-9]\d*$/.test(value.trim());
      const isPercent = /^([1-9]\d?|100)%$/.test(value.trim());
      if (!isNumber && !isPercent) error = "Enter number (100) or % (20%).";
    }
    if (field === "startDate" || field === "tillDate") {
      if (!value) error = `${field === "startDate" ? "Start Date" : "Till Date"} is required.`;
    }
    if (field === "eligibleTiers") {
      if (!value.length) error = "Select at least one tier.";
    }
    if (field === "image" && !value) error = "Image is required.";
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleTierToggle = (tier: string) => {
    let updatedTiers = [...formData.eligibleTiers];
    if (updatedTiers.includes(tier)) {
      updatedTiers = updatedTiers.filter((t) => t !== tier);
    } else {
      updatedTiers.push(tier);
    }
    handleChange("eligibleTiers", updatedTiers);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(formData).forEach(([key, value]) => validateField(key, value));
    if (Object.values(errors).some((err) => err)) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.offerName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.tillDate);
      if (formData.points) formDataToSend.append("pointsCost", formData.points);
      formData.eligibleTiers.forEach((tier) => formDataToSend.append("tiers", tier));
      if (formData.image) formDataToSend.append("image", formData.image);

      const res = await fetch("/api/offers", { method: "POST", body: formDataToSend });
      if (!res.ok) {
        const error = await res.json();
        alert("❌ Error: " + error.error);
        return;
      }
      alert("✅ Offer created successfully!");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-red-500 text-sm">{errors[field]}</p> : null;

  if (!isOpen) return null;

  return (
    <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-lg lg:max-w-xl relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6 scroll-y-auto">
          <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
          <h3 className="text-lg font-semibold">Create New Offer</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Image */}
          <div className="flex flex-col items-center gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-[100px] w-[100px] object-cover rounded-full border"
              />
            ) : (
              <div className="bg-[#D9D9D9] text-center rounded-full mt-2 w-[100px] h-[100px] flex items-center justify-center border text-black text-sm">
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
              value={formData.offerName}
              onChange={(e) => handleChange("offerName", e.target.value)}
            />
            <ErrorMsg field="offerName" />

            <FloatingTextarea
              id="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <ErrorMsg field="description" />

            <FloatingInput
              id="points"
              placeholder="Points Cost / % Discount"
              value={formData.points}
              onChange={(e) => handleChange("points", e.target.value)}
            />
            <ErrorMsg field="points" />

            <div className="flex gap-4">
              <FloatingInput
                id="startDate"
                placeholder="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="flex-1"
              />
              <FloatingInput
                id="tillDate"
                placeholder="Till Date"
                type="date"
                value={formData.tillDate}
                onChange={(e) => handleChange("tillDate", e.target.value)}
                className="flex-1"
              />
            </div>
            <ErrorMsg field="startDate" />
            <ErrorMsg field="tillDate" />

            {/* Multi-select Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full border rounded px-4 py-2 text-left"
              >
                {formData.eligibleTiers.length
                  ? formData.eligibleTiers.join(", ")
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
                        checked={formData.eligibleTiers.includes(tier)}
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
              className="w-full bg-[#734A00] text-white py-3 rounded-full hover:bg-[#5a3900] transition text-lg font-medium mt-2"
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
