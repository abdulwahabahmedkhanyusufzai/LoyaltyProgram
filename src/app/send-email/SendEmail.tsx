"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { FloatingInput } from "../components/FloatingInput";

const SendEmail = ({ customers, prefillEmail, targetCustomers }) => {
  const t = useTranslations("sendEmail");

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
    recipient: prefillEmail,
    subject: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editable template texts
  const [bannerText, setBannerText] = useState(t("bannerText"));
  const [pointsText, setPointsText] = useState("25");

  const isBulk = targetCustomers && targetCustomers.length > 0 && !prefillEmail;

  const generateHtml = () => `
    <div style="font-family: Arial, sans-serif; background:#fffef9; padding:16px; border-radius:16px; border:1px solid #ddd;">
      <div style="background:#734A00; color:white; text-align:center; border-radius:9999px; padding:8px; margin-bottom:16px;">
        ${bannerText}
      </div>
      <div style="background:#734A00; color:white; text-align:center; padding:24px; border-radius:8px;">
        <div style="margin:0 auto">
          <img src="https://loyalty-program-9jqr.vercel.app/waro2.png" alt="Logo Icon" style="height:39px;width:52px;" />
          <img src="https://loyalty-program-9jqr.vercel.app/waro.png" alt="Logo Text" style="height:19px;" />
        </div>
        <p style="font-size:18px; font-weight:600; margin:0;">
          THE WARO<br/>
          <span style="font-size:32px; font-weight:800; color:#F1DAB0CC; display:block; margin-top:8px;">
             ${pointsText}
          </span>
        </p>
      </div>
    </div>
  `;

  const handleSend = async () => {
    if (!form.subject) {
      setStatus({ type: "error", msg: t("errors.fillAllFields") });
      return;
    }

    if (!isBulk && !form.recipient) {
      setStatus({ type: "error", msg: t("errors.fillAllFields") });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isBulk && !emailRegex.test(form.recipient)) {
      setStatus({ type: "error", msg: t("errors.invalidEmail") });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const recipients = isBulk ? targetCustomers : [{ email: form.recipient }];
      let successCount = 0;
      let failCount = 0;

      for (const recipient of recipients) {
        try {
          const res = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: recipient.email,
              subject: form.subject,
              points: pointsText,
            }),
          });
          if (res.ok) successCount++;
          else failCount++;
        } catch (e) {
          failCount++;
        }
      }

      if (failCount === 0) {
        setStatus({ type: "success", msg: t("success.sentTo", { email: isBulk ? `${successCount} recipients` : form.recipient }) });
      } else {
        setStatus({ type: "warning", msg: `Sent to ${successCount}, failed ${failCount}` });
      }

    } catch (err) {
      setStatus({ type: "error", msg: err.message || t("errors.sendFailed") });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSearch = (e) => {
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

  const handleSelectRecipient = (customer) => {
    setForm({ ...form, recipient: customer.email });
    setSearchQuery(`${customer.firstName} ${customer.lastName} (${customer.email})`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (prefillEmail) {
      setForm((prev) => ({ ...prev, recipient: prefillEmail }));
      setSearchQuery(prefillEmail);
    }
  }, [prefillEmail]);

  return (
    <div className="space-y-4">
      {/* Recipient input */}
      <div className="relative">
        {isBulk ? (
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-700">
            Sending to <strong>{targetCustomers.length}</strong> recipients
          </div>
        ) : (
          <>
            <FloatingInput
              id="recipient"
              placeholder={t("placeholders.recipient")}
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
          </>
        )}
      </div>

      {/* Subject input */}
      <FloatingInput
        id="subject"
        type="text"
        placeholder={t("placeholders.subject")}
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      />

      {/* Live Editable Template */}
      <div className="border border-gray-300 rounded-2xl p-4 bg-[#fffef9]">
        <div className="space-y-4">
          <div
            contentEditable
            suppressContentEditableWarning
            className="bg-[#734A00] text-white text-center rounded-full py-2 text-sm mb-4 outline-none"
            onInput={(e) => setBannerText(e.currentTarget.innerText)}
          >
            {bannerText}
          </div>

          <div className="bg-[#734A00] text-white text-center p-6 rounded-lg border border-gray-200">
            <div className="flex justify-center items-center gap-3 mb-4">
              <img
                alt="Logo Icon"
                className="h-[39px] w-[52px]"
                src="https://loyalty-program-9jqr.vercel.app/waro2.png"
              />
              <img
                alt="Logo Text"
                className="h-[19px] w-auto"
                src="https://loyalty-program-9jqr.vercel.app/waro.png"
              />
            </div>

            <p className="text-xl font-semibold">{t("template.title")}</p>

            <p className="text-[#F1DAB0CC] text-[32px] font-extrabold block mt-2">
              {t("template.subtitle")}{" "}
              <input
                type="text"
                value={pointsText}
                onChange={(e) =>
                  setPointsText(e.target.value.replace(/\D/g, ""))
                }
                className="outline-none border-b border-dashed border-[#F1DAB0CC] bg-transparent text-center w-16 text-[#F1DAB0CC]"
              />{" "}
              {t("template.points")}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div
          className={`text-sm font-medium p-2 rounded ${status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {status.msg}
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full mt-4 bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("buttons.sending") : t("buttons.send")}
      </button>
    </div>
  );
};

export default SendEmail;
