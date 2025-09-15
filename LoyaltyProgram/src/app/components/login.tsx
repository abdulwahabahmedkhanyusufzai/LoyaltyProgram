"use client";
import { useEffect, useState } from "react";
import { LoginManager } from "../utils/LoginManager";
import toast from "react-hot-toast";

const LoginModal = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);


  const loginManager = new LoginManager();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    loginManager.setCredentials(username, password);

    try {
      setLoading(true);
      const user = await loginManager.login(); // cookie auto set
      toast.success(`Welcome, ${user.fullname}!`);
      onLogin(); // notify parent
      onClose(); // close modal
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-[#2C2A25] mb-2">Log In Required</h2>
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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#734A00] text-white py-3 rounded-full font-bold shadow-md hover:bg-[#5a3800] transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
