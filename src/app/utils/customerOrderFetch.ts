import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

// --- Configuration Constants ---
const SHOPIFY_API_VERSION = "2025-10";
const SHOPIFY_GRAPHQL_ENDPOINT = (shop: string) => 
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// --- Metafield Configuration ---
const METAFIELD_NAMESPACE = "loyalty";
const METAFIELD_KEY = "points_awarded";
const METAFIELD_TYPE = "integer"; 

// --- Type Definition (for clarity) ---
type ShopifyOrderNode = {
    id: string; // The GraphQL ID (e.g., "gid://shopify/Order/123456")
    name: string; // The customer-facing order number (e.g., "#1001")
};

// Simplified type for Prisma Order record to ensure 'pointsEarned' is accessed safely
type DbOrder = {
    id: string;
    orderNumber: string | null;
    shopifyOrderId: string | null;
    pointsEarned: number | null; 
};


// ----------------------------------------------------
// Shopify GraphQL Fetcher
// ----------------------------------------------------
/**
 * Fetches a Shopify Order by its customer-facing name (order number).
 */
async function fetchOrderFromShopify(shop: string, accessToken: string, orderNumber: string): Promise<ShopifyOrderNode | null> {
    const operationName = "getOrderByName";
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

    const customerFacingName = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
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

        // Check for non-200 HTTP status codes
        if (!res.ok) {
            const statusText = res.statusText || 'Unknown Error';
            const responseBody = await res.text();
            console.error(`   - ❌ HTTP Error ${res.status} (${statusText}) for ${orderNumber}. Response: ${responseBody.substring(0, 200)}...`);
            return null;
        }

        const json = await res.json();

        // Check for GraphQL errors
        if (json.errors) {
            console.error("   - ❌ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
            return null;
        }

        // Safely access the order data
        const order: ShopifyOrderNode | undefined = json.data?.orders?.edges?.[0]?.node;
        
        if (!order) {
            console.log(`   - 🔍 Order not found on Shopify for query: ${graphQLQueryString}`);
            return null;
        }

        return order;
    } catch (e) {
        // Catch network/fetch-level errors
        console.error(`   - ❌ Network/Fetch Error for ${orderNumber}:`, e instanceof Error ? e.message : String(e));
        return null;
    }
}

// ----------------------------------------------------
// Shopify Metafield Updater
// ----------------------------------------------------
/**
 * Updates a metafield on a Shopify Order using its GraphQL ID.
 */
