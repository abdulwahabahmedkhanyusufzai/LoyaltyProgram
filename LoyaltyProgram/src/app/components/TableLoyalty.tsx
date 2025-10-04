"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthDropdown from "./MonthDropdown";
import { useCustomers } from "../utils/fetchCustomer";
import DeletedDialog from "./DeletedDialog";
import CustomerProfileModal from "./CustomerProfileModal";

export const LoyaltyTable = () => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { customers, loading, fetchCustomers } = useCustomers();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const monthName = monthNames[selectedMonth];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCalendarData = async (month: string) => {
    console.log("Fetching for month:", month);
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
    <div className="w-full lg:w-[724px] lg:h-[500px] 2xl:w-[949px] 2xl:h-[533px] border border-[#2C2A25] rounded-[24px] sm:rounded-[32px] p-3 sm:p-4 flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-[16px] sm:text-[18px] font-semibold">
          Customers Overview
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-[5px]">
          <button
            onClick={() => router.push("/register-as-customer")}
            className="cursor-pointer flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition"
          >
            <span>Add New</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
          <MonthDropdown
  currentMonth={monthName}
  onMonthChange={(newMonth) => {
    // update selected month index
    const idx = monthNames.indexOf(newMonth);
    if (idx !== -1) setSelectedMonth(idx);

    // call API
    fetchCalendarData(newMonth);
  }}
/>
          <button
            onClick={() => router.push("/add-remove-loyal")}
            className="cursor-pointer hover:bg-[#D9D9D9] border-[#2C2A25] w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center"
          >
            <img
              src="arrow.png"
              className="w-[16px] sm:w-auto h-[16px] sm:h-auto"
              alt="arrow"
            />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto scroll-thin mt-4">
        {loading ? (
          <table className="w-full border-collapse min-w-[600px] animate-pulse">
            <thead>
              <tr className="border-b border-[#D2D1CA] text-left text-[#2C2A25] text-[12px] sm:text-[14px] font-medium">
                <th className="p-2 sm:p-3 rounded-tl-[12px] uppercase">Customer</th>
                <th className="p-2 sm:p-3 uppercase">Total Points</th>
                <th className="p-2 sm:p-3 uppercase">Amount of Orders</th>
                <th className="p-2 sm:p-3 rounded-tr-[12px] uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#D2D1CA]">
                  <td className="p-2 sm:p-3 flex items-center gap-2">
                    <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full bg-gray-200" />
                    <div>
                      <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                      <div className="h-2 w-32 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#D2D1CA] text-left text-[#2C2A25] text-[12px] sm:text-[14px] font-medium">
                <th className="p-2 sm:p-3 rounded-tl-[12px] uppercase">Customer</th>
                <th className="p-2 sm:p-3 uppercase">Total Points</th>
                <th className="p-2 sm:p-3 uppercase">Amount of Orders</th>
                <th className="p-2 sm:p-3 rounded-tr-[12px] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="text-[13px] sm:text-[15px] text-[#2C2A25]">
              { monthName === "October" ? customers.slice(0, 10).map((customer) => (
                <tr key={customer.id} className="border-b border-[#D2D1CA]">
                  <td className="flex items-center p-2 sm:p-3">
                    <div
                      className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full flex items-center justify-center text-white font-bold mr-[12px] sm:mr-[20px]"
                      style={{ backgroundColor: customer.bgColor }}
                    >
                      {customer.initial}
                    </div>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">{customer.points}</td>
                  <td className="p-2 sm:p-3">{customer.orders}</td>
                  <td className="p-2 sm:p-3">
                    <div className="flex gap-2 sm:gap-[10px]">
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="cursor-pointer hover:opacity-70"
                      >
                        <img src="dustbuin.png" className="w-[16px] sm:w-[20px]" alt="delete" />
                      </button>
                      <button
                        onClick={() => handleViewClick(customer)}
                        className="cursor-pointer hover:opacity-70"
                      >
                        <img src="eye.png" className="w-[16px] sm:w-[20px]" alt="view" />
                      </button>
                    <div className="relative">
  <button
    className="hover:opacity-70 cursor-pointer"
    onClick={() =>
      setOpenMenuId(openMenuId === customer.id ? null : customer.id)
    }
  >
    <img src="menu.png" className="w-[16px] sm:w-[20px]" alt="menu" />
  </button>

  {openMenuId === customer.id && (
    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
      <ul className="flex flex-col text-sm text-gray-800">
        <li>
          <button
            onClick={() => {
              router.push(`/send-email?email=${encodeURIComponent(customer.email)}`);
              setOpenMenuId(null); // close after click
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Email
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              router.push(`/customers/${customer.id}/points`);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            About Points
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              router.push(`/customers/${customer.id}/edit`);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Edit Customer
          </button>
        </li>
      </ul>
    </div>
  )}
</div>

                    </div>
                  </td>
                </tr>
              )):(
                  <tr>
        <td colSpan={4} className="text-center p-4 text-gray-500">
          No customers for this month
        </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Dialog */}
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
