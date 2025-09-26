import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UserService } from "../UserService";

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const secret = new TextEncoder().encode(JWT_SECRET);

// Only allow verbose debug in non-production
const isDev = process.env.NODE_ENV !== "production";

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

    // Use built-in cookie API
    const cookieEntry = req.cookies.get("authToken");
    const token = cookieEntry?.value;
    debugLog("Cookie present:", !!cookieEntry, "cookieName:", cookieEntry?.name);
    debugLog("Token (truncated):", truncateSafe(token, 20));

    if (!token) {
      const resp = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      if (debugRequested) {
        (resp as any).debug = { reason: "no_token", tookMs: Date.now() - start };
      }
      return resp;
    }

    // Verify JWT (non-blocking)
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

    // If the token already contains profile fields, use them (avoid DB)
    let user: any = null;
    let usedTokenData = false;
    if (payload && (payload.fullName || payload.email || payload.username)) {
      debugLog("Using user data from token (no DB hit).");
      user = {
        id: payload.userId,
        fullName: payload.fullName ?? null,
        username: payload.username ?? null,
        email: payload.email ?? null,
        phoneNumber: payload.phoneNumber ?? null,
        profilePicUrl: payload.profilePicUrl ?? null,
        fromToken: true,
      };
      usedTokenData = true;
    } else {
      // Fallback: query DB
      debugLog("No profile fields in token — fetching from DB for userId:", payload.userId);
      user = await userService.getUserById(payload.userId);
      if (user) user.fromToken = false;
    }

    if (!user) {
      debugLog("User not found for id:", payload.userId);
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

    // Build safe response shape
    const responseBody = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicUrl: user.profilePicUrl,
    };

    const resp = NextResponse.json(responseBody);

    if (debugRequested) {
      // Add debug metadata in non-production when explicitly requested
      const debugInfo = {
        usedTokenData,
        tokenPreview: truncateSafe(token, 20),
        payloadKeys: Object.keys(payload || {}),
        tookMs: Date.now() - start,
      };
      // Attach debug info under a `debug` header (or include in body)
      // NOTE: Avoid sending secret or full token
      resp.headers.set("x-debug-info", JSON.stringify(debugInfo));
      // also return debug object inside JSON body for convenience in dev
      const bodyWithDebug = { ...responseBody, debug: debugInfo };
      return NextResponse.json(bodyWithDebug);
    }

    debugLog("Returning user (fast) — took ms:", Date.now() - start);
    return resp;
  } catch (err: any) {
    debugLog("Unhandled error:", err);
    console.error("Error in /api/user/me:", err);
    const resp = NextResponse.json({ error: err.message || "Failed to fetch user" }, { status: 500 });
    if (debugRequested) {
      (resp as any).debug = { unhandledError: err.message, tookMs: Date.now() - start };
    }
    return resp;
  }
}
