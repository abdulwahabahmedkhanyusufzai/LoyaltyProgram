import { NextResponse } from "next/server";
import axios from "axios";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_V3_EVENTS_ENDPOINT = "https://a.klaviyo.com/api/events/";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, properties, email } = body;

    if (!eventName || !email) {
      return NextResponse.json(
        { success: false, error: "Missing eventName or email" },
        { status: 400 }
      );
    }

    if (!KLAVIYO_API_KEY) {
      return NextResponse.json(
        { success: false, error: "KLAVIYO_API_KEY not set" },
        { status: 500 }
      );
    }

    const eventPayload = {
      data: {
        type: "event",
        attributes: {
          profile: {
            data: { type: "profile", attributes: { email } },
          },
          metric: {
            data: { type: "metric", attributes: { name: eventName } },
          },
          properties: { ...properties, source: "Next.js Tracker" },
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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Klaviyo Track Error:", err.response?.data || err.message);
    return NextResponse.json(
      { success: false, error: "Failed to track event" },
      { status: 500 }
    );
  }
}
