import { PrismaClient } from "@prisma/client";
// Assume the 'Order' and 'Shop' types are available from the Prisma client,
// though for this example we'll use a placeholder type for the order node
// that is returned from Shopify.

// Initialize Prisma Client
const prisma = new PrismaClient();

// --- Configuration Constants ---
const SHOPIFY_API_VERSION = "2025-10";
const SHOPIFY_GRAPHQL_ENDPOINT = (shop: string) => 
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// --- Type Definition (for clarity) ---
type ShopifyOrderNode = {
    id: string; // The GraphQL ID (e.g., "gid://shopify/Order/123456")
    name: string; // The customer-facing order number (e.g., "#1001")
};


// ----------------------------------------------------
// Shopify GraphQL Fetcher
// ----------------------------------------------------
/**
 * Fetches a Shopify Order by its customer-facing name (order number).
 * Handles adding the '#' prefix and URL/network errors.
 */
async function fetchOrderFromShopify(shop: string, accessToken: string, orderNumber: string): Promise<ShopifyOrderNode | null> {
    const operationName = "getOrderByName"; // Add operation name for better logging
    const query = `
        query ${operationName}($query: String!) {
            orders(first: 1, query: $query) {
                edges {
                    node {
                        id 
                        name
                    }
                }
            }
        }
    `;

    // DEBUG STEP 1: Construct the robust query string for the order name
    // The query must match the customer-facing name, often including the '#' prefix.
    const customerFacingName = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
    // The GraphQL query string requires surrounding quotes and escaping, 
    // e.g., 'name:"#1001"'.
    const graphQLQueryString = `name:\"${customerFacingName}\"`; 

    const variables = {
        query: graphQLQueryString,
    };

    console.log(`   - 📞 Fetching with GraphQL Query: ${graphQLQueryString}`);

    try {
        const url = SHOPIFY_GRAPHQL_ENDPOINT(shop);
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
            },
            body: JSON.stringify({ query, variables, operationName }),
        });

        // DEBUG STEP 2: Check for non-200 HTTP status codes
        if (!res.ok) {
            const statusText = res.statusText || 'Unknown Error';
            const responseBody = await res.text();
            console.error(`   - ❌ HTTP Error ${res.status} (${statusText}) for ${orderNumber}. Response: ${responseBody.substring(0, 200)}...`);
            return null;
        }

        const json = await res.json();

        // DEBUG STEP 3: Check for GraphQL errors (e.g., syntax, permissions)
        if (json.errors) {
            console.error("   - ❌ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
            return null;
        }

        // DEBUG STEP 4: Safely access the order data using optional chaining
        const order: ShopifyOrderNode | undefined = json.data?.orders?.edges?.[0]?.node;
        
        if (!order) {
            console.log(`   - 🔍 Order not found on Shopify for query: ${graphQLQueryString}`);
            return null;
        }

        return order;
    } catch (e) {
        // DEBUG STEP 5: Catch network/fetch-level errors
        console.error(`   - ❌ Network/Fetch Error for ${orderNumber}:`, e instanceof Error ? e.message : String(e));
        return null;
    }
}

// ----------------------------------------------------
// Main Runner (Backfill Orchestrator)
// ----------------------------------------------------
/**
 * Main function to orchestrate the backfill process.
 */
async function run() {
    console.log("================================================");
    console.log("🔍 Starting Shopify Order ID Backfill Process...");
    console.log(`================================================\n`);

    // --- 1. Get Shop Credentials ---
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) {
        console.error("❌ CRITICAL: No shop record found in DB. Aborting script.");
        await prisma.$disconnect();
        return;
    }

    const { shop, accessToken } = shopRecord;
    console.log(`✅ Loaded credentials for shop: ${shop}`);

    // --- 2. Query Orders Missing IDs ---
    try {
        // Find records where shopifyOrderId is null/undefined AND orderNumber is a non-empty string.
        const ordersToProcess = await prisma.order.findMany({
            where: {
                shopifyOrderId: null,
                orderNumber: { not: "" },
            },
            orderBy: { id: 'asc' } // Process in a predictable order
        });

        console.log(`📌 Found ${ordersToProcess.length} orders to backfill.\n`);

        // --- 3. Process Each Order ---
        let successfulUpdates = 0;
        let recordsSkipped = 0;

        for (const order of ordersToProcess) {
            const dbRecordId = order.id;
            const rawOrderNumber = order.orderNumber;
            
            console.log(`--- Processing DB Record ID: ${dbRecordId} (Order: ${rawOrderNumber}) ---`);

            // DEBUG STEP 6: Input validation before calling external API
            if (!rawOrderNumber || typeof rawOrderNumber !== 'string' || rawOrderNumber.trim() === '') {
                console.warn(`   - ⚠️ Skipping (Validation): OrderNumber is invalid/empty for DB ID ${dbRecordId}.`);
                recordsSkipped++;
                continue;
            }
            
            const cleanOrderNumber = rawOrderNumber.trim();
            
            const shopifyOrder = await fetchOrderFromShopify(
                shop,
                accessToken,
                cleanOrderNumber
            );

            if (!shopifyOrder) {
                console.log(`   - ⚠️ Lookup failed for ${cleanOrderNumber}. Skipping update.`);
                continue;
            }

            // DEBUG STEP 7: Verify structure and content of the discovered order
            if (!shopifyOrder.id || !shopifyOrder.name) {
                console.error(`   - ❌ DISCOVERY FAILED: Shopify Order object is missing ID or Name for ${cleanOrderNumber}. Data:`, shopifyOrder);
                continue;
            }

            console.log(`   - 🟢 DISCOVERY SUCCESS: Found Shopify ID: **${shopifyOrder.id}** (Name: ${shopifyOrder.name})`);

            // --- 4. Update Database Record ---
            try {
                const updateResult = await prisma.order.update({
                    where: { id: dbRecordId },
                    data: { shopifyOrderId: shopifyOrder.id },
                });

                console.log(`   - 💾 SUCCESS: Updated DB ID ${dbRecordId} with Shopify ID ${updateResult.shopifyOrderId}`);
                successfulUpdates++;
            } catch (updateError) {
                // DEBUG STEP 8: Catch database specific update errors (e.g., unique constraint violation)
                console.error(`   - ❌ DB Update Error for DB ID ${dbRecordId}:`, updateError instanceof Error ? updateError.message : String(updateError));
            }

            console.log(`-------------------------------------------------\n`);
        }

        console.log("\n================================================");
        console.log("🎯 Backfill Process Summary");
        console.log(`================================================`);
        console.log(`Total Orders Queried: ${ordersToProcess.length}`);
        console.log(`Successful DB Updates: ${successfulUpdates}`);
        console.log(`Records Skipped (Invalid Input): ${recordsSkipped}`);
        console.log(`Remaining to Backfill (or failed API lookup): ${ordersToProcess.length - successfulUpdates - recordsSkipped}`);

    } catch (e) {
        console.error("❌ ERROR during main backfill loop:", e);
    } finally {
        console.log("\n🧹 Disconnecting Prisma client...");
        await prisma.$disconnect();
        console.log("✅ Script finished.");
    }
}

// --- Error Handling & Execution ---
run().catch((err) => {
    console.error("\n❌ CRITICAL SCRIPT FAILURE - Uncaught Exception:", err);
    // Ensure disconnect on unexpected crash outside the main try/catch block
    prisma.$disconnect();
});