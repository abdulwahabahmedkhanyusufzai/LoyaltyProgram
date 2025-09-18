"use client";
import { useEffect, useState, } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

function LoyalCustomersList() {
  const router = useRouter();
  const [customers,setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState<number>(0); // 👈 new
 const [page, setPage] = useState(1);
  const [loading,setLoading] = useState(false);

  
const PAGE_SIZE = 10;
const totalPages = Math.ceil(totalCount / PAGE_SIZE);
 const currentCustomers = customers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const endIndex = Math.min(page * PAGE_SIZE, totalCount);

  
   const fetchCustomers = async (after: string | null = null) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customers?first=30${after ? `&after=${after}` : ""}`
      );
      const data = await res.json();
      console.log("Customer data",data.customers.map((customer) => customer.node));
      const fetchedCustomers = data?.customers.map((e: any) => e) || [];
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    }finally{
      setLoading(false)
    }
  };

  const fetchCustomerCount = async () => {
    try {
      const res = await fetch(`/api/customers?mode=count`);
      const data = await res.json();
      setTotalCount(data.count ?? 0);
    } catch (error) {
      console.error("❌ Error fetching customer count:", error);
    }
  };

   useEffect(() => {
      fetchCustomers();
      fetchCustomerCount(); // 👈 also fetch count
    }, []);

     const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(Number(e.target.value));
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
            <img
              src="PremiumLoyalty.png"
              className="h-[37px] w-[37px]"
              alt="Premium loyalty icon"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Add or Remove Customers
            </h2>
          </div>
          <button onClick={() => router.push("/register-as-customer")} className="cursor-pointer flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            <span>Add New</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
          <p className="text-gray-500 text-sm lg:text-lg">Customers Add or Remove</p>
          <div className="w-full lg:w-[398px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, title, email, date"
              className="w-full border border-gray-300 rounded-full pl-10 pr-[110px] py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm">
              Search
            </button>
          </div>
        </div>

        {/* Table with drag-to-scroll */}
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
              {currentCustomers.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition text-sm lg:text-base"
                >
                  <td className="py-3 px-4">{c.lastName} {c.firstName}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4">{c.numberOfOrders}</td>
                  <td className="py-3 px-4"> € {c.amountSpent?.amount}</td>
                  <td className="py-3 px-4">0</td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <img src="Edit.png" alt="" className="w-[25px] lg:w-[33px]" />
                      Welcomed
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <img src="dustbinpremium.png" alt="" className="w-[25px] lg:w-[33px]" />
                      <img src="printpremium.png" alt="" className="w-[25px] lg:w-[33px]" />
                    </div>
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
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          
          <div className="flex items-center justify-between w-[300px]">
         <select
          value={page}
          onChange={handlePageChange}
          className="border border-[#DEDEDE] rounded-full px-2 py-1"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
         Showing  {page} to {totalPages} of {endIndex} entries 
         </div>
          <div className="space-x-5">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
    if (
      p === 1 || // always show first page
      p === totalPages || // always show last page
      (p >= page - 1 && p <= page + 1) // show pages around current
    ) {
      return (
        <button
          key={p}
          onClick={() => setPage(p)}
          style={{ boxShadow: "2px 2px 2px 0px #00000040" }}
          className={`px-3 py-1 rounded ${
            page === p ? "bg-[#FEFCED] text-black" : "bg-[#FEFCED] text-gray-500"
          }`}
        >
          {p}
        </button>
      );
    } else if (
      p === page - 2 || // add left ellipsis
      p === page + 2 // add right ellipsis
    ) {
      return <span key={p}>...</span>;
    } else {
      return null; 
    }
  })}
  </div>
        </div>
    </div>
  );
}

export default LoyalCustomersList;
