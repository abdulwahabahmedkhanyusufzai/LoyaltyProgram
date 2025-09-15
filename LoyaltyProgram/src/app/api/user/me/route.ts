import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserService } from "../UserService";

const userService = new UserService();

export async function GET(req: Request) {
  try {
    // --- MANUAL COOKIE PARSING ---
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...val] = c.split("=");
        return [key.trim(), val.join("=")];
      })
    );

    const token = cookies["authToken"];
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT secret not set" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      fullname: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicUrl: user.profilePicUrl,
    });
  } catch (err: any) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch user" }, { status: 401 });
  }
}
