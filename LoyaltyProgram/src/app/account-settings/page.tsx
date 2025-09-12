"use client";
import { useState } from "react";
import toast from "react-hot-toast";

// 🔹 Reusable Input Component
const Input = ({ label, type, name, value, onChange }: any) => (
  <input
    type={type}
    name={name}
    placeholder={label}
    value={value}
    onChange={onChange}
    className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none"
  />
);

// 🔹 Reusable Loading Button
const LoadingButton = ({ loading, children, ...props }: any) => (
  <button
    disabled={loading}
    className={`mt-6 w-full flex items-center justify-center gap-2 bg-[#734A00] text-white py-3 rounded-full font-semibold transition ${
      loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#5a3800]"
    }`}
    {...props}
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        Saving...
      </>
    ) : (
      children
    )}
  </button>
);

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  currentPassword:"",
  password: "",
  confirmPassword:"",
  confirmNewPassword:"",
  tier: "",
  points: "",
  expiry: "",
  profilePic: "",
  notifications: {
    systemAlerts: false,
    notifications: false,
    weeklyReports: false,
  },
  language: "English",
};

const RegisterAsaCustomer = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // 🔹 Handle input updates
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name in form.notifications) {
      setForm((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [name]: checked },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // 🔹 Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setForm((prev) => ({ ...prev, profilePic: imgUrl }));
    }
  };

  const handleCancel = () => setForm(initialForm);

  // 🔹 API call
  const handleRegister = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          profilePicUrl: form.profilePic,
          password: form.confirmNewPassword,
          confirmPassword: form.confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      
      toast.success("✅ User saved successfully!");
      console.log("✅ Saved User:", data.user);
      handleCancel();
    } catch (err) {
       toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <img src="account-btn.png" alt="" className="h-[37px] w-[37px]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
            Account Settings
          </h2>
        </div>

        {/* Personal Details */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">
            Personal Details
          </h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <Input
                type="text"
                name="fullName"
                label="Full Name"
                value={form.fullName}
                onChange={handleChange}
              />
              <Input
                type="email"
                name="email"
                label="Email Address"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* Profile Pic */}
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] rounded-full overflow-hidden border-2 border-gray-300">
                {form.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-[#D9D9D9] text-[#734A00] h-full w-full flex items-center justify-center text-xs sm:text-sm">
                    Profile Picture
                  </div>
                )}
              </div>
              <label className="mt-3 text-sm text-white rounded-full px-5 py-2 bg-[#734A00] cursor-pointer">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">Security</h3>
          <div className="space-y-4">
            <Input
              type="password"
              name="password"
              label="Current Password"
              value={form.password}
              onChange={handleChange}
            />
            <Input type="password" label="New Password" value={form.confirmPassword} />
            <Input type="password" label="Confirm New Password" value={form.confirmNewPassword}/>
          </div>
          <LoadingButton loading={loading} onClick={handleRegister}>
            Save Password
          </LoadingButton>
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">
            Notifications
          </h3>
          <div className="space-y-3">
            {[
              { label: "Receive system alerts via email", name: "systemAlerts" },
              { label: "Receive notifications", name: "notifications" },
              { label: "Weekly reports", name: "weeklyReports" },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-[#734A00] text-sm sm:text-base">
                  {item.label}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={
                      form.notifications[item.name as keyof typeof form.notifications]
                    }
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-checked:bg-[#734A00] rounded-full transition-all"></div>
                  <div className="absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">Preferences</h3>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full border rounded-full px-4 py-3 text-sm sm:text-base"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Arabic</option>
          </select>
        </div>

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
