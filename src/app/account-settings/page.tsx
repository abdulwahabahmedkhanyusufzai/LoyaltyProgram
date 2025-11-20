"use client";
import { useEffect, useState } from "react";
import { FieldRenderer } from "../components/FieldRenderer";
import { FormManager } from "../utils/FormManger";

const RegisterAsaCustomer = () => {
  const [formManager] = useState(new FormManager());
  const [formData, setFormData] = useState({
    profilePicPreview: "",
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    tier: "",
    points: "",
    expiry: "",
    notifications: {
      systemAlerts: false,
      notifications: false,
      weeklyReports: false,
    },
    language: "English",
  });

  const [loading, setLoading] = useState(false); // button loading
  const [pageLoading, setPageLoading] = useState(true); // whole page loader

useEffect(() => {
  const fetchUserFromAPI = async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);

      const user = await res.json();

      console.log("Fetched user:", user);

      const prefilled = {
        profilePicPreview: user.profilePicUrl || "",
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        language: user.language || "English",
      };

      // ✅ Update both states with the same data
      setFormData((prev) => ({ ...prev, ...prefilled }));
      formManager.setFormValues(prefilled);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setPageLoading(false);
    }
  };

  fetchUserFromAPI();
}, [formManager]);


  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-[#734A00]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <img src="account-btn.png" alt="" className="h-[37px] w-[37px]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">Account Settings</h2>
        </div>

        {/* Security Section */}
            <FieldRenderer
              form={formData}
             setFormData={setFormData}
             formManager={formManager}
             loading={loading}
             setLoading={setLoading}
            />
              
      </div>
    </div>
  );
};

export default RegisterAsaCustomer;
