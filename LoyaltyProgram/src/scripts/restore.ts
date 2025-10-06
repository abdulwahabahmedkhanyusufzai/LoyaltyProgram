import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Load backup file (make sure it exists)
    const data = JSON.parse(fs.readFileSync("./db-backup.json", "utf-8"));

    if (data.users && data.users.length) {
      for (const user of data.users) {
        // Insert user into DB
        await prisma.user.create({
          data: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: user.password,
            username: user.username,
            profilePicUrl: user.profilePicUrl,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            shopId: user.shopId || null,
          },
        });
      }
    }

    console.log("Users restored successfully!");
  } catch (err) {
    console.error("Error restoring users:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
