import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const month = "Dec"; // Matching LoyalCalendar.tsx monthNames
    
    // Check if data exists
    const count = await prisma.adventCalendarEntry.count({
      where: { month },
    });

    if (count > 0) {
      return NextResponse.json({ success: true, message: `Data already exists for ${month}`, count });
    }

    // Seed data
    const events = [
      { day: 5, event: "Double Points", type: "bonus" },
      { day: 12, event: "Free Shipping", type: "offer" },
      { day: 25, event: "Christmas Gift", type: "gift" },
      { day: new Date().getDate(), event: "Today's Special", type: "special" }, // Ensure today has an event for testing
    ];

    await prisma.adventCalendarEntry.createMany({
      data: events.map(e => ({
        month,
        day: e.day,
        event: e.event,
        type: e.type
      })),
    });

    return NextResponse.json({ success: true, message: `Seeded ${events.length} events for ${month}` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
