import { NextResponse } from "next/server";
import axios from "axios";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_V3_EVENTS_ENDPOINT = "https://a.klaviyo.com/api/events/";
const CUSTOM_METRIC_NAME = "Points Awarded";

// Helper to log timestamps
const log = (...args: any[]) => console.log(new Date().toISOString(), ...args);

export async function POST(req: Request) {
  log("📩 POST /api/klaviyo-event triggered");

  try {
    const body: { to?: string; points?: number } = await req.json();
    const { to, points } = body;

    log("🔹 Request body received:", body);

    if (!to || points === undefined) {
      log("❌ Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields: to or points" },
        { status: 400 }
      );
    }

    if (!KLAVIYO_API_KEY) {
      log("❌ KLAVIYO_API_KEY not set");
      return NextResponse.json(
        { success: false, error: "KLAVIYO_API_KEY environment variable is not set." },
        { status: 500 }
      );
    }

    const eventPayload = {
      data: {
        type: "event",
        attributes: {
          profile: {
            data: { type: "profile", attributes: { email: to } },
          },
          metric: {
            data: { type: "metric", attributes: { name: CUSTOM_METRIC_NAME } },
          },
          properties: { points_awarded: points, source: "Next.js Single API Sender" },
          time: new Date().toISOString(),
        },
      },
    };

    log("📝 Sending payload to Klaviyo:", JSON.stringify(eventPayload, null, 2));

    const response = await axios.post(KLAVIYO_V3_EVENTS_ENDPOINT, eventPayload, {
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        Revision: "2024-07-15",
      },
    });

    log("✅ Klaviyo response received:", response.data);

    return NextResponse.json({
      success: true,
      message: `Event '${CUSTOM_METRIC_NAME}' sent to Klaviyo.`,
      klaviyoResponse: response.data,
    });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      log("💥 Axios error:", {
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
    } else {
      log("💥 Unexpected error:", err);
    }

    return NextResponse.json(
      { success: false, error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
