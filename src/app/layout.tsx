// layout.tsx (server)
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/components/ClientLayout";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/lib/UserContext";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

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
}: {
    children: React.ReactNode;
}) {
    // Get user's language preference from cookie
    const cookieStore = await cookies();
    const userLanguage = cookieStore.get('userLanguage')?.value || 'English';

    // Map "English" and "French" to locale codes
    const locale = userLanguage.toLowerCase() === 'french' ? 'fr' : 'en';

    // Load the appropriate messages
    const messages = (await import(`../messages/${locale}.json`)).default;

    return (
        <html lang={locale}>
            <body className={`${interTight.className} antialiased`}>
                <UserProvider>
                    <ClientLayout>
                        <NextIntlClientProvider locale={locale} messages={messages}>
                            {children}
                        </NextIntlClientProvider>
                    </ClientLayout>
                </UserProvider>
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            </body>
        </html>
    );
}
