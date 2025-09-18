import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // 👈 set in .env for production

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes & assets
  const PUBLIC_PATHS = ["/login", "/register", "/_next", "/api", "/favicon.ico"];
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$/);

  if (isPublicPath || isStaticAsset) {
    return NextResponse.next();
  }

  // Get auth cookie
  const token = req.cookies.get("authToken")?.value;

  // If no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Optionally: check expiry manually (jwt.verify does this by default)
    if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
      throw new Error("Token expired");
    }

    // All good → allow
    return NextResponse.next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    // Redirect to login if invalid
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Apply to all routes except excluded ones
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
