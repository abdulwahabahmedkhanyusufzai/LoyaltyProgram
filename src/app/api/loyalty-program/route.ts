import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// ✅ Default data
const defaultConversion = { euro: 10, point: 1 };

const defaultTiers = [
  { label: "Welcomed: Less than 20 points", color: "#734A00" },
  { label: "Guest: Between 20 and 30 points", color: "#B47A11" },
  { label: "Host: Between 31 and 4500 points", color: "#402A00" },
  { label: "Test: More than 4500 points", color: "#384551" },
];

const defaultRows = [
  {
    label: "Cashback per point",
    values: ["10 points = €10", "10 points = €10", "10 points = €13", "-"],
  },
  {
    label: "Free Delivery",
    values: [
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "-",
    ],
  },
  {
    label: "Immediate Discount",
    values: [
      "5% on the first order",
      "10% cumulative",
      "15% + priority access",
      "-",
    ],
  },
  {
    label: "Product Suggestions",
    values: [
      "Offer suggestion if purchasing from category X",
      "Offer suggestion if purchasing from one or more categories",
      "Offer of your choice if purchasing from one or more categories",
      "-",
    ],
  },
  {
    label: "Loyalty Offer",
    values: ["No", "5% on the 3rd order", "5% on the 3rd order", "-"],
  },
  {
    label: "Birthday Offer",
    values: [
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "-",
    ],
  },
];

// ✅ GET: return existing program (or create default if none)
export async function GET(req: NextRequest) {
  try {
    let program = await prisma.loyaltyProgram.findFirst();

    if (!program) {
      program = await prisma.loyaltyProgram.create({
        data: {
          tiers: defaultTiers,
          rows: defaultRows,
          conversion: defaultConversion,
        },
      });
    }

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error("GET /api/loyalty-program error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

// ✅ PUT: update program (tiers, rows, conversion)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tiers, rows, conversion } = body;

    const existing = await prisma.loyaltyProgram.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Program not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.loyaltyProgram.update({
      where: { id: existing.id },
      data: {
        tiers: tiers || existing.tiers,
        rows: rows || existing.rows,
        conversion: conversion || existing.conversion,
      },
    });

    return NextResponse.json({ success: true, program: updated });
  } catch (error) {
    console.error("PUT /api/loyalty-program error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update program" },
      { status: 500 }
    );
  }
}
