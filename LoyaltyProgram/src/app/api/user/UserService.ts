// services/UserService.ts
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";

const prisma = new PrismaClient();

export class UserService {
  // 🔹 Generate unique username with batch query instead of looping
  async generateUsername(fullname: string): Promise<string> {
    const base = fullname.trim().toLowerCase().replace(/\s+/g, "");
    const candidates = Array.from({ length: 5 }, () =>
      `${base}${Math.floor(1000 + Math.random() * 9000)}`
    );

    const existing = await prisma.user.findMany({
      where: { username: { in: candidates } },
      select: { username: true },
    });

    const existingSet = new Set(existing.map((u) => u.username));
    for (const candidate of candidates) {
      if (!existingSet.has(candidate)) return candidate;
    }

    // fallback: try again
    return this.generateUsername(fullname);
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });
  }

  // 🔹 Tuned Argon2 (balance between speed & security)
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 12, // 4096 KiB
      timeCost: 2,         // iterations
      parallelism: 1,
    });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    phone: string;
    profilePicUrl?: string;
    password: string;
  }) {
    const username = await this.generateUsername(data.fullName);
    const hashedPassword = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        username,
        profilePicUrl: data.profilePicUrl,
        password: hashedPassword,
      },
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });

    return user;
  }

  async updateUser(
    userId: string,
    data: { fullName?: string; phone?: string; password?: string; profilePicUrl?: string }
  ) {
    const updateData: any = {
      fullName: data.fullName,
      phoneNumber: data.phone,
    };

    if (data.password) updateData.password = await this.hashPassword(data.password);
    if (data.profilePicUrl) updateData.profilePicUrl = data.profilePicUrl;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });
  }

  async login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      phoneNumber: true,
      profilePicUrl: true,
      password: true,
    },
  });

  if (!user) throw new Error("Invalid username or password");

  const isValid = await argon2.verify(user.password, password);
  if (!isValid) throw new Error("Invalid username or password");

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

  // 🔹 Put full user info inside JWT
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePicUrl: user.profilePicUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // Strip password
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
}

  // 🔹 Verify JWT tokens
  async verifyToken(token: string) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");
    const { payload } = await jwtVerify(token, secret);
    return payload; // { userId, username, iat, exp }
  }
}
