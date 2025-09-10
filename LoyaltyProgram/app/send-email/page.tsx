"use client";
import { useState } from "react";
import { Header } from "../components/Header";
import Tabs from "../components/ButtonGroup";
import { Search } from "lucide-react";

function LoyalCustomersList() {
  const [selectedOption, setSelectedOption] = useState("hosts");
  const [step, setStep] = useState(1); // step 1 = recipients, step 2 = email template
  const [selectedTab, setSelectedTab] = useState("Home"); // ✅ default is email tab

  const radioOptions = ["hosts", "guests", "welcomed", "A particular person", "test", "all"];

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });

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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = () => {
    alert(`Email sent to: ${form.recipient}`);
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen lg:ml-[342px]">
      <Header />

      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start my-[10px] justify-between">
          <div className="flex items-center justify-start mb-0">
            <img src="PremiumLoyalty.png" className="h-[37px] w-[37px]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
              Send an Email
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          type="emails"
          onChange={(tab) => {
            setSelectedTab(tab);
            if (tab === "Send an Email") setStep(2);
            if (tab === "Home") setStep(1)
            if(tab == "Customers") setStep(2) // reset when re-selecting
          }}
          activeTab={selectedTab}
        />
         
        {/* --- SEND EMAIL TAB FLOW --- */}
          {selectedTab === "Customers" && (
          <>
            {step === 2 && (
              <>
                <div className="flex justify-end text-center">
                
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
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Purchases (€)</th>
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
                    {c.title}
                  </td>
                   <td className="py-3 px-4 text-[#2C2A25] font-medium">
                    <img src="Emailbtn.png" className="w-[36px] h-[36px]"/>
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
      
    
              </>
            )}
            </>
            )}
         {selectedTab === "Home" && (
          <>
            {step === 1 && (
              <>
                {/* Step 1: Recipients */}
                <div className="flex justify-center font-bold text-center text-lg sm:text-xl">
                  Sending a targeted Email
                </div>

                <div className="flex items-center justify-center my-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
                    Choose the recipient group
                  </h1>
                </div>

                {/* Inline Radios */}
                <div className="my-10 flex flex-wrap justify-center gap-6 mb-6">
                  {radioOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
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

                {/* Next */}
                <div className="my-10 flex justify-center">
                  <button
                    onClick={() => setStep(2)}
                    className="w-[474px] px-8 py-2 rounded-full bg-[#6a4e1e] text-white font-medium shadow-md hover:bg-[#5a3f19] transition"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            </>
            )}
            {selectedTab === "Send an Email" && step === 2 && (
              <>
                {/* Step 2: Email template */}
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

                  {/* Email Preview */}
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
                        <span className="text-[#F1DAB0CC] text-[40px] sm:text-[53px] font-extrabold block mt-2">
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
              </>
            )}
          
       
      </div>
    </div>
  );
}

export default LoyalCustomersList;
