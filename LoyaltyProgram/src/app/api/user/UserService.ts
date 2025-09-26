// services/UserService.ts
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";

const prisma = new PrismaClient();

function debug(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[UserService DEBUG]", ...args);
  }
}

export class UserService {
  // 🔹 Generate unique username with batch query instead of looping
  async generateUsername(fullname: string): Promise<string> {
    debug("Generating username for:", fullname);

    const base = fullname.trim().toLowerCase().replace(/\s+/g, "");
    const candidates = Array.from({ length: 5 }, () =>
      `${base}${Math.floor(1000 + Math.random() * 9000)}`
    );

    debug("Generated candidates:", candidates);

    const existing = await prisma.user.findMany({
      where: { username: { in: candidates } },
      select: { username: true },
    });

    debug("Existing usernames in DB:", existing.map((u) => u.username));

    const existingSet = new Set(existing.map((u) => u.username));
    for (const candidate of candidates) {
      if (!existingSet.has(candidate)) {
        debug("Using available username:", candidate);
        return candidate;
      }
    }

    debug("All candidates taken, retrying...");
    return this.generateUsername(fullname);
  }

  async getUserByEmail(email: string) {
    debug("Fetching user by email:", email);
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });
  }

  async getUserById(id: string) {
    debug("Fetching user by ID:", id);
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });
  }

  // 🔹 Tuned Argon2 (balance between speed & security)
  async hashPassword(password: string): Promise<string> {
    debug("Hashing password (length only, not actual password):", password.length);
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 12,
      timeCost: 2,
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
    debug("Creating user:", { fullName: data.fullName, email: data.email, phone: data.phone });

    const username = await this.generateUsername(data.fullName);
    debug("Generated username:", username);

    const hashedPassword = await this.hashPassword(data.password);
    debug("Password hashed successfully");

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

    debug("User created:", user);
    return user;
  }

  async updateUser(
    userId: string,
    data: { fullName?: string; phone?: string; password?: string; profilePicUrl?: string }
  ) {
    debug("Updating user:", userId, "with data:", { ...data, password: data.password ? "[HIDDEN]" : undefined });

    const updateData: any = {
      fullName: data.fullName,
      phoneNumber: data.phone,
    };

    if (data.password) {
      updateData.password = await this.hashPassword(data.password);
      debug("Password re-hashed for update");
    }
    if (data.profilePicUrl) updateData.profilePicUrl = data.profilePicUrl;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, fullName: true, email: true, username: true, phoneNumber: true, profilePicUrl: true },
    });

    debug("User updated:", updated);
    return updated;
  }

  async login(username: string, password: string) {
    debug("Login attempt:", { username, passwordLength: password.length });

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

    if (!user) {
      debug("User not found:", username);
      throw new Error("Invalid username or password");
    }

    debug("User found in DB:", { id: user.id, email: user.email });

    const isValid = await argon2.verify(user.password, password);
    debug("Password verification result:", isValid);

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

    debug("JWT token generated successfully");

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  // 🔹 Verify JWT tokens
  async verifyToken(token: string) {
    debug("Verifying token:", token.slice(0, 15) + "...[truncated]");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

    try {
      const { payload } = await jwtVerify(token, secret);
      debug("JWT verified, payload:", payload);
      return payload;
    } catch (err) {
      debug("JWT verification failed:", err);
      throw err;
    }
  }
}
