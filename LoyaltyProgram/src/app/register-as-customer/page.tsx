"use client";
import { useState } from "react";

const RegisterAsaCustomer = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    activationMail: false,
    tier: "",
    points: "",
    expiry: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleRegister = () => {
    alert(`Customer Registered: ${form.fullName}, ${form.email}`);
  };

  const handleCancel = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      activationMail: false,
      tier: "",
      points: "",
      expiry: "",
    });
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 mb-6">
          <div className="flex items-center">
          <img
            src="PremiumLoyalty.png"
            alt=""
            className="h-[37px] w-[37px]"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
            Register as A Customer
          </h2>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <button className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              <span>Add New</span>
              <span className="text-[14px] sm:text-[18px]">+</span>
            </button>
            <button className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              Edit
            </button>
          </div>
        
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#2C2A25] mb-4">
            Customer Details
          </h3>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name="activationMail"
              checked={form.activationMail}
              onChange={handleChange}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded"
            />
            Send me an activation mail
          </label>
        </div>

        {/* Loyalty Program Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">
            Loyalty Program
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              name="tier"
              placeholder="Tier"
              value={form.tier}
              onChange={handleChange}
              className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <input
              type="number"
              name="points"
              placeholder="Point Balance"
              value={form.points}
              onChange={handleChange}
              className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <input
              type="date"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Buttons (separate full-width) */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleRegister}
            className="w-full bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
          >
            Save and Register 
          </button>

          <button
            onClick={handleCancel}
            className=" w-full bg-gray-300 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default RegisterAsaCustomer;
