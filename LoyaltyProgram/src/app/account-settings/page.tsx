"use client";
import { useState } from "react";

const RegisterAsaCustomer = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name in form.notifications) {
      setForm({
        ...form,
        notifications: { ...form.notifications, [name]: checked },
      });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setForm({ ...form, profilePic: imgUrl });
    }
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
    });
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 mb-6">
          <div className="flex items-center space-x-[10px]">
            <img src="account-btn.png" alt="" className="h-[37px] w-[37px]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Account Settings
            </h2>
          </div>
        </div>

        {/* Personal Details */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#2C2A25] mb-4">
            Personal Details
          </h3>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Inputs */}
            <div className="flex-1 space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="text-[#734A00] placeholder-[#734A00] w-full border border-gray-300 rounded-full px-4 py-3 outline-none"
              />
            </div>

            {/* Profile Picture Upload */}
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
            <input
              type="password"
              name="password"
              placeholder="Current Password"
              value={form.password}
              onChange={handleChange}
              className="text-[#734A00] placeholder-[#734A00] w-full border rounded-full px-4 py-3"
            />
            <input
              type="password"
              placeholder="New Password"
              className="text-[#734A00] placeholder-[#734A00] w-full border rounded-full px-4 py-3"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="text-[#734A00] placeholder-[#734A00] w-full border rounded-full px-4 py-3"
            />
          </div>
          <button
            onClick={handleRegister}
            className="mt-6 w-full bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
          >
            Save Password
          </button>
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
