import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import Holidays from "date-holidays";

const prisma = new PrismaClient();
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_V3_EVENTS_ENDPOINT = "https://a.klaviyo.com/api/events/";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"; // Fallback if not set

// Helper to format currency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// Helper to generate HTML
const generateWeeklyDigestHtml = (stats: any) => {
  const { totalCustomers, totalPoints, newCustomersCount, upcomingEvents, newVips } = stats;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEFCE8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #734A00; color: #ffffff; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .section { padding: 24px; border-bottom: 1px solid #f0f0f0; }
        .section-title { color: #734A00; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-left: 4px solid #734A00; padding-left: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .card { background-color: #FDFDF9; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #E5E5E5; }
        .card-value { font-size: 24px; font-weight: 700; color: #2C2A25; }
        .card-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .list-item { padding: 12px 0; border-bottom: 1px dashed #eee; display: flex; justify-content: space-between; align-items: center; }
        .list-item:last-child { border-bottom: none; }
        .badge { background-color: #FEFCE8; color: #734A00; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .footer { background-color: #F9FAFB; padding: 24px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Weekly Loyalty Digest</h1>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Dashboard Overview -->
        <div class="section">
          <div class="section-title">Dashboard Overview</div>
          <div class="grid">
            <div class="card">
              <div class="card-value">${totalCustomers.toLocaleString()}</div>
              <div class="card-label">Total Customers</div>
            </div>
            <div class="card">
              <div class="card-value">${totalPoints.toLocaleString()}</div>
              <div class="card-label">Points Issued</div>
            </div>
            <div class="card">
              <div class="card-value">+${newCustomersCount}</div>
              <div class="card-label">New This Week</div>
            </div>
          </div>
        </div>

        <!-- Upcoming Events (Calendar) -->
        <div class="section">
          <div class="section-title">Upcoming Events (Next 7 Days)</div>
          ${upcomingEvents.length > 0 ? `
            <div>
              ${upcomingEvents.map((e: any) => `
                <div class="list-item">
                  <span style="font-weight:500; color:#333;">${e.name}</span>
                  <span class="badge">${e.date}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:#999; font-style:italic;">No upcoming events.</p>'}
        </div>

        <!-- New VIPs (Customers) -->
        <div class="section">
          <div class="section-title">New VIPs</div>
          ${newVips.length > 0 ? `
            <div>
              ${newVips.map((c: any) => `
                <div class="list-item">
                  <div>
                    <div style="font-weight:600; color:#333;">${c.firstName} ${c.lastName}</div>
                    <div style="font-size:12px; color:#888;">${c.email}</div>
                  </div>
                  <span class="badge" style="background:#734A00; color:white;">${c.loyaltyTitle || 'VIP'}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:#999; font-style:italic;">No new VIPs this week.</p>'}
        </div>

        <div class="footer">
          <p>Sent automatically by Waro Loyalty Program</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function GET(req: Request) {
  try {
    // 1. Fetch Dashboard Stats
    const totalCustomers = await prisma.customer.count();
    const totalPointsAgg = await prisma.customer.aggregate({
      _sum: { amountSpent: true }, // Using amountSpent as proxy for points if points field missing, or adjust logic
    });
    // Note: If 'loyaltyPoints' exists on Customer, use that. Schema showed 'amountSpent'. 
    // Assuming points logic is elsewhere or derived. Using amountSpent for now as placeholder.
    const totalPoints = totalPointsAgg._sum.amountSpent ? Number(totalPointsAgg._sum.amountSpent) : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newCustomersCount = await prisma.customer.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // 2. Fetch Calendar Events (Holidays + DB Events)
    const hd = new Holidays('US');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Get holidays
    const holidays = hd.getHolidays(today.getFullYear());
    const upcomingHolidays = holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate >= today && hDate <= nextWeek;
    }).map(h => ({ name: h.name, date: new Date(h.date).toLocaleDateString() }));

    // Get DB events (AdventCalendarEntry) - Assuming schema has this
    // const dbEvents = await prisma.adventCalendarEntry.findMany(...) // Add if needed

    const upcomingEvents = [...upcomingHolidays]; // Merge with DB events if implemented

    // 3. Fetch New VIPs (e.g., Gold/Platinum created recently)
    // Assuming VIP is based on title or points. For now, just showing recent signups with a title.
    const newVips = await prisma.customer.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        loyaltyTitle: { not: "" } // Assuming VIPs have a title
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 4. Generate HTML
    const stats = { totalCustomers, totalPoints, newCustomersCount, upcomingEvents, newVips };
    const htmlContent = generateWeeklyDigestHtml(stats);

    // 5. Send to Klaviyo
    if (!KLAVIYO_API_KEY) throw new Error("KLAVIYO_API_KEY not set");

    const eventPayload = {
      data: {
        type: "event",
        attributes: {
          profile: {
            data: { type: "profile", attributes: { email: ADMIN_EMAIL } },
          },
          metric: {
            data: { type: "metric", attributes: { name: "Weekly Report" } },
          },
          properties: {
            html_content: htmlContent,
            ...stats
          },
          time: new Date().toISOString(),
        },
      },
    };

    await axios.post(KLAVIYO_V3_EVENTS_ENDPOINT, eventPayload, {
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        Revision: "2024-07-15",
      },
    });

    return NextResponse.json({ success: true, message: "Weekly digest sent" });

  } catch (err: any) {
    console.error("Weekly Digest Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
