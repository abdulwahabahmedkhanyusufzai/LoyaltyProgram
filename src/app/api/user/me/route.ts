import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UserService } from "../UserService";

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const secret = new TextEncoder().encode(JWT_SECRET);

// Only allow verbose debug in non-production
const isDev = process.env.NODE_ENV !== "production";

export const dynamic = 'force-dynamic'; // Force dynamic rendering

function debugLog(...args: any[]) {
  if (isDev) console.debug("[/api/user/me DEBUG]", ...args);
}

function truncateSafe(s?: string, len = 12) {
  if (!s) return null;
  return s.length > len ? `${s.slice(0, len)}…` : s;
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const debugRequested =
    isDev &&
    (req.nextUrl.searchParams.get("debug") === "1" ||
      req.headers.get("x-debug") === "1");

  try {
    debugLog("Incoming request url:", req.url);
    debugLog("All request headers:", Object.fromEntries(req.headers.entries()));
    debugLog("Raw cookie header:", req.headers.get("cookie"));

    // Get token from cookie
    const cookieEntry = req.cookies.get("authToken");
    const token = cookieEntry?.value;
    debugLog("Cookie present:", !!cookieEntry, "cookieName:", cookieEntry?.name);
    debugLog("Token (truncated):", truncateSafe(token, 20));

    if (!token) {
      const resp = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      if (debugRequested) (resp as any).debug = { reason: "no_token", tookMs: Date.now() - start };
      return resp;
    }

    // Verify JWT
    let payload: Record<string, any>;
    try {
      debugLog("Verifying token...");
      const verified = await jwtVerify(token, secret);
      payload = verified.payload as Record<string, any>;
      debugLog("Token verified. payload keys:", Object.keys(payload || {}));
    } catch (verifyErr) {
      debugLog("Token verify failed:", verifyErr);
      const resp = NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      if (debugRequested) {
        (resp as any).debug = {
          reason: "token_verify_failed",
          tokenPreview: truncateSafe(token, 20),
          verifyError: verifyErr?.message,
          tookMs: Date.now() - start,
        };
      }
      return resp;
    }

    // ✅ Always fetch user from DB to get the latest info (including language)
    const user = await userService.getUserById(payload.userId);
    if (!user) {
      const resp = NextResponse.json({ error: "User not found" }, { status: 404 });
      if (debugRequested) {
        (resp as any).debug = {
          reason: "user_not_found",
          userId: payload.userId,
          tokenPreview: truncateSafe(token, 20),
          tookMs: Date.now() - start,
        };
      }
      return resp;
    }

    // Build safe response
    const responseBody = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicUrl: user.profilePicUrl,
      language: user.language || "English", // latest language from DB
    };

    const resp = NextResponse.json(responseBody);
    
    // Set language cookie for i18n
    resp.cookies.set({
      name: "userLanguage",
      value: user.language || "English",
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    if (debugRequested) {
      const debugInfo = {
        userId: user.id,
        tokenPreview: truncateSafe(token, 20),
        payloadKeys: Object.keys(payload || {}),
        tookMs: Date.now() - start,
        fromToken: false,
      };
      resp.headers.set("x-debug-info", JSON.stringify(debugInfo));
      const bodyWithDebug = { ...responseBody, debug: debugInfo };
      return NextResponse.json(bodyWithDebug);
    }

    return resp;
  } catch (err: any) {
    console.error("Unhandled error in /api/user/me:", err);
    const resp = NextResponse.json({ error: err.message || "Failed to fetch user" }, { status: 500 });
    if (debugRequested) (resp as any).debug = { unhandledError: err.message, tookMs: Date.now() - start };
    return resp;
  }
}
