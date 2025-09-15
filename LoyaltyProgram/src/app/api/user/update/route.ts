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
      profilePicUrl = `/uploads/${filename}`; // Public URL
    }

    // Extract other fields
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== "profilePic" && typeof value === "string") {
        body[key] = value;
      }
    });

    // Validate fields
    UserValidator.validateRegistration(body);

    // Create user with image URL
    const newUser = await userService.createUser({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      profilePicUrl,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          fullname: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          username: newUser.username,
          profilePicUrl: newUser.profilePicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
