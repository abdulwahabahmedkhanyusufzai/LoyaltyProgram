"use client";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import Tabs from "../components/ButtonGroup";
import ProgramLoyal2 from "./program/page";
import { customerService } from "../utils/CustomerService";
import LoyaltyDashboard from "../components/LoyaltyDashboard";

function LoyalCustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [step, setStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [customerIdFromUrl, setCustomerIdFromUrl] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Detect URL param for customerId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("customerId");
    setCustomerIdFromUrl(id);
    if (id) {
      setStep(0);
      setSelectedTab("Clients");
    } else {
      setStep(1);
      setSelectedTab("Home");
    }
  }, []);

  // Fetch data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [fetchedCustomers, count, pointsData] = await Promise.all([
          customerService.fetchCustomers(),
          customerService.fetchCustomerCount(),
          customerService.fetchCustomerPoints(),
        ]);

        const pointsMap = new Map(pointsData.map((p) => [p.id, p.loyaltyPoints]));

        const customersWithPoints = fetchedCustomers.map((c) => ({
          ...c,
          loyaltyPoints: pointsMap.get(c.id) ?? 0,
        }));

        const sortedCustomers = [...customersWithPoints].sort(
          (a, b) => (b.amountSpent ?? 0) - (a.amountSpent ?? 0)
        );

        setCustomers(sortedCustomers);
        setTotalCount(count);
      } catch (error) {
        console.error("❌ Error loading customer data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Instant search filter
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const lowerTerm = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerTerm) ||
        c.email.toLowerCase().includes(lowerTerm) ||
        c.loyaltyTitle?.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, customers]);

  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const endIndex = Math.min(page * PAGE_SIZE, filteredCustomers.length);

  const currentCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(Number(e.target.value));
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-start mb-0">
          <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25] ml-2">
            Loyal Customers List
          </h2>
        </div>

        {/* Tabs */}
        <Tabs
          type="default"
          onChange={(tab) => {
            setSelectedTab(tab);
            if (tab === "Program") setStep(2);
            if (tab === "Home") setStep(1);
            if (tab === "Clients") setStep(0);
          }}
          activeTab={selectedTab}
        />

        {/* Home Tab */}
        {selectedTab === "Home" && step === 1 && (
          <>
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
              <p className="text-gray-500 text-sm lg:text-lg">
                Customers Registered in the loyalty program
              </p>
              <div className="w-full lg:w-[398px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, title, email"
                  className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset page when searching
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Last / First Name</th>
                    <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Email / Registration</th>
                    <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Last Orders</th>
                    <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Purchases (€)</th>
                    <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">Loyalty Title</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((c: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-2 px-2 sm:px-4">{c.lastName} {c.firstName}</td>
                        <td className="py-2 px-2 sm:px-4 text-gray-600">{c.email}</td>
                        <td className="py-2 px-2 sm:px-4">{c.numberOfOrders}</td>
                        <td className="py-2 px-2 sm:px-4">€ {Number(c.amountSpent).toFixed()}</td>
                        <td className="py-2 px-2 sm:px-4 text-green-600 font-medium">{c.loyaltyTitle}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <span className="text-sm text-gray-700 mt-2 block">
                Total Customers: {filteredCustomers.length}
              </span>
            </div>
          </>
        )}

        {/* Program Tab */}
        {selectedTab === "Program" && step === 2 && <ProgramLoyal2 />}
      </div>

      {/* Pagination */}
      {selectedTab === "Home" && step === 1 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Left */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <select
              value={page}
              onChange={handlePageChange}
              className="border border-[#DEDEDE] rounded-full px-2 py-1 w-full sm:w-auto"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700">
              Showing {page} to {endIndex} of {filteredCustomers.length} entries
            </span>
          </div>

          {/* Right */}
          <div className="flex overflow-x-auto space-x-2 sm:space-x-3 py-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ boxShadow: "2px 2px 2px 0px #00000040" }}
                    className={`px-3 py-1 rounded min-w-[40px] text-center ${
                      page === p ? "bg-[#FEFCED] text-black" : "bg-[#FEFCED] text-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                );
              } else if (p === page - 2 || p === page + 2) {
                return <span key={p} className="px-2 text-gray-400">...</span>;
              } else return null;
            })}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {selectedTab === "Clients" && step === 0 && (
        <LoyaltyDashboard
          currentCustomers={
            customerIdFromUrl
              ? customers.filter((c) => c.id === customerIdFromUrl)
              : currentCustomers
          }
        />
      )}
    </div>
  );
}

export default LoyalCustomersList;
