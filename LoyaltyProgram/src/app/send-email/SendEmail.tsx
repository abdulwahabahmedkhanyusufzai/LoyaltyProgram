import { useEffect, useState } from "react";
import { FloatingInput } from "../components/FloatingInput";

const SendEmail = ({ customers,prefillEmail }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
    recipient: prefillEmail,
    subject: "",
  });
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Reusable template generator
  const generateTemplate = (points: number) => `
    <div style="font-family: Arial, sans-serif; background:#fffef9; padding:16px; border-radius:16px; border:1px solid #ddd;">
      <div style="background:#734A00; color:white; text-align:center; border-radius:9999px; padding:8px; margin-bottom:16px;">
        Free shipping for over $50 and a full one-year return policy.
      </div>
      <div style="background:#734A00; color:white; text-align:center; padding:24px; border-radius:8px;">
        <div style="margin:0 auto">
        <div>  
        <img src="https://loyalty-program-9jqr.vercel.app/waro2.png" alt="Logo Icon" style="height:39px;width:52px;" />
          <img src="https://loyalty-program-9jqr.vercel.app/waro.png" alt="Logo Text" style="height:19px;" />
        </div>
          </div>
        <p style="font-size:18px; font-weight:600; margin:0;">
          THE WAROO <br/>
          <span style="font-size:32px; font-weight:800; color:#F1DAB0CC; display:block; margin-top:8px;">
            YOU HAVE WON ${points} POINTS
          </span>
        </p>
      </div>
    </div>`;

  const handleSend = async () => {
    if (!form.recipient || !form.subject) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    // 🔹 Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.recipient)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
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
          points: 25, // ✅ dynamic points
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      setStatus({ type: "success", msg: `✅ Email sent to ${form.recipient}` });
      setForm({ recipient: "", subject: "" });
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

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, subject: e.target.value }));
  };

    useEffect(() => {
    if (prefillEmail) {
      setForm((prev) => ({ ...prev, recipient: prefillEmail }));
    } setSearchQuery(prefillEmail); 
  }, [prefillEmail]);

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

      {/* Subject */}
      <FloatingInput
        id="subject"
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={handleSubjectChange}
      />

      {/* Live preview of template */}
     <div className="border border-gray-300 rounded-2xl p-4 bg-[#fffef9]">
    <div className="w-full flex items-center justify-center flex-col">
    <div className="bg-[#734A00] w-[50%] text-white text-center rounded-full py-2 text-sm mb-4 ">
        Free shipping for over $50 and a full one-year return policy. 
        </div>
         <div className="text-center p-6 bg-[#734A00] rounded-lg border border-gray-200">
             <div className="flex justify-center items-center gap-3 mb-4">
                 <img alt="Logo Icon" className="h-[39px] w-[52px]" src="/waro2.png"/> 
                 <img alt="Logo Text" className="h-[19px] w-auto" src="/waro.png"/> 
                 </div> 
                 <p className="text-lg font-semibold text-white">
                    THE WAROO 
                    <br/> 
                 <span className="text-[#F1DAB0CC] text-[32px] sm:text-[53px] font-extrabold block mt-2">
                    YOU HAVE WON 25 POINTS 
                    </span> 
                    </p> 
                 </div> 
                 </div>
                   </div>
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