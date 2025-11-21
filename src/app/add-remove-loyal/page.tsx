"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DeletedDialog from "../components/DeletedDialog";
import CustomerProfileModal from "../components/CustomerProfileModal";
import { Customer, useCustomers } from "../utils/fetchCustomer";
import { useTranslations } from "next-intl";

function LoyalCustomersList() {
  const t = useTranslations();
  const router = useRouter();
  const { customers, loading, fetchCustomers } = useCustomers();
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const PAGE_SIZE = 10;

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDialog(true);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(term) ||
        c.lastName?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.loyaltyTitle?.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
    setPage(1);
    setTotalCount(filtered.length);
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

  const handleViewClick = (customer: any) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#734A00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start my-[10px] justify-between">
          <div className="flex items-center justify-start mb-0">
            <img src="PremiumLoyalty.png" className="h-[37px] w-[37px]" alt={t("premiumIcon")} />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">{t("addRemoveCustomers")}</h2>
          </div>
          <button
            onClick={() => router.push("/register-as-customer")}
            className="cursor-pointer flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition"
          >
            <span>{t("addNew")}</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
          <p className="mt-[20px] mb-[20px] flex items-center text-gray-500 text-sm lg:text-lg">{t("customersAddRemove")}</p>
          <div className="flex items-center justify-center w-full lg:w-[398px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full border border-gray-300 rounded-full pl-10 pr-[110px] py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm">{t("search")}</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-sm lg:text-base">
                <th className="py-3 px-4">{t("lastFirstName")}</th>
                <th className="py-3 px-4">{t("emailRegistration")}</th>
                <th className="py-3 px-4">{t("lastOrder")}</th>
                <th className="py-3 px-4">{t("purchases")}</th>
                <th className="py-3 px-4">{t("loyaltyPoints")}</th>
                <th className="py-3 px-4">{t("loyaltyTitle")}</th>
                <th className="py-3 px-4">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((c, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition text-sm lg:text-base">
                  <td className="py-3 px-4">{c.lastName} {c.firstName}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4">{c.orders}</td>
                  <td className="py-3 px-4">€ {Number(c.amountSpent).toFixed()}</td>
                  <td className="py-3 px-4">{c.points}</td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        className="cursor-pointer active:scale-90 transform transition duration-150 ease-in-out"
                        onClick={() =>
                          router.push(`/register-as-customer/?customerId=${encodeURIComponent(c.id)}`)
                        }
                      >
                        <img src="Edit.png" alt={t("edit")} className="cursor-pointer w-[25px] lg:w-[33px]" />
                      </button>
                      {editingTitle === c.id ? (
                        <input type="text" defaultValue={c.loyaltyTitle} autoFocus className="border border-gray-300 rounded px-2 py-1 text-sm w-[120px]" />
                      ) : (
                        c.loyaltyTitle
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <button className="cursor-pointer active:scale-90 transform transition duration-150 ease-in-out" onClick={() => handleDeleteClick(c)}>
                        <img src="dustbinpremium.png" alt={t("delete")} className="w-[25px] lg:w-[33px]" />
                      </button>
                      <button className="cursor-pointer active:scale-90 transform transition duration-150 ease-in-out" onClick={() => handleViewClick(c)}>
                        <img src="printpremium.png" alt={t("viewProfile")} className="w-[25px] lg:w-[33px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-4 text-xs lg:text-sm text-gray-500 gap-2">
          <span>{t("totalCustomers", { count: totalCount })}</span>
        </div>
      </div>

      {/* Pagination */}
      {/* ...pagination logic stays the same... */}

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
          customer={{
            ...selectedCustomer,
            name: `${selectedCustomer.lastName ?? ""} ${selectedCustomer.firstName ?? ""}`.trim(),
          }}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default LoyalCustomersList;
