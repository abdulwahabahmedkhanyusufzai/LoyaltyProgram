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

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullname: user.fullName,
          phoneNumber:user.phoneNumber,
          username: user.username,
          email: user.email,
          profilePicUrl: user.profilePicUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
