"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthDropdown from "./MonthDropdown";
import { useCustomers } from "../utils/fetchCustomer";
import DeletedDialog from "./DeletedDialog";
import CustomerProfileModal from "./CustomerProfileModal";
import { useTranslations } from "next-intl";

export const LoyaltyTable = () => {
  const t = useTranslations("loyaltyTable");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { customers, loading, fetchCustomers } = useCustomers();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Get month names from translation (object -> array)
  // Get month names from translation (array)

  function tArray<T = string>(key: string): T[] {
    const value = t(key, { "returnObjects": "true" }) as unknown;

    if (Array.isArray(value)) {
      return value as T[];
    }

    // fallback: empty array if value is not an array
    return [];
  }

  const monthNames = tArray<string>("months");



  // Narrow type safely
  console.log(monthNames[0]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const monthName: string = monthNames[selectedMonth] ?? "";


  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchCalendarData = async (month: string) => {
    fetch(`/api/get-calendar?month=${month}`);
  };

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDialog(true);
  };

  const handleViewClick = (customer: any) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
  };

  return (
    <div className="w-full lg:w-[724px] lg:h-[500px] 2xl:w-[949px] 2xl:h-[533px] border border-[#a59f9f] rounded-[24px] sm:rounded-[32px] p-3 sm:p-4 flex flex-col relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-[16px] sm:text-[18px] font-semibold">
          {t("customersOverview")}
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-[5px]">
          <button
            onClick={() => router.push("/register-as-customer")}
            className="cursor-pointer flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#a59f9f] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition"
          >
            <span>{t("addNew")}</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>

          <MonthDropdown
            currentMonth={monthName}
            onMonthChange={(newMonth) => {
              const idx = monthNames.indexOf(newMonth);
              if (idx !== -1) setSelectedMonth(idx);
              fetchCalendarData(newMonth);
            }}
          />

          <button
            onClick={() => router.push("/add-remove-loyal")}
            className="cursor-pointer hover:bg-[#D9D9D9] border-[#a59f9f] w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center"
          >
            <img
              src="Arrow1.svg"
              className="w-[16px] sm:w-[20px]"
              alt={t("arrow")}
            />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto scroll-thin mt-4">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#D2D1CA] text-left text-[#2C2A25] text-[12px] sm:text-[14px] font-medium">
              <th className="p-2 sm:p-3 rounded-tl-[12px] uppercase">{t("customer")}</th>
              <th className="p-2 sm:p-3 uppercase">{t("totalPoints")}</th>
              <th className="p-2 sm:p-3 uppercase">{t("amountOrders")}</th>
              <th className="p-2 sm:p-3 rounded-tr-[12px] uppercase">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="text-[13px] sm:text-[15px] text-[#2C2A25]">
            {monthName === monthNames[9] ? // October
              customers.slice(0, 10).map((customer) => (
                <tr key={customer.id} className="border-b border-[#D2D1CA]">
                  <td className="flex items-center p-2 sm:p-3">
                    <div
                      className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full flex items-center justify-center text-white font-bold mr-[12px] sm:mr-[20px]"
                      style={{ backgroundColor: customer.bgColor }}
                    >
                      {customer.initial}
                    </div>
                    <div>
                      <div className="font-semibold">{customer.firstName} {customer.lastName}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">{customer.points}</td>
                  <td className="p-2 sm:p-3">{customer.orders}</td>
                  <td className="p-2 sm:p-3">
                    <div className="flex gap-2 sm:gap-[10px]">
                      <button onClick={() => handleDeleteClick(customer)} className="cursor-pointer hover:opacity-70">
                        <img src="dustbuin.png" className="w-[16px] sm:w-[20px]" alt={t("delete")} />
                      </button>
                      <button onClick={() => handleViewClick(customer)} className="cursor-pointer hover:opacity-70">
                        <img src="eye.png" className="w-[16px] sm:w-[20px]" alt={t("view")} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    {t("noCustomersMonth")}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <DeletedDialog
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        deleting={deleting}
        setDeleting={setDeleting}
      />
      {showProfile && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};
