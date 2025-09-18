// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value; // 👈 your login cookie

  const isAuth = !!token;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  // If not logged in → redirect to /login
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If already logged in and visiting /login → redirect to homepage
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes (except static, API, etc.)
export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
