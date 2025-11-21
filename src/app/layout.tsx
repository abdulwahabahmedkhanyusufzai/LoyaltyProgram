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

// Helper to dynamically load and merge multiple JSON files
async function loadLocaleMessages(locale: string) {
    const messageFiles = ["stats", "loyaltyTable", "nav", "header", "analytics", "calendar", "tabs", "loyalCustomer", "sendEmail", "customer", "homeSection", "registerCustomer"]; // add other files if needed
    const messagesArray = await Promise.all(
        messageFiles.map(async (file) => {
            const module = await import(`../messages/${locale}/${file}.json`);
            return module.default;
        })
    );
    // Merge all messages into a single object
    return Object.assign({}, ...messagesArray);
}

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

    // Load and merge messages from multiple files
    const messages = await loadLocaleMessages(locale);

    return (
        <html lang={locale}>
            <body className={`${interTight.className} antialiased`}>
                <UserProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <ClientLayout>

                            {children}

                        </ClientLayout>
                    </NextIntlClientProvider>
                </UserProvider>
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            </body>
        </html>
    );
}
