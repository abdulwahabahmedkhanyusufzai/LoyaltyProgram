"use client";
import { useState } from "react";
import { offers } from "@/app/data/customData";

const FloatingInput = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative w-full">
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
                 focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                 placeholder-transparent"
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-3 text-gray-500 transition-all
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
                 bg-white px-1 rounded"
    >
      {placeholder}
    </label>
  </div>
);

const FloatingTextarea = ({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="relative w-full">
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={3}
      className="peer w-full p-3 rounded-full border border-[#D2D1CA] 
                 focus:outline-none focus:ring-2 focus:ring-[#734A00] 
                 placeholder-transparent resize-none"
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-3 text-gray-500 transition-all
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                 peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-[#734A00]
                 bg-white px-1 rounded"
    >
      {placeholder}
    </label>
  </div>
);

const ProgramLoyal2 = () => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Form state
  const [formData, setFormData] = useState({
    offerName: "",
    description: "",
    points: "",
    startDate: "",
    tillDate: "",
    eligibleTiers: "",
  });

  // ✅ Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // ✅ Validation logic
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.offerName.trim()) newErrors.offerName = "Offer name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!/^\d+%?$/.test(formData.points.trim()))
      newErrors.points = "Enter valid number or % (e.g. 100 or 20%).";

    // Strict date YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.startDate.trim()))
      newErrors.startDate = "Start Date must be in YYYY-MM-DD format.";
    if (!dateRegex.test(formData.tillDate.trim()))
      newErrors.tillDate = "Till Date must be in YYYY-MM-DD format.";

    // Tiers validation
    const allowedTiers = ["bronze", "silver", "gold"];
    const tiers = formData.eligibleTiers
      .split("/")
      .map((t) => t.trim().toLowerCase());
    if (!tiers.every((t) => allowedTiers.includes(t)))
      newErrors.eligibleTiers = "Tiers must be Bronze / Silver / Gold only.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("✅ Form data:", formData);
      alert("Offer created successfully!");
      setIsOpen(false);
    }
  };

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
              onClick={openModal}
              className="bg-[#734A00] text-white text-sm px-6 h-11 rounded-full 
                         hover:bg-[#5a3900] transition-colors duration-200"
            >
              Create New Offer
            </button>
          </div>

          {/* Offers */}
          <div className="flex flex-col divide-y w-full divide-[#D2D1CA]">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 hover:bg-[#ECE9DF] rounded-lg transition"
              >
                <button className="p-1 rounded-full hover:ring-2 hover:ring-[#2C2A25] transition">
                  <img
                    src={`/${offer.src}`}
                    alt={offer.alt}
                    className="2xl:h-[60px] 2xl:w-[60px] lg:h-[40px] lg:w-[40px] h-[32px] w-[32px] object-cover rounded-full"
                  />
                </button>

                <div className="flex flex-col items-start justify-center">
                  <h1 className="text-sm font-semibold text-[#2C2A25]">
                    {offer.title}
                  </h1>
                  <p className="text-xs text-[#757575]">{offer.desc}</p>
                </div>

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
        <div className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
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
        
            {/* Form with validations */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatingInput
                id="offerName"
                placeholder="Offer Name"
                value={formData.offerName}
                onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
              />
              {errors.offerName && <p className="text-red-500 text-sm">{errors.offerName}</p>}

              <FloatingTextarea
                id="description"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

              <FloatingInput
                id="points"
                placeholder="Points Cost / % Discount"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              />
              {errors.points && <p className="text-red-500 text-sm">{errors.points}</p>}

              <div className="flex gap-4">
                <FloatingInput
                  id="startDate"
                  placeholder="Start Date"
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <FloatingInput
                  id="tillDate"
                  placeholder="Till Date"
                  type="text"
                  value={formData.tillDate}
                  onChange={(e) => setFormData({ ...formData, tillDate: e.target.value })}
                />
              </div>
              {(errors.startDate || errors.tillDate) && (
                <p className="text-red-500 text-sm">
                  {errors.startDate || errors.tillDate}
                </p>
              )}

              <FloatingInput
                id="eligibleTiers"
                placeholder="Eligible tiers (Bronze / Silver / Gold)"
                value={formData.eligibleTiers}
                onChange={(e) => setFormData({ ...formData, eligibleTiers: e.target.value })}
              />
              {errors.eligibleTiers && <p className="text-red-500 text-sm">{errors.eligibleTiers}</p>}

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
