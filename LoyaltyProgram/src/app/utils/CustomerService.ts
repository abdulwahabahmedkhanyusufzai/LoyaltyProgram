import { NextResponse } from "next/server";

// Define a type for the data returned by the customer API
export type CustomerData = {
    customers: any[]; // You can make this type more specific if needed
    count: number;
};

class CustomerService {
    // Fetches a list of customers from the API
    public async fetchCustomers(after: string | null = null): Promise<any[]> {
        try {
            const res = await fetch(`/api/customers?first=30${after ? `&after=${after}` : ""}`);
            if (!res.ok) {
                throw new Error(`API fetch failed with status: ${res.status}`);
            }
            const data = await res.json();
            return data.customers || [];
        } catch (error) {
            console.error("❌ Error fetching customers:", error);
            return [];
        }
    }

    // Fetches the total count of customers from the API
    public async fetchCustomerCount(): Promise<number> {
        try {
            const res = await fetch(`/api/customers?mode=count`);
            if (!res.ok) {
                throw new Error(`API fetch failed with status: ${res.status}`);
            }
            const data = await res.json();
            return data.count ?? 0;
        } catch (error) {
            console.error("❌ Error fetching customer count:", error);
            return 0;
        }
    }
}

// Export a single instance to be used throughout the application
export const customerService = new CustomerService();
