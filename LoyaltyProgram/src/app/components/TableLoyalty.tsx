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
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const monthName = monthNames[selectedMonth];
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  
  console.log("Customers:", customers.map(c => ({ id: c.id, name: c.name, email: c.email, points: c.points, orders: c.orders, bgColor: c.bgColor })));
  return (
    <div className="w-full lg:w-[724px] lg:h-[500px] 2xl:w-[949px] 2xl:h-[533px] border border-[#2C2A25] rounded-[24px] sm:rounded-[32px] p-3 sm:p-4 flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-[16px] sm:text-[18px] font-semibold">Customers Overview</h1>
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
            onMonthChange={(newMonth) => fetchCalendarData(newMonth)}
          />
          <button
            onClick={() => router.push("/add-remove-loyal")}
            className="cursor-pointer hover:bg-[#D9D9D9] border-[#2C2A25] w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center"
          >
            <img src="arrow.png" className="w-[16px] sm:w-auto h-[16px] sm:h-auto" alt="arrow" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto scroll-thin mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-[#3B82F6] rounded-full animate-spin" />
          </div>
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
              {customers.slice(0, 10).map((customer) => (
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
                      <button onClick={() => handleDeleteClick(customer)} className="cursor-pointer hover:opacity-70">
                        <img src="dustbuin.png" className="w-[16px] sm:w-[20px]" alt="delete" />
                      </button>
                      <button onClick={() => handleViewClick(customer)} className="cursor-pointer hover:opacity-70">
                        <img src="eye.png" className="w-[16px] sm:w-[20px]" alt="view" />
                      </button>
                      <button className="hover:opacity-70 cursor-pointer" onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}>
                        <img src="menu.png" className="w-[16px] sm:w-[20px]" alt="menu" />
                      </button>
                       {openMenuId === customer.id && (
        <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border rounded shadow-lg z-50">
          <ul className="flex flex-col text-sm text-gray-800">
            <li>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => { /* handle email */ }}
              >
                Email
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => { /* show points info */ }}
              >
                About Points
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => { /* handle edit customer */ }}
              >
                Edit Customer
              </button>
            </li>
          </ul>
        </div>
      )}
                    </div>
                  </td>
                </tr>
                
              ))}
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
