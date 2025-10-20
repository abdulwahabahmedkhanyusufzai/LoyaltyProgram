"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formSections } from "../data/customData";
import { ProfilePicUploader } from "../components/ProfilePicture";
import { Section } from "../components/SectionWrapper";
import { FieldRenderer } from "../components/FieldRenderer";
import { LoadingButton } from "../components/LoadingButton";
import { FormManager } from "../utils/FormManger";

const RegisterAsaCustomer = () => {
  const [formManager] = useState(new FormManager());
 console.log(formSections.security.fields);
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const fieldValue = type === "checkbox" ? checked : value;

    formManager.handleChange(e);

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      formManager.handleImageUpload(file);

      setFormData((prev) => ({
        ...prev,
        profilePicPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleCancel = () => {
    formManager.resetForm();
    setFormData({
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
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await formManager.submitForm();
      toast.success("✅ User saved successfully!");
      handleCancel();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Personal Section */}
        <Section title={formSections.personal.title}>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <FieldRenderer
                fields={formSections.personal.fields}
                form={formData}
                handleChange={handleChange}
              />
            </div>
            <ProfilePicUploader
              profilePic={formData.profilePicPreview}
              onUpload={handleImageUpload}
            />
          </div>
        </Section>

        {/* Security Section */}
        <Section title={formSections.security.title}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <FieldRenderer
              fields={formSections.security.fields}
              form={formData}
              handleChange={handleChange}
            />
            <LoadingButton loading={loading} type="submit">
              Save Password
            </LoadingButton>
          </form>
        </Section>

        {/* Notifications Section */}
        <Section title={formSections.notifications.title}>
          <FieldRenderer
            toggles={formSections.notifications.toggles}
            form={formData}
            handleChange={handleChange}
          />
        </Section>

        {/* Preferences Section */}
        <Section title={formSections.preferences.title}>
          <FieldRenderer
            select={formSections.preferences.select}
            form={formData}
            handleChange={handleChange}
          />
        </Section>

        {/* Save + Cancel */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleRegister}
            className="w-full bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
          >
            Save Changes
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
