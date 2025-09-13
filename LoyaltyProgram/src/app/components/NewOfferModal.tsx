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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ✅ Validation helpers
  const validateField = (field: string, value: string) => {
    let error = "";

    if (field === "offerName" && !value.trim()) {
      error = "Offer name is required.";
    }

    if (field === "description" && !value.trim()) {
      error = "Description is required.";
    }

    if (field === "points") {
      const isNumber = /^[1-9]\d*$/.test(value.trim());
      const isPercent = /^([1-9]\d?|100)%$/.test(value.trim());
      if (!isNumber && !isPercent) {
        error = "Enter a number (e.g. 100) or % up to 100 (e.g. 20%).";
      }
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

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // ✅ Generic change handler with live validation
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submit
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
    });

    if (Object.values(errors).every((err) => !err)) {
      console.log("✅ Form data:", formData);
      alert("Offer created successfully!");
      setIsOpen(false);
    }
  };

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-red-500 text-sm">{errors[field]}</p> : null;

  return (
    <>
      {isOpen && (
        <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <div className="flex flex-col items-center justify-center">
              <img src="/Login.png" className="w-12 h-12" alt="Offer icon" />
              <h3 className="text-lg font-semibold mb-4">Create New Offer</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default NewOfferModal;
