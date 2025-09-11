import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // choose what you need
  variable: "--font-inter-tight", // ✅ add this if you want to use CSS variable
});

export const metadata: Metadata = {
  title: "Waro | Loyalty Program",
  description: "Waro the Loyalty Program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.className} antialiased`}>
       
        <Sidebar/>
        {children}
      </body>
    </html>
  );
}
