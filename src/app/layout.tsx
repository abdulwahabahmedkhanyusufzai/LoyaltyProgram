// layout.tsx (server)
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/components/ClientLayout";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/lib/UserContext";
import { NextIntlClientProvider } from 'next-intl';

const interTight = Inter_Tight({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-inter-tight",
});

export const metadata: Metadata = {
    title: "Waro | Loyalty Program",
    description: "Waro the Loyalty Program",
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const locale = params.locale || 'en';
    const messages = (await import(`../locales/${locale}.json`)).default;
    return (
        <html lang={locale}>
            <body className={`${interTight.className} antialiased`}>
                <UserProvider>
                    <ClientLayout>
                        <NextIntlClientProvider>
                            {children}
                        </NextIntlClientProvider>
                    </ClientLayout>
                </UserProvider>
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            </body>
        </html>
    );
}
