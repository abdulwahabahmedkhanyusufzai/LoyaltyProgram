"use client";
import { useEffect, useState } from "react";

// 🔹 Login Modal
const LoginModal = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      onLogin();
    } else {
      setShowError(true);
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
            <img src="Login.png" className="w-12 h-12 text-[#734A00]" alt="" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2A25] mb-2">
            Log In Required
          </h2>
          <p className="text-gray-600 mb-6">Please log in to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f1dab0] transition-all"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f1dab0] transition-all"
          />
          {showError && (
            <p className="text-red-500 text-sm text-center">
              Invalid username or password.
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-6 bg-[#734A00] text-white py-3 rounded-full font-bold shadow-md hover:bg-[#5a3800] transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

// 🔹 Main Page
function LoginList() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowModal(false); // hide modal after login
  };

  return (
    <div className="relative p-6">
      {!isLoggedIn && showModal && (
        <LoginModal
          onLogin={handleLoginSuccess}
          onClose={() => setShowModal(false)} // ✅ close works now
        />
      )}

      {/* Example page content */}
      <h1 className="text-2xl font-bold">Main Page Content</h1>
    </div>
  );
}

export default LoginList;
