"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Header } from "../components/Header";
import Tabs, { ToggleNav } from "../components/ButtonGroup";

 function LoyalCustomersList() {
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
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen lg:ml-[342px]">
     <Header/>
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
          <div className="flex items-start my-[10px] justify-between">
          <div className="flex items-center justify-start mb-0">
        <img src="PremiumLoyalty.png" className="h-[37px] w-[37px]"/>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
          Add or Remove Customers
        </h2>
        </div>
          <button className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            <span>Add New</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
       </div>


        {/* Search Bar */}
        <div className="flex justify-between text-center">
                  <p className="text-gray-500 mt-1">
            Customers Add or Remove
          </p>
      <div className="w-[398px] relative mb-6">
  {/* Search Icon */}
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

  {/* Input */}
  <input
    type="text"
    placeholder="Search by name, title, email, date"
    className="w-full border border-gray-300 rounded-full pl-10 pr-[110px] py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
  />

  {/* Button inside input */}
  <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm">
    Search
  </button>
</div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
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
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4">{c.lastOrder}</td>
                  <td className="py-3 px-4">{c.points}</td>
                  <td className="py-3 px-4">{c.purchases}</td>
                  <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center justify-center gap-[5px]">
                    <img src="Edit.png" className="flex items-center justify-center w-[36px] w-[33px]"/>
                    {c.title}
                  </div>
                  </td>
                   <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <div className="flex items-center justify-center">
                    <img src="dustbinpremium.png" className="flex items-center justify-center w-[36px] w-[33px]"/>
                    <img src="printpremium.png" className="flex items-center justify-center w-[36px] w-[33px]"/>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>Total Customers: 620</span>
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded-md px-2 py-1">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>Showing 1 to 25 of 5 entities</span>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default LoyalCustomersList;