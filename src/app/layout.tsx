// src/app/layout.tsx
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/components/ClientLayout";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/lib/UserContext";


const interTight = Inter_Tight({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-inter-tight",
});

export const metadata: Metadata = {
    title: "Waro | Loyalty Program",
    description: "Waro the Loyalty Program",
};


export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html>
            <body className={`${interTight.className} antialiased`}>
                <UserProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </UserProvider>
                <Toaster position="top-center" reverseOrder={false} />
            </body>

        </html>
    );
}

// NOTE: You must also move the shared metadata and font definitions
// to src/app/layout.tsx or keep them in the client-side layout,
// depending on your preference.