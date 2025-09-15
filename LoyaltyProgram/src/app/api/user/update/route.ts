import { NextResponse } from "next/server";
import { UserService } from "../UserService";
import { UserValidator } from "../UserValidator";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const userService = new UserService();

export async function POST(req: Request) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();

    // Extract file if uploaded
    const file = formData.get("profilePic") as File | null;
    let profilePicUrl: string | undefined;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const ext = file.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);
      profilePicUrl = `/uploads/${filename}`;
    }

    // Extract other fields
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== "profilePic" && typeof value === "string") {
        body[key] = value;
      }
    });

    let user;
    let message;

    const existingUser = await userService.getUserByEmail(body.email);

    if (existingUser) {
      // Update user
      UserValidator.validateUpdate(body);
      user = await userService.updateUser(existingUser.id, {
        fullName: body.fullName,
        phone: body.phone,
        password: body.password || undefined,
        profilePicUrl: profilePicUrl || existingUser.profilePicUrl,
      });
      message = "User updated successfully";
    } else {
      // Create user
      UserValidator.validateRegistration(body);
      user = await userService.createUser({
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        password: body.password,
        profilePicUrl,
      });
      message = "User created successfully";
    }

    // Generate JWT
    const token = await userService.login(user.username, body.password || "").then(r => r.token);

    // Set cookie
    const response = NextResponse.json({
      message,
      user: {
        id: user.id,
        fullname: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
      },
    }, { status: existingUser ? 200 : 201 });

    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: unknown) {
    console.error("Error processing user:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
