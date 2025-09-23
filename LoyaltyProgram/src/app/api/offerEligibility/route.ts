// src/app/api/apply-offers/route.ts
import { NextResponse } from "next/server";
import { applyOffersToTestCustomers } from "../../utils/applyOffertoCustomer";

export async function POST() {
  try {
    const appliedCount = await applyOffersToTestCustomers();
    return NextResponse.json({ success: true, applied: appliedCount });
  } catch (err) {
    console.error("🔥 Error applying offers:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
