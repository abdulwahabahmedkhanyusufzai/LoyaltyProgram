"use client";
import { useState, } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

function LoyalCustomersList() {
  const router = useRouter();
  const [customers] = useState([
    {
      name: "Lorem Ipsum",
      email: "johanne@yahoo.com",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "shleysyze@hotmail.com",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "nath.zolo@free.fr",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "christian_leveque@orange.fr",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "maryse.guivarch@gmail.com",
      lastOrder: "03.11.2024",
      points: "4 points",
      purchases: "€48.9",
      title: "Welcomed",
    },
  ]);

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
              {customers.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition text-sm lg:text-base"
                >
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4">{c.lastOrder}</td>
                  <td className="py-3 px-4">{c.purchases}</td>
                  <td className="py-3 px-4">{c.points}</td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center gap-2">
                      <img src="Edit.png" alt="" className="w-[25px] lg:w-[33px]" />
                      {c.title}
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
          <span>Total Customers: 620</span>
        </div>
        
      </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded-full w-[77px] h-[39px] px-2 py-1">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>Showing 1 to 25 of 5 entities</span>
          </div>
          
        </div>
    </div>
  );
}

export default LoyalCustomersList;
