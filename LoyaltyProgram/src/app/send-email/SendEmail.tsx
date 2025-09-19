import { useState } from "react";
import { FloatingInput } from "../components/FloatingInput";

const SendEmail = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!form.recipient || !form.subject || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    

    try {
      setLoading(true);
      setStatus(null);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  to: form.recipient,
  subject: form.subject,
  text: form.message,
}),

      });

      if (!res.ok) throw new Error("Failed to send email");

      setStatus({ type: "success", msg: `✅ Email sent to ${form.recipient}` });
      setForm({ recipient: "", subject: "", message: "" });
      setSearchQuery("");
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const queryWords = value.toLowerCase().split(/\s+/);
      const filtered = customers.filter((c) => {
        const target = `${c.firstName || ""} ${c.lastName || ""} ${c.email || ""}`.toLowerCase();
        return queryWords.every((word) => target.includes(word));
      });

      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectRecipient = (customer: any) => {
    setForm({ ...form, recipient: customer.email });
    setSearchQuery(`${customer.firstName} ${customer.lastName} (${customer.email})`);
    setShowSuggestions(false);
  };

  // 🔹 New dedicated subject handler
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, subject: e.target.value }));
  };

  // Generic handler for message
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">
      {/* Recipient search */}
      <div className="relative">
        <FloatingInput
          id="recipient"
          placeholder="To (Recipient)"
          type="text"
          value={searchQuery}
          onChange={handleRecipientSearch}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-48 overflow-y-auto shadow-md">
            {suggestions.map((c, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectRecipient(c)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {c.firstName} {c.lastName} —{" "}
                <span className="text-gray-600">{c.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subject with its own handler */}
      <FloatingInput
        id="subject"
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={handleSubjectChange}
      />

      {/* Message */}
      <textarea
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none"
      />

      {/* Status message */}
      {status && (
        <div
          className={`text-sm font-medium p-2 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.msg}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full mt-4 bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
};

export default SendEmail;
