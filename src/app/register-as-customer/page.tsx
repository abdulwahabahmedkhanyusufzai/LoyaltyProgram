"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "../utils/CustomerService";
import { FloatingInput } from "../components/FloatingInput";
import DatePicker from "react-datepicker";
import ExpiryDatePicker from "../components/ExpiryDate";
import toast from "react-hot-toast";

// ✅ Debug helper
const debugLog = (label: string, data?: any) => {
  console.log(`%c[RegisterAsaCustomer] ${label}`, "color: #734A00; font-weight: bold;", data ?? "");
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

  // 🧭 Prefill form if customerId exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("customerId");
    setCustomerIdFromUrl(id);
    debugLog("URL Param (customerId)", id);

    async function loadCustomers() {
      setLoading(true);
      try {
        const fetchedCustomers = await customerService.fetchCustomers();
        const fetchCustomersPoints = await customerService.fetchCustomerPoints();

        setCustomers(fetchedCustomers);
        debugLog("Fetched customers:", fetchedCustomers);

        if (id) {
          const customer = fetchedCustomers.find((c) => c.id === id);
          const points = fetchCustomersPoints.find((c) => c.id === id);

          if (customer) {
            const updatedForm = {
              fullName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
              email: customer.email || "",
              phone: customer.phone || "",
              password: "",
              activationMail: false,
              tier: customer.loyaltyTitle || "",
              points: points?.loyaltyPoints ? String(points.loyaltyPoints) : "",
              expiry: "",
            };
            setForm(updatedForm);
            debugLog("Form prefilled with existing customer:", updatedForm);
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

  // 🧩 Track form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, id, value, type, checked } = e.target as HTMLInputElement;
    const key = name || id;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [key]: newValue }));
    debugLog(`Input changed → ${key}`, newValue);
  };

  // 💾 Register or Update
  const handleSave = async () => {
    debugLog("Submitting form", form);

    if (!form.fullName || !form.email) {
      toast.error("Full name and email are required!");
      return;
    }

    setSubmitting(true);
    try {
      // 🧠 Check if the customer already exists
      const existingCustomer = customers.find(
        (c) =>
          c.email?.toLowerCase() === form.email.toLowerCase() ||
          (customerIdFromUrl && c.id === customerIdFromUrl)
      );

      const endpoint = existingCustomer
        ? "/api/customers/update"
        : "/api/customers/register";

      debugLog(existingCustomer ? "🟡 Updating existing customer..." : "🟢 Registering new customer...");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: existingCustomer?.id || customerIdFromUrl,
        }),
      });

      const result = await response.json();
      debugLog("API Response:", result);

      if (!response.ok) {
        toast.error(result.error || "Failed to save customer.");
        return;
      }

      if (existingCustomer) {
        toast.success("✅ Customer updated successfully!");
      } else {
        toast.success("✅ Customer registered successfully!");
      }
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error saving customer:", err);
      toast.error("Something went wrong while saving customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    debugLog("Form reset");
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
              {customerIdFromUrl ? "Update Customer" : "Register as a Customer"}
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
         <ExpiryDatePicker form={form} setForm={setForm}/>
         </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleSave}
            disabled={submitting}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${
              submitting ? "bg-gray-400" : "bg-[#734A00] hover:bg-[#5a3800]"
            }`}
          >
            {submitting
              ? "Saving..."
              : customerIdFromUrl
              ? "Update Customer"
              : "Save and Register"}
          </button>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-300 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-400 transition "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsaCustomer;
