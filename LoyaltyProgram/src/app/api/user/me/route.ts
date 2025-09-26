import { NextResponse,NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UserService } from "../UserService";

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    // ✅ Use built-in cookie API
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ Non-blocking async verify
    const { payload } = await jwtVerify<{ userId: string }>(token, secret);

    // ✅ Fetch only required fields
    const user = await userService.getUserById(payload.userId);
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
