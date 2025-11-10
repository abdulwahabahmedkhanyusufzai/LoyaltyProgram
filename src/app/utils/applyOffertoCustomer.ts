// pages/api/update-customer-tags.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as shopify from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerEmail, tier } = req.body;

  if (!customerEmail || !tier) {
    return res.status(400).json({ error: "Missing customerEmail or tier" });
  }

  try {
    // 1️⃣ Fetch the shop and token from DB
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in database");

    const { shop, accessToken } = shopRecord;

    // 2️⃣ Initialize Shopify client using fetch to the Admin GraphQL endpoint
    async function shopifyGraphQLRequest(shop :string, accessToken: string, query: string, variables?: any) {
      const response = await fetch(`https://${shop}/admin/api/2024-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Shopify GraphQL request failed: ${response.status} ${text}`);
      }

      return response.json();
    }

    // 3️⃣ Determine tags based on tier
    const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];
    const tagIndex = tierOrder.indexOf(tier);
    if (tagIndex === -1) throw new Error("Invalid tier");

    const tagsToApply = tierOrder.slice(0, tagIndex + 1); // e.g., Gold → ["Bronze","Silver","Gold"]
    const tagsString = tagsToApply.join(", ");

    // 4️⃣ Fetch the customer by email
    const query = `
      query getCustomer($email: String!) {
        customers(first: 1, query: $email) {
          edges {
            node {
              id
              tags
            }
          }
        }
      }
    `;
    const customerResponse = await shopifyGraphQLRequest(shop, accessToken, query, { email: customerEmail });

    const customerNode = customerResponse.data.customers.edges[0]?.node;
    if (!customerNode) {
      return res.status(404).json({ error: "Customer not found in Shopify" });
    }

    // 5️⃣ Update the customer tags
    const mutation = `
      mutation updateCustomerTags($id: ID!, $tags: [String!]!) {
        customerUpdate(input: { id: $id, tags: $tags }) {
          customer {
            id
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const updateResponse = await shopifyGraphQLRequest(shop, accessToken, mutation, { id: customerNode.id, tags: tagsToApply });

    const errors = updateResponse.data.customerUpdate.userErrors;
    if (errors.length) {
      return res.status(400).json({ error: errors });
    }

    return res.status(200).json({
      message: `Customer tags updated successfully`,
      tagsApplied: tagsToApply,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : err });
  }
}
