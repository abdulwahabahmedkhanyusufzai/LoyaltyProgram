import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateUsername(fullname: string) {
  const base = fullname.trim().toLowerCase().replace(/\s+/g, ""); // remove spaces
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${base}${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullname, email, phone, profilePicUrl, password, confirmPassword } = body;

    if (!fullname || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // 🔑 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 Generate username
    let username = generateUsername(fullname);

    // Ensure unique username
    let exists = await prisma.user.findUnique({ where: { username } });
    while (exists) {
      username = generateUsername(fullname);
      exists = await prisma.user.findUnique({ where: { username } });
    }

    // ✍️ Create user
    const newUser = await prisma.user.create({
      data: {
        fullName:fullname,
        email,
        phoneNumber:phone,
        username,
        profilePicUrl,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          fullname: newUser.fullname,
          email: newUser.email,
          phoneNumber: newUser.phone,
          username: newUser.username,
          profilePicUrl: newUser.profilePicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
