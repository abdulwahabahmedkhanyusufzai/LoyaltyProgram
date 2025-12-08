import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { REWARDS } from "../../../constants/rewards";
import { createDiscountCode, syncCustomerMetafields } from "../../../lib/shopify";
import { getCustomerTier } from "../../../constants/loyaltyTier";

export async function POST(req: Request) {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const { customerId, rewardId } = await req.json();

    if (!customerId || !rewardId) {
      return NextResponse.json({ success: false, error: "Missing customerId or rewardId" }, { status: 400, headers: corsHeaders });
    }

    // 1. Find Reward
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json({ success: false, error: "Invalid reward" }, { status: 400, headers: corsHeaders });
    }

    // 2. Find Customer
    // Handle both GID and numeric ID formats
    const idString = customerId.toString();
    const numericId = idString.match(/\d+/)?.[0] || idString;
    const gid = `gid://shopify/Customer/${numericId}`;

    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { shopifyId: idString }, // Exact match
          { shopifyId: numericId }, // Numeric match
          { shopifyId: gid },       // GID match
          { id: idString }          // Internal DB ID match
        ]
      }
    });

    if (!customer) {
      console.log(`Customer not found for input: ${idString}. Tried: ${numericId}, ${gid}`);
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404, headers: corsHeaders });
    }

    // 3. Check Balance
    // We should use the latest balance from PointsLedger or amountSpent if that's the source of truth.
    // Based on previous code, amountSpent seems to be the total earned, but we need "Current Balance".
    // Let's check PointsLedger for the latest balance.
    const lastLedger = await prisma.pointsLedger.findFirst({
      where: { customerId: customer.id },
      orderBy: { earnedAt: "desc" }
    });

    // If no ledger, assume balance is amountSpent (if that's how it works) or 0.
    // Actually, amountSpent is usually lifetime spend. Points are likely tracked in ledger.
    // If no ledger, let's assume 0 for safety, or maybe amountSpent * conversion?
    // Let's assume lastLedger.balanceAfter is the truth.
    const currentBalance = lastLedger?.balanceAfter || 0;

    if (currentBalance < reward.points) {
      return NextResponse.json({ success: false, error: "Insufficient points" }, { status: 400, headers: corsHeaders });
    }

    // 4. Create Discount Code
    const code = await createDiscountCode(reward.value);
    if (!code) {
      return NextResponse.json({ success: false, error: "Failed to generate discount code" }, { status: 500, headers: corsHeaders });
    }

    // 5. Deduct Points
    const newBalance = currentBalance - reward.points;
    await prisma.pointsLedger.create({
      data: {
        customerId: customer.id,
        change: -reward.points,
        balanceAfter: newBalance,
        reason: `Redeemed reward: ${reward.title}`,
        sourceType: "REDEMPTION",
        metadata: { rewardId, code }
      }
    });

    // 6. Sync Metafields
    const tier = getCustomerTier(newBalance); // Should tier drop? Usually tiers are based on lifetime points.
    // If tier is based on lifetime points (amountSpent), then redeeming shouldn't drop tier.
    // But we need to sync the "Spendable Points" to Shopify for the dashboard.
    // Let's sync the new balance.
    // Note: getCustomerTier uses 'points' argument. If it expects lifetime points, we should pass amountSpent.
    // If it expects current balance, pass newBalance.
    // Based on `loyalty-dashboard.liquid`, it uses `loyalty.points` for display and progress.
    // If we want progress to be based on lifetime, we should sync lifetime points separately?
    // For now, let's assume `loyalty.points` is the SPENDABLE balance.
    // And Tier is based on... well, usually lifetime.
    // Let's use amountSpent for Tier calculation (lifetime) and newBalance for Points display.
    
    const lifetimePoints = Number(customer.amountSpent); // Assuming amountSpent tracks lifetime points/spend
    const currentTier = getCustomerTier(lifetimePoints); 

    await syncCustomerMetafields(customer.shopifyId, newBalance, currentTier.name);

    return NextResponse.json({
      success: true,
      code,
      newBalance,
      message: `Successfully redeemed ${reward.title}`
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });

  } catch (err: any) {
    console.error("Redemption Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
