"use client";
import { Suspense, useEffect, useState } from "react";
import Tabs from "../components/ButtonGroup";
import LoginList from "../components/login";
import { Loader } from "./Loader";
import Header from "./Header";
import CustomerSection from "./CustomerSectrion";
import HomeSection from "./HomeSection";
import SendEmail from "./SendEmail";
import HandlePageChange from "./HandlePageChange";
import { useCustomers } from "./hooks/useCustomer";
import { useSearchParams } from "next/navigation";

function LoyalCustomersList() {

   const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";
  const [step, setStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Home");
  const { customers, totalCount, loading } = useCustomers();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
  if (prefillEmail) {
    setSelectedEmail(prefillEmail);
    setSelectedTab("Send an Email");
    setStep(2);
  }
}, [prefillEmail,loading]);

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
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;
 
  const currentCustomers = customers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
 
  if (loading) {
    return (
      <Loader/>
    );
  }


    const handleEmailClick = (email: string) => {
  setSelectedEmail(email);
  setSelectedTab("Send an Email");
};


  return (
    <Suspense fallback={<Loader />}>
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      {!isLoggedIn && showLogin && (
        <LoginList
          onClose={() => setShowLogin(false)}
          onLogin={handleLoginSuccess}
        />
      )}
      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        
        <Header/>
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
          <CustomerSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentCustomers={currentCustomers} onEmailClick = {handleEmailClick}/>
        )}

        {/* Home Tab */}
        {selectedTab === "Home" && step === 1 && (
       <HomeSection setStep={setStep} setSelectedTab={setSelectedTab}/>
        )}

        {/* Send an Email Tab */}
        {selectedTab === "Send an Email" && step === 2 && (
          <SendEmail customers={customers} prefillEmail={selectedEmail}/>
        )}
      </div>
      {selectedTab === "Customers" && step === 2 && (
      <HandlePageChange page={page} setPage={setPage} PAGE_SIZE={PAGE_SIZE} totalCount={totalCount} />
      )}
    </div>
    </Suspense>
  );
}

export default LoyalCustomersList;
