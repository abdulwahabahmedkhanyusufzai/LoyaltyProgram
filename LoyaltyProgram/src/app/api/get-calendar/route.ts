// app/api/get-calendar/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const month = url.searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { success: false, message: "Month query parameter is required" },
        { status: 400 }
      );
    }

    const entries = await prisma.adventCalendarEntry.findMany({
      where: { month },
      orderBy: { day: "asc" },
    });

    // Convert array to object with day as key for frontend
    const calendarData: Record<number, { event: string; type: string }> = {};
    entries.forEach((entry) => {
      calendarData[entry.day] = { event: entry.event, type: entry.type };
    });

    return NextResponse.json({ success: true, month, calendarData });
  } catch (err) {
    console.error("Error fetching calendar:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
