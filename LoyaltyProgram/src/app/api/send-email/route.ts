// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, text } = body;

    // Debug incoming payload
    console.log("📩 Incoming email request:", body);

    if (!to || !subject || !text) {
      console.error("❌ Missing required fields:", { to, subject, text });
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, or text" },
        { status: 400 }
      );
    }

    // Debug environment config
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // auto toggle secure
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
    console.log("🔧 SMTP Config:", {
      ...smtpConfig,
      auth: { user: smtpConfig.auth.user, pass: smtpConfig.auth.pass ? "***" : null }, // hide pass
    });

    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      throw new Error("SMTP environment variables are not properly set.");
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection before sending
    try {
      await transporter.verify();
      console.log("✅ SMTP server is ready to take messages.");
    } catch (verifyErr: any) {
      console.error("❌ SMTP verification failed:", verifyErr);
      throw new Error(`SMTP verification failed: ${verifyErr.message}`);
    }

    const mailOptions = {
      from: `"Loyalty Program" <dev@sites.codetors.dev>`,
      to,
      subject,
      text,
    };

    console.log("📤 Sending email with options:", mailOptions);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info);

    return NextResponse.json({ success: true, info });
  } catch (err: any) {
    console.error("💥 Email sending failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
