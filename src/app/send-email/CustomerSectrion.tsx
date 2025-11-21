"use client";

import { Search } from "lucide-react";
import { FloatingInput } from "../components/FloatingInput";
import { useTranslations } from "use-intl";

const CustomerSection = ({ searchQuery, setSearchQuery, currentCustomers, onEmailClick }) => {
  const t = useTranslations("customerSection");

  // 🔎 Filter customers based on query
  const filteredCustomers = currentCustomers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.loyaltyTitle?.toLowerCase().includes(q) ||
      String(c.numberOfOrders)?.includes(q) ||
      String(c.amountSpent)?.includes(q)
    );
  });

  const handleSearchClick = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center text-center">
        <div className="w-full sm:w-[398px] relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <FloatingInput
            id="Search"
            type="text"
            placeholder={t("placeholders.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <button
            onClick={handleSearchClick}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm"
          >
            {t("buttons.search")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-3 px-4">{t("tableHeaders.name")}</th>
              <th className="py-3 px-4">{t("tableHeaders.email")}</th>
              <th className="py-3 px-4">{t("tableHeaders.lastOrder")}</th>
              <th className="py-3 px-4">{t("tableHeaders.loyaltyPoints")}</th>
              <th className="py-3 px-4">{t("tableHeaders.purchases")}</th>
              <th className="py-3 px-4">{t("tableHeaders.loyaltyTitle")}</th>
              <th className="py-3 px-4">{t("tableHeaders.action")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 px-4">{c.lastName} {c.firstName}</td>
                <td className="py-3 px-4 text-gray-600">{c.email}</td>
                <td className="py-3 px-4">{c.numberOfOrders}</td>
                <td className="py-3 px-4">{c.loyaltyPoints}</td>
                <td className="py-3 px-4">€ {Number(c.amountSpent).toFixed()}</td>
                <td className="py-3 px-4 text-[#2C2A25] font-medium">{c.loyaltyTitle}</td>
                <td className="py-3 px-4 text-[#2C2A25] font-medium">
                  <button
                    className="cursor-pointer active:scale-90 transform transition duration-150 ease-in-out"
                    onClick={() => onEmailClick(c.email)}
                  >
                    <img
                      src="Emailbtn.png"
                      alt={t("buttons.email")}
                      className="w-[36px] h-[36px] pointer-events-none"
                    />
                  </button>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400 italic">
                  {t("emptyState")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-500 gap-2">
        <span>{t("totalCustomers", { count: filteredCustomers.length })}</span>
      </div>
    </>
  );
};

export default CustomerSection;
