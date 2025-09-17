"use client";
import { useEffect, useState } from "react";
import Tabs from "../components/ButtonGroup";
import { Search } from "lucide-react";
import LoginList from "../components/login";
import {CustomerEmailData} from "../data/customData";


function LoyalCustomersList() {
  const [selectedOption, setSelectedOption] = useState("hosts");
  const [step, setStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Home");
  const radioOptions = ["hosts", "guests", "welcomed", "A particular person", "test", "all"];

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });

   const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) setIsLoggedIn(true);
        else setShowLogin(true); // show login modal if not logged in
      } catch (err) {
        setShowLogin(true);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    console.log("✅ User logged in successfully");
  };
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = () => {
    alert(`Email sent to: ${form.recipient}`);
  };

  return (
  
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
   {!isLoggedIn && showLogin && (
  <LoginList
    onClose={() => setShowLogin(false)}
    onLogin={handleLoginSuccess}  
  />
)}
     <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start my-[10px] justify-between">
          <div className="flex items-center justify-start mb-0 gap-2">
            <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">Send an Email</h2>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          type="emails"
          onChange={(tab) => {
            setSelectedTab(tab);
            if (tab === "Send an Email") setStep(2);
            if (tab === "Home") setStep(1);
            if (tab === "Customers") setStep(2);
          }}
          activeTab={selectedTab}
        />

        {/* Customers Tab */}
        {selectedTab === "Customers" && step === 2 && (
          <>
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center text-center">
              <div className="w-full sm:w-[398px] relative mb-6">
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
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{c.lastName} {c.firstName}</td>
                      <td className="py-3 px-4 text-gray-600">{c.email}</td>
                      <td className="py-3 px-4">{c.numberOfOrders}</td>
                      <td className="py-3 px-4">0</td>
                      <td className="py-3 px-4">€ {c.amountSpent?.amount}</td>
                      <td className="py-3 px-4 text-[#2C2A25] font-medium">Welcomed</td>
                      <td className="py-3 px-4 text-[#2C2A25] font-medium">
                        <img src="Emailbtn.png" alt="" className="w-[36px] h-[36px]" />
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
        )}
        
        {/* Home Tab */}
        {selectedTab === "Home" && step === 1 && (
          <>
            <div className="flex justify-center font-bold text-center text-lg sm:text-xl">
              Sending a targeted Email
            </div>

            <div className="flex items-center justify-center my-6">
              <h1 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">Choose the recipient group</h1>
            </div>

            <div className="my-10 flex flex-wrap justify-center gap-6 mb-6">
              {radioOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipient"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="accent-[#6a4e1e] w-4 h-4"
                  />
                  <span className="text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>

            <div className="my-10 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-[474px] px-8 py-2 rounded-full bg-[#6a4e1e] text-white font-medium shadow-md hover:bg-[#5a3f19] transition"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Send an Email Tab */}
        {selectedTab === "Send an Email" && step === 2 && (
          <div className="space-y-4">
            <input
              type="email"
              name="recipient"
              placeholder="To (Recipient)"
              value={form.recipient}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <div className="border border-gray-300 rounded-2xl p-4 bg-[#fffef9]">
              <div className="bg-[#734A00] text-white text-center rounded-full py-2 text-sm mb-4">
                Free shipping for over $50 and a full one-year return policy.
              </div>

              <div className="text-center p-6 bg-[#734A00] rounded-lg border border-gray-200">
                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/waro2.png" alt="Logo Icon" className="h-[39px] w-[52px]" />
                  <img src="/waro.png" alt="Logo Text" className="h-[19px] w-auto" />
                </div>

                <p className="text-lg font-semibold text-white">
                  THE WAROO <br />
                  <span className="text-[#F1DAB0CC] text-[32px] sm:text-[53px] font-extrabold block mt-2">
                    YOU HAVE WON 25 POINTS
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSend}
              className="w-full mt-4 bg-[#734A00] text-white py-3 rounded-full font-semibold hover:bg-[#5a3800] transition"
            >
              Send an Email
            </button>
          </div>
        )}
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
