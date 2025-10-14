// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Clear the authToken cookie by setting it expired
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    response.cookies.set({
      name: "authToken",
      value: "",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // expire immediately
    });

    return response;
  } catch (err: any) {
    console.error("Error logging out:", err);
    return NextResponse.json({ error: err.message || "Failed to logout" }, { status: 500 });
  }
}
