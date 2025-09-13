"use client";
import { useState } from "react";
import { FloatingInput } from "./FloatingInput";
import { FloatingTextarea } from "./FloatingTextArea";

const NewOfferModal = ({ closeModal, isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({
    offerName: "",
    description: "",
    points: "",
    startDate: "",
    tillDate: "",
    eligibleTiers: "",
    image: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<string | null>(null);

  // ✅ Validation
  const validateField = (field: string, value: any) => {
    let error = "";

    if (field === "offerName" && !value.trim()) error = "Offer name is required.";
    if (field === "description" && !value.trim()) error = "Description is required.";

    if (field === "points") {
      const isNumber = /^[1-9]\d*$/.test(value.trim());
      const isPercent = /^([1-9]\d?|100)%$/.test(value.trim());
      if (!isNumber && !isPercent) error = "Enter number (100) or % (20%).";
    }

    if (field === "startDate" || field === "tillDate") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value.trim())) {
        error = `${field === "startDate" ? "Start Date" : "Till Date"} must be YYYY-MM-DD.`;
      }
    }

    if (field === "eligibleTiers") {
      const allowedTiers = ["bronze", "silver", "gold"];
      const tiers = value
        .split("/")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (!tiers.every((t) => allowedTiers.includes(t))) {
        error = "Tiers must be Bronze / Silver / Gold only.";
      }
    }

    if (field === "image" && !value) error = "Image is required.";

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      validateField("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ Validate everything first
  Object.entries(formData).forEach(([key, value]) => validateField(key, value));
  if (Object.values(errors).some((err) => err)) return;

  try {
    const formDataToSend = new FormData();

    // 🔹 Map your state correctly to API fields
    formDataToSend.append("name", formData.offerName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.tillDate);

    // 🔹 Handle points → could be number or %
    if (formData.points) {
      formDataToSend.append("pointsCost", formData.points);
    }

    // 🔹 Eligible tiers → split into multiple formData entries
    if (formData.eligibleTiers) {
      formData.eligibleTiers
        .split("/")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tier) => formDataToSend.append("tiers", tier));
    }

    // 🔹 Add image file
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    // 🔹 Send to API
    const res = await fetch("/api/offers", {
      method: "POST",
      body: formDataToSend, // no Content-Type, browser sets it automatically
    });

    if (!res.ok) {
      const error = await res.json();
      alert("❌ Error: " + error.error);
      return;
    }

    const data = await res.json();
    console.log("✅ Offer created:", data);
    alert("Offer created successfully!");
    setIsOpen(false);
  } catch (err) {
    console.error("Error submitting offer:", err);
    alert("Something went wrong!");
  }
};



  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-red-500 text-sm">{errors[field]}</p> : null;

  return (
    <>
      {isOpen && (
        <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-2xl lg:max-w-3xl relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <div className="flex flex-col items-center">
              <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
              <h3 className="text-lg font-semibold mb-6">Create New Offer</h3>
            </div>

            {/* ✅ Two-column layout */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Inputs */}
              <div className="flex flex-col gap-4">
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
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                  <FloatingInput
                    id="tillDate"
                    placeholder="Till Date"
                    type="text"
                    value={formData.tillDate}
                    onChange={(e) => handleChange("tillDate", e.target.value)}
                  />
                </div>
                <ErrorMsg field="startDate" />
                <ErrorMsg field="tillDate" />

                <FloatingInput
                  id="eligibleTiers"
                  placeholder="Eligible tiers (Bronze / Silver / Gold)"
                  value={formData.eligibleTiers}
                  onChange={(e) => handleChange("eligibleTiers", e.target.value)}
                />
                <ErrorMsg field="eligibleTiers" />

                <button
                  type="submit"
                  className="w-full bg-[#734A00] text-white py-3 rounded-full hover:bg-[#5a3900] transition text-lg font-medium mt-2"
                >
                  Save Offer
                </button>
              </div>

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

  {/* Styled file input, no "No file chosen" text */}
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

            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default NewOfferModal;
