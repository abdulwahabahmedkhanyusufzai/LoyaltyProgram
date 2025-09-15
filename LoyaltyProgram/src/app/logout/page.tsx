"use client";
import toast from "react-hot-toast";
import { useState } from "react";

const LoginModal = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);


  const handleLogout = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/user/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      

      // Remove authToken cookie (expires immediately)
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      toast.success("Logged out successfully!");
      window.location.href = "/waro"; // redirect
    } else {
      toast.error("Logout failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Logout failed");
  } finally {
    setLoading(false);
    onClose();
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-[#fffef9] p-8 rounded-2xl shadow-2xl max-w-lg w-full relative transform transition-all duration-300 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="p-4 inline-block mb-4">
            <img src="Login.png" className="w-12 h-12" alt="login icon" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2A25] mb-2">Log Out</h2>
          <p className="text-lg text-gray-600 mb-6">Do you really want to log out ?</p>
        </div>

        {/* Form */}
         <div className="flex items-center justify-center space-x-1">
          <button
            type="submit"
            disabled={loading}
            onClick={()=>handleLogout()}
            className="w-[40%] mt-6 bg-[#734A00] text-white py-3 rounded-full font-bold shadow-md hover:bg-[#5a3800] transition-colors disabled:opacity-50"
          >
            {loading ? "Logging Out..." : "Log Out"}
          </button>
          <button
            type="submit"
            className="w-[40%] mt-6 border-[#734A00] bg-[white] text-[#734A00] py-3 rounded-full font-bold shadow-md hover:bg-[#D3D3D3] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          </div>
      </div>
    </div>
  );
};

export default LoginModal;
