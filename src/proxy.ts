import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`[Middleware] Incoming request for: ${pathname}`);

  // Skip public stuff
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$/)
  ) {
    console.log(`[Middleware] Skipping public or static path: ${pathname}`);
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken")?.value;
  console.log(`[Middleware] Checking for token for protected path: ${pathname}`);

  if (!token) {
    console.log(`[Middleware] No token found. Redirecting to /login.`);
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  try {
    console.log(`[Middleware] Token found. Verifying token...`);
    await jwtVerify(token, secret);
    console.log(`[Middleware] Token is valid. Allowing access to: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Token verification failed for ${pathname}:`, error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
