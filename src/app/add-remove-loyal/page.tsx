"use client";

import { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DeletedDialog from "../components/DeletedDialog";
import CustomerProfileModal from "../components/CustomerProfileModal";
import { Customer } from "../utils/fetchCustomer";

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PAGE_SIZE = 10;

function LoyalCustomersList() {
  const router = useRouter();

  // Fetch customers using SWR
  const { data: customers = [], isLoading } = useSWR<Customer[]>(
    "/api/customers",
    fetcher
  );

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(term) ||
        c.lastName?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.loyaltyTitle?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const totalCount = filteredCustomers.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Paginated customers
  const currentCustomers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, page]);

  // Handlers
  const handleDeleteClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDialog(true);
  }, []);

  const handleViewClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
  }, []);

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(Number(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen flex justify-center items-center">
        {" "}
        <div className="w-16 h-16 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>{" "}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      {" "}
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}{" "}
        <div className="flex items-start justify-between my-[10px]">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <img
              src="PremiumLoyalty.png"
              alt="Premium loyalty icon"
              className="h-[37px] w-[37px]"
            />{" "}
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Add or Remove Customers
            </h2>{" "}
          </div>
          <button
            type="button"
            onClick={() => router.push("/register-as-customer")}
            className="flex items-center gap-2 px-4 border rounded-[25px] border-[#2C2A25] h-[44px] text-sm hover:bg-[#2C2A25] hover:text-white transition"
          >
            {" "}
            <span>Add New</span> <span className="text-[18px]">+</span>{" "}
          </button>{" "}
        </div>
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
          <p className="mt-5 mb-5 text-gray-500 text-sm lg:text-lg">
            Customers Add or Remove
          </p>
          <div className="relative w-full lg:w-[398px] flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              aria-label="Search customers"
              placeholder="Search by name, title, email, date"
              className="w-full border border-gray-300 rounded-full pl-10 pr-[110px] py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm"
            >
              Search
            </button>
          </div>
        </div>
        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-sm lg:text-base">
                <th className="py-3 px-4">Last Name / First Name</th>
                <th className="py-3 px-4">Email / Registration</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4">Purchases (€)</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Loyalty Title</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition text-sm lg:text-base"
                >
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4">{c.orders}</td>
                  <td className="py-3 px-4">
                    € {c.amountSpent?.toFixed(2) ?? "0"}
                  </td>
                  <td className="py-3 px-4">{c.points}</td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/register-as-customer/?customerId=${encodeURIComponent(
                              c.id
                            )}`
                          )
                        }
                        className="cursor-pointer active:scale-90 transform transition duration-150 ease-in-out"
                      >
                        <img
                          src="Edit.png"
                          alt="Edit"
                          className="w-[25px] lg:w-[33px]"
                        />
                      </button>
                      {editingTitle === c.id ? (
                        <input
                          type="text"
                          defaultValue={c.loyaltyTitle}
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-[120px]"
                        />
                      ) : (
                        c.loyaltyTitle
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(c)}
                      className="active:scale-90 transform transition duration-150 ease-in-out"
                    >
                      <img
                        src="dustbinpremium.png"
                        alt="Delete"
                        className="w-[25px] lg:w-[33px]"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewClick(c)}
                      className="active:scale-90 transform transition duration-150 ease-in-out"
                    >
                      <img
                        src="printpremium.png"
                        alt="View"
                        className="w-[25px] lg:w-[33px]"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-4 text-xs lg:text-sm text-gray-500 gap-2">
          <span>Total Customers: {totalCount}</span>
        </div>
      </div>
      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <select
            value={page}
            onChange={handlePageChange}
            className="border border-[#DEDEDE] rounded-full px-2 py-1 w-full sm:w-auto"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">
            Showing {page} to {Math.min(page * PAGE_SIZE, totalCount)} of{" "}
            {totalCount} entries
          </span>
        </div>

        <div className="flex overflow-x-auto space-x-2 sm:space-x-3 py-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded min-w-[40px] text-center ${
                    page === p
                      ? "bg-[#FEFCED] text-black"
                      : "bg-[#FEFCED] text-gray-500"
                  }`}
                  style={{ boxShadow: "2px 2px 2px 0px #00000040" }}
                >
                  {p}
                </button>
              );
            } else if (p === page - 2 || p === page + 2) {
              return (
                <span key={p} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
      {/* Modals */}
      <DeletedDialog
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        deleting={deleting}
        setDeleting={setDeleting}
      />
      {showProfile && selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default LoyalCustomersList;
