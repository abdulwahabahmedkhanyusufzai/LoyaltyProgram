// services/UserService.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class UserService {
  async generateUsername(fullname: string): Promise<string> {
    const base = fullname.trim().toLowerCase().replace(/\s+/g, "");
    let username: string;
    let exists;

    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      username = `${base}${randomNum}`;
      exists = await prisma.user.findUnique({ where: { username } });
    } while (exists);

    return username;
  }
 async getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// Update user
async updateUser(
  userId: string,
  data: { fullName?: string; phone?: string; password?: string; profilePicUrl?: string }
) {
  const updateData: any = { fullName: data.fullName, phoneNumber: data.phone };

  if (data.password) {
    updateData.password = await this.hashPassword(data.password);
  }
  if (data.profilePicUrl) {
    updateData.profilePicUrl = data.profilePicUrl;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}
async getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
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

    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        username,
        profilePicUrl: data.profilePicUrl,
        password: hashedPassword,
      },
    });
  }
  
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET! || "supersecret",
      { expiresIn: "7d" }
    );

    return { user, token };
  }
}
