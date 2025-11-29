import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Allowed Shopify & app origins
const allowedOrigins = [
  "https://storeplaidcocooningplaidfrenchfrancefrank.myshopify.com",
  "https://admin.shopify.com",
  "https://waro.d.codetors.dev",
];

/**
 * Add CORS headers dynamically based on request origin.
 */
function applyCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  const allowedOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[2];

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`[Middleware] Incoming request for: ${pathname}`);

  // ✅ Handle CORS for API requests first
  if (pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      // Preflight CORS request
      const res = new NextResponse(null, { status: 204 });
      return applyCors(req, res);
    }

    // Apply CORS to all normal API requests
    const res = NextResponse.next();
    return applyCors(req, res);
  }

  // ✅ Skip authentication for public/static routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$/)
  ) {
    console.log(`[Middleware] Skipping public/static path: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ Authentication for protected routes
  const token = req.cookies.get("authToken")?.value;
  console.log(`[Middleware] Checking token for: ${pathname}`);

  if (!token) {
    console.log(`[Middleware] No token found, redirecting to /login.`);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    console.log(`[Middleware] Token found, verifying...`);
    await jwtVerify(token, secret);
    console.log(`[Middleware] Token valid, access granted to: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Token verification failed:`, error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

