// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, text } = await req.json();

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,   // e.g. smtp.sendgrid.net
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER, // e.g. 'apikey' for SendGrid
        pass: process.env.SMTP_PASS, // your API key or password
      },
    });

    await transporter.sendMail({
      from: `"Loyalty Program" <dev@sites.codetors.dev>`,
      to,
      subject,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