async function updateOrderMetafield(
    shop: string, 
    accessToken: string, 
    orderGid: string, 
    value: number
): Promise<boolean> {
    const operationName = "updateMetafield";
    const query = `
        mutation ${operationName}($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
                metafields {
                    id
                    namespace
                    key
                    value
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    
    const variables = {
        metafields: [{
            ownerId: orderGid,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            value: String(value), // Value must be a string for API
            type: METAFIELD_TYPE,
        }],
    };

    console.log(`   - 💾 Attaching Metafield: ${METAFIELD_NAMESPACE}.${METAFIELD_KEY} = ${value} to ${orderGid}`);

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

        if (!res.ok) {
            // Log full error details for debugging non-200 responses
            const statusText = res.statusText || 'Unknown Error';
            const responseBody = await res.text();
            console.error(`   - ❌ HTTP Error ${res.status} (${statusText}) during Metafield update. Response: ${responseBody.substring(0, 200)}...`);
            return false;
        }

        const json = await res.json();

        if (json.errors) {
            console.error("   - ❌ GraphQL Errors during Metafield update:", JSON.stringify(json.errors, null, 2));
            return false;
        }

        // Check for mutation-specific user errors (e.g., invalid value/type)
        const userErrors = json.data?.metafieldsSet?.userErrors;
        if (userErrors && userErrors.length > 0) {
            console.error("   - ❌ Metafield User Errors:", JSON.stringify(userErrors, null, 2));
            return false;
        }

        console.log(`   - ✅ Metafield success: ${METAFIELD_NAMESPACE}.${METAFIELD_KEY} set to ${value}.`);
        return true;

    } catch (e) {
        console.error(`   - ❌ Network/Fetch Error during Metafield update for ${orderGid}:`, e instanceof Error ? e.message : String(e));
        return false;
    }
}


// ----------------------------------------------------
// Main Runner (Backfill Orchestrator)
// ----------------------------------------------------
/**
 * Main function to orchestrate the backfill and metafield update process.
 */
async function run() {
    console.log("================================================");
    console.log("🔍 Starting Shopify Order Backfill & Metafield Process...");
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
    console.log(`⚡ Metafield Target: ${METAFIELD_NAMESPACE}.${METAFIELD_KEY}\n`);


    // --- 2. Query Orders Missing Shopify ID (The MOST IMPORTANT Check) ---
    try {
        const ordersToProcess = await prisma.order.findMany({
            where: {
                 // ONLY select records that need the ID
                orderNumber: { not: "" },
                pointsEarned: { 
                    gt: 0, 
                }
            },
        });

        console.log(`📌 Found ${ordersToProcess.length} orders MISSING Shopify IDs to backfill.`);

        // --- 3. Process Each Order ---
        let successfulDbUpdates = 0;
        let successfulMetafieldUpdates = 0;
        let recordsSkipped = 0;

        for (const order of ordersToProcess as DbOrder[]) { 
            const dbRecordId = order.id;
            const rawOrderNumber = order.orderNumber;
            const pointsValue = order.pointsEarned;

            console.log(`\n--- Processing DB Record ID: ${dbRecordId} (Order: ${rawOrderNumber} | Points: ${pointsValue}) ---`);

            // Input validation and points check
            if (!rawOrderNumber || typeof rawOrderNumber !== 'string' || rawOrderNumber.trim() === '' || 
                pointsValue === null || pointsValue <= 0 || !Number.isInteger(pointsValue)) {
                
                console.warn(`   - ⚠️ Skipping (Validation): OrderNumber or pointsEarned (${pointsValue}) is invalid for DB ID ${dbRecordId}.`);
                recordsSkipped++;
                continue;
            }
            
            const cleanOrderNumber = rawOrderNumber.trim();
            
            // A. Fetch Shopify Order ID
            const shopifyOrder = await fetchOrderFromShopify(
                shop,
                accessToken,
                cleanOrderNumber
            );

            if (!shopifyOrder) {
                console.log(`   - ⚠️ Lookup failed for ${cleanOrderNumber}. Skipping updates.`);
                continue;
            }
            
            if (!shopifyOrder.id) {
                console.error(`   - ❌ DISCOVERY FAILED: Shopify Order object is missing ID for ${cleanOrderNumber}.`);
                continue;
            }

            console.log(`   - 🟢 DISCOVERY SUCCESS: Found Shopify ID: **${shopifyOrder.id}**`);
            const shopifyGid = shopifyOrder.id;

            // B. Update Database Record with Shopify ID
            try {
                await prisma.order.update({
                    where: { id: dbRecordId },
                    // Since we filtered for shopifyOrderId: null, this is safe and necessary.
                    data: { shopifyOrderId: shopifyGid },
                });

                console.log(`   - 💾 SUCCESS: Updated DB ID ${dbRecordId} with Shopify ID.`);
                successfulDbUpdates++;
            } catch (updateError) {
                console.error(`   - ❌ DB Update Error for DB ID ${dbRecordId}:`, updateError instanceof Error ? updateError.message : String(updateError));
            }

            // C. Update Shopify Metafield using the pointsEarned value
            const metafieldSuccess = await updateOrderMetafield(
                shop,
                accessToken,
                shopifyGid,
                pointsValue
            );

            if (metafieldSuccess) {
                successfulMetafieldUpdates++;
            } else {
                console.warn(`   - ⚠️ Metafield update failed for ${shopifyGid}.`);
            }
            
            console.log(`-------------------------------------------------`);
        }

        console.log("\n================================================");
        console.log("🎯 Backfill Process Summary");
        console.log(`================================================`);
        console.log(`Total Orders Processed (Missing ID): ${ordersToProcess.length}`);
        console.log(`Successful DB Updates (Shopify ID): ${successfulDbUpdates}`);
        console.log(`Successful Metafield Updates: ${successfulMetafieldUpdates}`);
        console.log(`Records Skipped (Input/Points Errors): ${recordsSkipped}`);
        console.log(`Records Failed (API/DB Errors): ${ordersToProcess.length - successfulDbUpdates - recordsSkipped}`);

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