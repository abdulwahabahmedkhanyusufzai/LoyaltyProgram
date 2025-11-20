import { NextResponse } from "next/server";
import { UserService } from "../UserService";
import { UserValidator } from "../UserValidator";
import { prisma } from "../../../../lib/prisma";
import { Languages } from "lucide-react";

function jsonResponse(data: any, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

const userService = new UserService();

export async function POST(req: Request) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();

    // Extract file if uploaded
    const file = formData.get("profilePic") as File | null;
    let profilePicUrl: string | undefined;
   const shop = await prisma.shop.findFirst();
    if (!shop) {
      console.error("❌ [ERROR] No shop found in database");
      return jsonResponse({ error: "No shop found. Please add one first." }, 404);
    }

    console.log("🏪 [DEBUG] Found shop:", shop.shop);
    

        if (file) {
      console.log("🖼️ Uploading image to Shopify CDN...");
      
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("shop", shop.shop); // e.g., "testingashir.myshopify.com"
      uploadForm.append("accessToken", shop.accessToken); // stored in DB

      const uploadRes = await fetch(`${req.headers.get("origin")}/api/upload`, {
        method: "POST",
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.cdnUrl) {
        console.error("❌ Shopify upload failed:", uploadData);
        return jsonResponse(
          { error: "Failed to upload image to Shopify CDN", details: uploadData },
          500
        );
      }

      profilePicUrl = uploadData.cdnUrl;
      console.log("✅ Uploaded to Shopify CDN:", profilePicUrl);
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
        language : body.language || undefined,
      });
      message = "User updated successfully";
    } else {
      // Create user
      UserValidator.validateRegistration(body);
      user = await userService.createUser({
        language: body.language || undefined,
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

    // Set language cookie for i18n
    response.cookies.set({
      name: "userLanguage",
      value: body.language || user.language || "English",
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;

  } catch (error: unknown) {
    console.error("Error processing user:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
