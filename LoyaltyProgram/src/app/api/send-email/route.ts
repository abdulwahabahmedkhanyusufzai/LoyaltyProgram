import { NextResponse } from "next/server";
import axios from "axios";

// --- Configuration Constants ---
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_V3_EVENTS_ENDPOINT = "https://a.klaviyo.com/api/events/";
const CUSTOM_METRIC_NAME = "Points Awarded";

// --- Next.js API Route Handler ---

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, points } = body;

        console.log("📩 Incoming event request:", body);

        if (!to || points === undefined) {
            console.error("❌ Missing required fields:", { to, points });
            return NextResponse.json(
                { success: false, error: "Missing required fields: to or points" },
                { status: 400 }
            );
        }

        if (!KLAVIYO_API_KEY) {
            throw new Error("KLAVIYO_API_KEY environment variable is not set.");
        }

        // --- Klaviyo V3 Event Payload Structure ---
        const eventPayload = {
            data: {
                type: "event",
                attributes: {
                    profile: {
                        data: {
                            type: "profile",
                            attributes: {
                                email: to
                            }
                        }
                    },
                    metric: {
                        data: {
                            type: "metric",
                            attributes: {
                                name: CUSTOM_METRIC_NAME
                            }
                        }
                    },
                    properties: {
                        points_awarded: points,
                        source: "Next.js Single API Sender"
                    },
                    time: new Date().toISOString()
                }
            }
        };

        const response = await axios.post(
            KLAVIYO_V3_EVENTS_ENDPOINT,
            eventPayload,
            {
                headers: {
                    "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                    "Content-Type": "application/json",
                    "Revision": "2024-07-15",
                },
            }
        );

        console.log("✅ Event sent successfully to Klaviyo:", response.data);

        return NextResponse.json({ success: true, message: `Event '${CUSTOM_METRIC_NAME}' successfully sent to Klaviyo.` });
    } catch (err: any) {
        console.error("💥 Klaviyo event sending failed:", err.response?.data || err.message);
        if (err.response?.data?.errors) {
            console.error("Detailed Klaviyo Errors:", JSON.stringify(err.response.data.errors, null, 2));
        }
        return NextResponse.json(
            { success: false, error: err.message || "Unexpected server error" },
            { status: 500 }
        );
    }
}
