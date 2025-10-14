"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Custom hook with proper safety check
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser() must be used inside a <UserProvider>");
  }
  return context;
};
