"use client";
import { useEffect, useState } from "react";
import { LoginManager } from "../utils/LoginManager";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FloatingInput } from "../components/FloatingInput";
import { useUser } from "../../lib/UserContext"; // ✅ add this

const LoginModal = ({ onLogin }: { onLogin?: () => void }) => {
  const router = useRouter();
  const { refreshUser } = useUser(); // ✅ get refreshUser from context

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const loginManager = new LoginManager();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => setIsOpen(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    loginManager.setCredentials(username, password);

    try {
      const user = await loginManager.login();

      // ✅ Immediately refresh global user context
      await refreshUser();

      toast.success(`Welcome, ${user.fullname}!`);
      onLogin?.();
      closeModal();

      // ✅ Redirect AFTER updating context
      router.push("/waro");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-[#fffef9] p-8 rounded-2xl shadow-2xl max-w-lg w-full relative transform transition-all duration-300 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        {/* Title */}
        <div className="text-center">
          <div className="p-4 inline-block mb-4">
            <img src="Login.png" className="w-12 h-12" alt="login icon" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2A25] mb-2">Log In Required</h2>
          <p className="text-gray-600 mb-6">Please log in to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <FloatingInput
            id="username"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <FloatingInput
            id="password"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
