"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "../utils/CustomerService";
import { FloatingInput } from "../components/FloatingInput";

// ✅ Centralized debug helper
const debugLog = (label: string, data?: any) => {
  console.log(
    `%c[RegisterAsaCustomer] ${label}`,
    "color: #734A00; font-weight: bold;",
    data ?? ""
  );
};

const RegisterAsaCustomer = () => {
  const router = useRouter();
  const [customerIdFromUrl, setCustomerIdFromUrl] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // 🧭 Load existing customers and prefill form if `customerId` param exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("customerId");
    setCustomerIdFromUrl(id);
    debugLog("URL Param (customerId)", id);

    async function loadCustomers() {
      setLoading(true);
      debugLog("Fetching customers...");
      try {
        const fetchedCustomers = await customerService.fetchCustomers();
        setCustomers(fetchedCustomers);
        debugLog("Fetched customers:", fetchedCustomers);

        if (id) {
          const customer = fetchedCustomers.find((c) => c.id === id);
          debugLog("Matched customer by ID:", customer);

          if (customer) {
            const updatedForm = {
              fullName: `${customer.firstName} ${customer.lastName}`,
              email: customer.email,
              phone: customer.phone || "",
              password: "",
              activationMail: false,
              tier: customer.loyaltyTitle || "",
              points: customer.loyaltyPoints || "",
              expiry: "",
            };
            setForm(updatedForm);
            debugLog("Form prefilled from customer:", updatedForm);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [router]);

  // 🧩 Track form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, id, value, type, checked } = e.target as HTMLInputElement;
    const key = name || id;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [key]: newValue }));
    debugLog(`Input changed → ${key}`, newValue);
  };

  // 💾 Register and push to backend API
  const handleRegister = async () => {
    debugLog("Submitting registration form", form);

    // ✅ Validate required fields
    if (!form.fullName || !form.email) {
      alert("Full name and email are required!");
      debugLog("Validation failed: Missing name or email");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      debugLog("API Response:", result);

      if (!response.ok) {
        alert(result.error || "Failed to register customer.");
        return;
      }

      alert("✅ Customer registered successfully!");
      debugLog("Customer created successfully:", result.customer);
      router.refresh(); // optional
    } catch (err: any) {
      console.error("❌ Error calling /api/register:", err);
      alert("Something went wrong while registering. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🧹 Reset the form
  const handleCancel = () => {
    debugLog("Form reset triggered");
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

  // 🌀 Loading screen
  if (loading) {
    debugLog("Loading...");
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
          <FloatingInput id="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
          <FloatingInput id="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <FloatingInput id="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <FloatingInput id="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

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
          <FloatingInput id="tier" placeholder="Tier" value={form.tier} onChange={handleChange} />
          <FloatingInput id="points" type="number" placeholder="Point Balance" value={form.points} onChange={handleChange} />
          <FloatingInput id="expiry" type="date" placeholder="Expiry Date" value={form.expiry} onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleRegister}
            disabled={submitting}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${
              submitting ? "bg-gray-400" : "bg-[#734A00] hover:bg-[#5a3800]"
            }`}
          >
            {submitting ? "Registering..." : "Save and Register"}
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
