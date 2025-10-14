import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";


export async function POST(req: Request) {
  try {
    const { month, calendarData }: { month: string; calendarData: Record<number, { event: string; type: string }> } =
      await req.json();

    // Delete existing entries for this month to replace them
    await prisma.adventCalendarEntry.deleteMany({
      where: { month },
    });

    // Create new entries
    const entries = Object.entries(calendarData).map(([day, info]) => ({
      month,
      day: parseInt(day),
      event: info.event,
      type: info.type,
    }));

    await prisma.adventCalendarEntry.createMany({
      data: entries,
    });

    return NextResponse.json({ success: true, message: "Calendar saved successfully!" });
  } catch (err) {
    console.error("Error saving calendar:", err);
    return NextResponse.json({ success: false, message: "Failed to save calendar" }, { status: 500 });
  }
}
