"use client";
import { useState } from "react";
import Tabs from "../components/ButtonGroup";
import { Search } from "lucide-react";

const LoginModal = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple validation for demonstration
    if (username === "admin" && password === "password") {
      onLogin();
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300">
      <div className="bg-[#fffef9] p-8 rounded-2xl shadow-2xl max-w-lg w-full relative transform scale-95 opacity-0 transition-transform duration-300 ease-in-out">
        {/* Modal content */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold rounded-full w-8 h-8 flex items-center justify-center">
          &times;
        </button>

        <div className="text-center">
          <div className="p-4 bg-gray-200 rounded-full inline-block mb-4">
            <svg
              className="w-12 h-12 text-[#734A00]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4.5h13.856c-.53-.787-1.166-1.503-1.898-2.148-1.503-1.353-3.235-2.03-5.06-2.03s-3.557.677-5.06 2.03c-.732.645-1.368 1.361-1.898 2.148zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2C2A25] mb-2">Log In Required</h2>
          <p className="text-gray-600 mb-6">Please log in to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f1dab0] focus:border-transparent transition-all duration-200"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f1dab0] focus:border-transparent transition-all duration-200"
          />
          {showError && (
            <p className="text-red-500 text-sm text-center">
              Invalid username or password.
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-6 bg-[#734A00] text-white py-3 rounded-full font-bold shadow-md hover:bg-[#5a3800] transition-colors duration-200"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageBox = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300">
      <div className="bg-[#fffef9] p-8 rounded-2xl shadow-2xl max-w-sm w-full relative">
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#2C2A25] mb-4">Message</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-[#734A00] text-white py-3 rounded-full font-bold hover:bg-[#5a3800] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

function LoyalCustomersList() {
  const [selectedOption, setSelectedOption] = useState("hosts");
  const [step, setStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const radioOptions = ["hosts", "guests", "welcomed", "A particular person", "test", "all"];

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });

  const [customers] = useState([
    { name: "Lorem Ipsum", email: "johanne@yahoo.com", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "shleysyze@hotmail.com", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "nath.zolo@free.fr", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "christian_leveque@orange.fr", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "maryse.guivarch@gmail.com", lastOrder: "03.11.2024", points: "4 points", purchases: "€48.9", title: "Welcomed" },
  ]);
    const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = () => {
    alert(`Email sent to: ${form.recipient}`);
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
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
                  {customers.map((c, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{c.email}</td>
                      <td className="py-3 px-4">{c.lastOrder}</td>
                      <td className="py-3 px-4">{c.points}</td>
                      <td className="py-3 px-4">{c.purchases}</td>
                      <td className="py-3 px-4 text-[#2C2A25] font-medium">{c.title}</td>
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
    </div>
  );
}

export default LoyalCustomersList;
