import { useRouter } from "next/navigation";
import { LoyaltyTableCustomers } from "../data/customData";
export const LoyaltyTable = () => {
 const router = useRouter();
 
    
  return (
    <div className="w-full lg:w-[724px] lg:h-[500px] 2xl:w-[949px] 2xl:h-[533px] border border-[#2C2A25] rounded-[24px] sm:rounded-[32px] p-3 sm:p-6 flex flex-col">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-[16px] sm:text-[18px] font-semibold">Customers Overview</h1>
        <div className="flex flex-wrap gap-2 sm:gap-[5px]">
          <button onClick={() => router.push("/register-as-customer")} className="cursor-pointer flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            <span>Add New</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
          <button className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            Aug
          </button>
          <button onClick={()=> router.push("/add-remove-loyal") } className="cursor-pointer hover:bg-[#D9D9D9] border-[#2C2A25] w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full border flex items-center justify-center">
            <img src={`arrow.png`} className="w-[16px] sm:w-auto h-[16px] sm:h-auto" alt="arrow" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto mt-4">
        <table className="w-full border-collapse min-w-[600px]">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-[#D2D1CA] text-left text-[#2C2A25] text-[12px] sm:text-[14px] font-medium">
              <th className="p-2 sm:p-3 rounded-tl-[12px] uppercase">Customer</th>
              <th className="p-2 sm:p-3 uppercase">Total Points</th>
              <th className="p-2 sm:p-3 uppercase">Amount of Orders</th>
              <th className="p-2 sm:p-3 rounded-tr-[12px] uppercase">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="text-[13px] sm:text-[15px] text-[#2C2A25]">
            {LoyaltyTableCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#D2D1CA]">
                <td className="flex items-center p-2 sm:p-3">
                  <img
                    src={customer.img}
                    alt={customer.name}
                    className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full mr-[12px] sm:mr-[20px]"
                  />
                  {customer.name}
                </td>
                <td className="p-2 sm:p-3">{customer.points}</td>
                <td className="p-2 sm:p-3">{customer.orders}</td>
                <td className="p-2 sm:p-3">
                  <div className="flex gap-2 sm:gap-[10px]">
                    <button className="hover:opacity-70">
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
      </div>
    </div>
  );
};
