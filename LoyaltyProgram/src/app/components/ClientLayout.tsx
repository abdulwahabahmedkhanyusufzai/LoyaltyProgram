// components/ClientLayout.tsx (client)
"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import {Header} from "./Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Header onToggle={setOpen}  />
      <Sidebar open={open} setOpen={setOpen} />
      <main className="ml-[0px] lg:ml-[290px] 2xl:ml-[342px] transition-all">
        {children}
      </main>
    </>
  );
}
