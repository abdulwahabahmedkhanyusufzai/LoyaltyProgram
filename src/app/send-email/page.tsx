"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import Tabs from "../components/ButtonGroup";
import LoginList from "../components/login";
import { Loader } from "./Loader";
import Header from "./Header";
import CustomerSection from "./CustomerSectrion";
import HomeSection from "./HomeSection";
import SendEmail from "./SendEmail";
import HandlePageChange from "./HandlePageChange";
import { useCustomers } from "./hooks/useCustomer";

function LoyalCustomersList() {
  const t = useTranslations("loyalCustomers"); // translation namespace

  const [step, setStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState("home");
  const { customers, totalCount, loading } = useCustomers();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [recipientGroup, setRecipientGroup] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const customerParam = params.get("customers");

    if (emailParam) {
      setSelectedEmail(emailParam);
      setSelectedTab("sendEmail");
      setStep(2);
    } else if (customerParam) {
      setSelectedTab("customers");
      setStep(1);
    } else {
      setSelectedTab("home");
      setStep(0);
    }
  }, [typeof window !== "undefined" ? window.location.search : ""]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) setIsLoggedIn(true);
        else setShowLogin(true);
      } catch (err) {
        setShowLogin(true);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleEmailClick = (email: string) => {
    setSelectedEmail(email);
    setSelectedTab("sendEmail");
    setStep(2);
  };

  const handleGroupSelect = (group: string) => {
    setRecipientGroup(group);
  };

  // Filter customers based on selected group and search query
  const filteredCustomers = customers.filter((c) => {
    // 1. Filter by Group
    let groupMatch = true;
    const title = c.loyaltyTitle?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";

    if (recipientGroup === "hosts") groupMatch = title === "host";
    else if (recipientGroup === "guests") groupMatch = title === "guest";
    else if (recipientGroup === "test") groupMatch = email.includes("test");
    // "welcomed", "all", "specificPerson" show all in list (or handled in bulk step)
    
    if (!groupMatch) return false;

    // 2. Filter by Search Query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(query) ||
      c.lastName?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  });

  // Calculate target customers for BULK sending (Step 2)
  const targetCustomers = customers.filter((c) => {
    if (recipientGroup === "all") return true;
    
    const title = c.loyaltyTitle?.toLowerCase() || "";
    if (recipientGroup === "welcomed") return title === "welcomed" || title === "";
    
    if (recipientGroup === "test") {
      return c.email?.toLowerCase().includes("test");
    }
    
    // For manual groups (hosts, guests, specific), targetCustomers isn't used for bulk
    return false; 
  });

  const PAGE_SIZE = 10;
  const currentCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-7 space-y-6 bg-white min-h-screen">
      {!isLoggedIn && showLogin && (
        <LoginList onClose={() => setShowLogin(false)} onLogin={handleLoginSuccess} />
      )}

      <div className="max-w-6xl mx-auto bg-[#fffef9] rounded-2xl shadow-sm border border-gray-200 p-6">
        <Header />
        <Tabs
          type="emails"
          onChange={(tab) => {
            setSelectedTab(tab);
            if (tab === "sendEmail") setStep(2);
            if (tab === "home") setStep(0);
            if (tab === "customers") setStep(1);
          }}
          activeTab={selectedTab}
        />

        {selectedTab === "customers" && step === 1 && (
          <CustomerSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentCustomers={currentCustomers}
            onEmailClick={handleEmailClick}
          />
        )}

        {selectedTab === "home" && step === 0 && (
          <HomeSection 
            setStep={setStep} 
            setSelectedTab={setSelectedTab} 
            onSelectGroup={handleGroupSelect}
          />
        )}

        {selectedTab === "sendEmail" && step === 2 && (
          <SendEmail 
            customers={customers} 
            targetCustomers={targetCustomers}
            prefillEmail={selectedEmail} 
          />
        )}
      </div>

      {selectedTab === "customers" && step === 1 && (
        <HandlePageChange
          page={page}
          setPage={setPage}
          PAGE_SIZE={PAGE_SIZE}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}

export default LoyalCustomersList;
