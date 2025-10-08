"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "../utils/CustomerService";
import { FloatingInput } from "../components/FloatingInput";

const RegisterAsaCustomer = () => {
  const router = useRouter();
  const [customerIdFromUrl, setCustomerIdFromUrl] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const params2 = new URLSearchParams(window.location.search);
    const id = params2.get("customerId");
    setCustomerIdFromUrl(id);

    async function loadCustomers() {
      setLoading(true);
      try {
        const fetchedCustomers = await customerService.fetchCustomers();
        setCustomers(fetchedCustomers);

        if (id) {
          const customer = fetchedCustomers.find((c) => c.id === id);
          if (customer) {
            setForm({
              fullName: `${customer.firstName} ${customer.lastName}`,
              email: customer.email,
              phone: customer.phone || "",
              password: "",
              activationMail: false,
              tier: customer.loyaltyTitle || "",
              points: customer.loyaltyPoints || "",
              expiry: "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 mb-6">
          <div className="flex items-center">
            <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Register as A Customer
            </h2>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">Customer Details</h3>
          <FloatingInput id="Full Name" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} className=""/>
          <FloatingInput id="Email Address" type="email" placeholder="Email" value={form.email} onChange={handleChange} className=""/>
          <FloatingInput id="Phone Number" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <FloatingInput id="Password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

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

        {/* Loyalty Program */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">Loyalty Program</h3>
          <FloatingInput id="Tier" placeholder="Tier" value={form.tier} onChange={handleChange} />
          <FloatingInput id="Point Balance" type="Number" placeholder="Point Balance" value={form.points} onChange={handleChange} />
          <FloatingInput id="Expiry Date" type="Date" placeholder="Expiry Date" value={form.expiry} onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleRegister}
            className="w-full bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
          >
            Save and Register
          </button>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-300 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsaCustomer;
