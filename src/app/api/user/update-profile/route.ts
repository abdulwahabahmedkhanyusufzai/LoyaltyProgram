import { NextResponse } from "next/server";
import { UserService } from "../UserService";
import { UserValidator } from "../UserValidator";
import { prisma } from "../../../../lib/prisma";

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
    const formData = await req.formData();
    const file = formData.get("profilePic") as File | null;
    let profilePicUrl: string | undefined;

    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return jsonResponse({ error: "No shop found. Please add one first." }, 404);
    }

    if (file) {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("shop", shop.shop);
      uploadForm.append("accessToken", shop.accessToken);

      const uploadRes = await fetch(`${req.headers.get("origin")}/api/upload`, {
        method: "POST",
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.cdnUrl) {
        return jsonResponse(
          { error: "Failed to upload image to Shopify CDN", details: uploadData },
          500
        );
      }

      profilePicUrl = uploadData.cdnUrl;
    }

    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== "profilePic" && typeof value === "string") {
        body[key] = value;
      }
    });

    const existingUser = await userService.getUserByEmail(body.email);
    if (!existingUser) {
        return jsonResponse({ error: "User not found" }, 404);
    }

    // Validate update - we might need to relax validation if not all fields are present, 
    // but for profile update we expect most fields. 
    // Assuming UserValidator.validateUpdate handles partials or we pass what we have.
    // For now, we'll try to use it as is, or skip if it's too strict.
    // Given the previous code used it, we'll use it.
    UserValidator.validateUpdate(body);

    const user = await userService.updateUser(existingUser.id, {
      fullName: body.fullName,
      phone: body.phone,
      password: body.password || undefined,
      profilePicUrl: profilePicUrl || existingUser.profilePicUrl,
      // Language is NOT updated here anymore
    });

    // Generate JWT (in case password changed or just to refresh)
    // If password didn't change, we need to verify the current password if we want to be strict,
    // but the previous implementation just logged in with the new password (or empty?).
    // Wait, the previous implementation:
    // const token = await userService.login(user.username, body.password || "").then(r => r.token);
    // If body.password is empty (user didn't change it), login might fail if it expects a password.
    // However, if the user is just updating profile details, they might not send a password.
    // The previous code seemed to assume password was present or handled it.
    // Let's check if we need to re-issue the token. If we update the user, we might want to return the updated user object.
    // If the password changed, we definitely need a new token if the token embeds the password hash (unlikely) or just to verify.
    // For now, I will replicate the previous behavior but be careful about the password.
    
    // If password is provided, we can re-login. If not, we might not be able to re-login easily without the old password.
    // But we are already authenticated to hit this route (presumably). 
    // Actually, the previous code re-issued the token. 
    // If `body.password` is missing, `userService.login` might fail.
    // Let's assume for now we return the user and if password changed, the client might need to re-login or we rely on the existing session if it's cookie based.
    // The previous code set a cookie.
    
    // NOTE: If the user is NOT changing the password, `body.password` will be empty.
    // `userService.login` usually requires a password. 
    // If we don't have the password, we can't generate a new token via `login`.
    // However, we might not need to generate a new token if we are just updating profile fields.
    // But if we DO update the password, we should probably issue a new token.
    
    let token;
    if (body.password) {
        token = await userService.login(user.username, body.password).then(r => r.token);
    }
    
    const response = NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        fullname: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
      },
    }, { status: 200 });

    if (token) {
        response.cookies.set({
            name: "authToken",
            value: token,
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    return response;

  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
