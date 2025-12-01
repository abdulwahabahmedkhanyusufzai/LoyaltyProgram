import { NextResponse } from "next/server";
import { UserService } from "../UserService";
import { prisma } from "../../../../lib/prisma";

const userService = new UserService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await userService.getUserByEmail(body.email);
    if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update Notifications & Language
    const updateData: any = {};
    if (body.language) updateData.language = body.language;
    
    console.log("Received body:", JSON.stringify(body, null, 2));

    // Handle separate notification fields
    if (body.notifications) {
        console.log("Processing notifications:", body.notifications);
        if (body.notifications.systemAlerts !== undefined) updateData.systemAlerts = body.notifications.systemAlerts;
        if (body.notifications.notifications !== undefined) updateData.allowNotifications = body.notifications.notifications; // Map 'notifications' toggle to 'allowNotifications'
        if (body.notifications.weeklyReports !== undefined) updateData.weeklyReports = body.notifications.weeklyReports;
    }

    console.log("Update data prepared for UserService:", updateData);

    await userService.updateUser(existingUser.id, updateData);
    
    const response = NextResponse.json({
      message: "Notifications updated successfully",
      user: {
          language: body.language,
          notifications: body.notifications
      }
    }, { status: 200 });

    if (body.language) {
        response.cookies.set({
            name: "userLanguage",
            value: body.language,
            httpOnly: false,
            path: "/",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    return response;

  } catch (error: unknown) {
    console.error("Error updating notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
