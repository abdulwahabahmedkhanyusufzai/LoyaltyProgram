"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthDropdown from "./MonthDropdown";

const COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
];

function getRandomColor(seed: string) {
  const index =
    seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    COLORS.length;
  return COLORS[index];
}

export const LoyaltyTable = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const monthName = monthNames[selectedMonth];

  // Reusable fetch function
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const resCustomers = await fetch(`/api/customers?first=10`);
      const customersData = await resCustomers.json();

      const resPoints = await fetch(`/api/customers/points`);
      const pointsData: { id: string; loyaltyPoints: number }[] = await resPoints.json();

      if (customersData.customers) {
        const formatted = customersData.customers.map((c: any) => {
          const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
          const email = c.email ?? "N/A";
          const initial = (name[0] || email[0] || "?").toUpperCase();
          const bgColor = getRandomColor(email || name);

          const pointsInfo = pointsData.find((p) => p.id === c.id);
          const totalPoints = pointsInfo?.loyaltyPoints ?? 0;

          return {
            id: c.id,
            name,
            email,
            points: totalPoints,
            orders: c.numberOfOrders ?? 0,
            initial,
            bgColor,
          };
        });
        setCustomers(formatted);
      }
    } catch (err) {
      console.error("❌ Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const confirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      // Refetch customers after delete
      await fetchCustomers();
    } catch (err) {
      console.error("❌ Error deleting customer:", err);
    } finally {
      setDeleting(false);
      setShowDialog(false);
      setSelectedCustomer(null);
    }
  };

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
                      <button className="hover:opacity-70">
                        <img src="eye.png" className="w-[16px] sm:w-[20px]" alt="view" />
                      </button>
                      <button className="hover:opacity-70">
                        <img src="menu.png" className="w-[16px] sm:w-[20px]" alt="menu" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background grid w-full max-w-sm gap-4 rounded-lg border p-6 shadow-lg">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold">
                Are you sure you want to delete <span className="font-bold">{selectedCustomer?.name}</span>?
              </h2>
              <p className="text-muted-foreground text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="cursor-pointer hover:opacity-70 inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 h-9"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="cursor-pointer hover:opacity-70 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white px-4 py-2 h-9"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-[#3B82F6] rounded-full animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
