// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { UserService } from "../UserService";
import { UserValidator } from "../UserValidator";

const userService = new UserService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    UserValidator.validateLogin(body);

    const { user, token } = await userService.login(body.username, body.password);

    // Create a response object
    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullname: user.fullName,
        phoneNumber: user.phoneNumber,
        username: user.username,
        email: user.email,
        profilePicUrl: user.profilePicUrl,
      },
    });

    // Set JWT as HTTP-only cookie
    res.cookies.set("authToken", token, {
      httpOnly: true,       // Not accessible via JS
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      path: "/",            // available on all routes
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",      // protects against CSRF
    });

    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 400 });
  }
}
