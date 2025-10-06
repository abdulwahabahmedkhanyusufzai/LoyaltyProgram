import { Search } from "lucide-react"
import { useEffect, useState } from "react";
import { customerService } from "../utils/CustomerService";

const CustomerList = () => {
      const [searchTerm, setSearchTerm] = useState("");
      const [loading, setLoading] = useState(true);
      const [customers, setCustomers] = useState<any[]>([]);
      const [totalCount, setTotalCount] = useState<number>(0);
      const [page, setPage] = useState(1);


const PAGE_SIZE = 10;
const totalPages = Math.ceil(totalCount / PAGE_SIZE);
 const currentCustomers = customers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const endIndex = Math.min(page * PAGE_SIZE, totalCount);
      useEffect(() => {
        async function loadData() {
          setLoading(true);
          try {
            const [fetchedCustomers, count, pointsData] = await Promise.all([
              customerService.fetchCustomers(),
              customerService.fetchCustomerCount(),
              customerService.fetchCustomerPoints()
            ]);
      
            // Convert pointsData to a map: { id -> loyaltyPoints }
            const pointsMap = new Map(pointsData.map(p => [p.id, p.loyaltyPoints]));
      
            // Attach points to each customer
            const customersWithPoints = fetchedCustomers.map(cust => ({
              ...cust,
              loyaltyPoints: pointsMap.get(cust.id) ?? 0
            }));
             console.log("Fetched customers with points:", customersWithPoints);
            // Example: sort by spent or points
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
        
    return(
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
                  placeholder="Search by name, title, email, date"
                  className="w-full border border-gray-300 rounded-full pl-10 pr-[110px] py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                   disabled={loading}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#734A00] text-white h-[40px] w-[90px] rounded-[32px] text-sm">
                  Search
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="min-w-[900px] w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3 px-4">Last / First Name</th>
                    <th className="py-3 px-4">Email / Registration</th>
                    <th className="py-3 px-4">Last Orders</th>
                    <th className="py-3 px-4">Purchases (€)</th>
                    <th className="py-3 px-4">Loyalty Title</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers ? ( 
                    currentCustomers.map((c: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">
                          {c.lastName} {c.firstName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{c.email}</td>
                        <td className="py-3 px-4">{c.numberOfOrders}</td>
                        <td className="py-3 px-4">€ {Number(c.amountSpent)}</td>
                        <td className="py-3 px-4 text-green-600 font-medium">
                          {c.loyaltyTitle}
                        </td>
                      </tr>
                    ))
                  ):(
                    <div>Loading...</div>
                  )}
                </tbody>
              </table>
              {/* 👇 Now showing the total customer count */}
              <span>Total Customers: {totalCount}</span>
            </div>
          </>
    )
}

export default CustomerList;