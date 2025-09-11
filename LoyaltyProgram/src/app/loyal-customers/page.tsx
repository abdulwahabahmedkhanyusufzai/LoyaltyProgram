"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import Tabs from "../components/ButtonGroup";
import { LoyalCustomer } from "../data/customData";

 function LoyalCustomersList() {
  const [customers] = useState(LoyalCustomer);

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
          <div className="">
          <div className="flex items-center justify-start mb-0">
        <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]"/>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
          Loyal Customers List
        </h2>
        </div>
   
       </div>

        {/* Tabs */}
       <Tabs/>

        {/* Search Bar */}
         <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
          <p className="text-gray-500 text-sm lg:text-lg">Customers Registered in the loyalty program</p>
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

        

        {/* Table */}
       {/* Table */}
<div className="overflow-x-auto">
  <table className="min-w-[900px] w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-gray-200 text-gray-600">
        <th className="py-3 px-4">Last / First Name</th>
        <th className="py-3 px-4">Email / Registration</th>
        <th className="py-3 px-4">Last Order</th>
        <th className="py-3 px-4">Loyalty Points</th>
        <th className="py-3 px-4">Purchases (€)</th>
        <th className="py-3 px-4">Loyalty Title</th>
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
          <td className="py-3 px-4 text-green-600 font-medium">{c.title}</td>
        </tr>
      ))}
    </tbody>
  </table>
  <span>Total Customers: 620</span>
</div>


        {/* Footer */}
        
      </div>
      <div className="">
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
    </div>
    
  );
}

export default LoyalCustomersList;