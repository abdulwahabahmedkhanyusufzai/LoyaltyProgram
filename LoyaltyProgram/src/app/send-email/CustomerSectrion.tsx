import { Search } from "lucide-react";
import { FloatingInput } from "../components/FloatingInput";

const CustomerSection = ({searchQuery,setSearchQuery,currentCustomers}) => {
  return (
    <>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center text-center">
        <div className="w-full sm:w-[398px] relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <FloatingInput
            id="Search"
            type="text"
            placeholder="Search by name, title, email, date"
            value={searchQuery} // ✅ bind value
            onChange={(e) => setSearchQuery(e.target.value)} // ✅ pass function
          />

          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm">
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-3 px-4">Last Name / First Name</th>
              <th className="py-3 px-4">Email / Registration</th>
              <th className="py-3 px-4">Last Order</th>
              <th className="py-3 px-4">Loyalty Points</th>
              <th className="py-3 px-4">Purchases (€)</th>
              <th className="py-3 px-4">Loyalty Title</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((c, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">
                  {c.lastName} {c.firstName}
                </td>
                <td className="py-3 px-4 text-gray-600">{c.email}</td>
                <td className="py-3 px-4">{c.numberOfOrders}</td>
                <td className="py-3 px-4">{c.amountSpent}</td>
                <td className="py-3 px-4">€ {c.amountSpent}</td>
                <td className="py-3 px-4 text-[#2C2A25] font-medium">
                  {c.loyaltyTitle}
                </td>
                <td className="py-3 px-4 text-[#2C2A25] font-medium">
                  <img
                    src="Emailbtn.png"
                    alt=""
                    className="w-[36px] h-[36px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-500 gap-2">
        <span>Total Customers: 620</span>
      </div>
    </>
  );
};

export default CustomerSection;