import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, points } = body;

    console.log("📩 Incoming email request:", body);

    if (!to || !subject || points === undefined) {
      console.error("❌ Missing required fields:", { to, subject, points });
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, or points" },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background:#fffef9; padding:16px; border-radius:16px; border:1px solid #ddd;">
        <div style="background:#734A00; color:white; text-align:center; border-radius:9999px; padding:8px; margin-bottom:16px;">
          Free shipping for over $50 and a full one-year return policy.
        </div>
        <div style="background:#734A00; color:white; text-align:center; padding:24px; border-radius:8px;">
          <div style="margin:0 auto">
            <div>  
              <img src="https://loyalty-program-9jqr.vercel.app/waro2.png" alt="Logo Icon" style="height:39px;width:52px;" />
              <img src="https://loyalty-program-9jqr.vercel.app/waro.png" alt="Logo Text" style="height:19px;" />
            </div>
          </div>
          <p style="font-size:18px; font-weight:600; margin:0;">
            THE WAROO <br/>
            <span style="font-size:32px; font-weight:800; color:#F1DAB0CC; display:block; margin-top:8px;">
              YOU HAVE WON ${points} POINTS
            </span>
          </p>
        </div>
      </div>
    `;

    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      throw new Error("SMTP environment variables are not properly set.");
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    await transporter.verify();
    console.log("✅ SMTP server is ready to take messages.");

    const mailOptions = {
      from: `"Loyalty Program" <dev@sites.codetors.dev>`,
      to,
      subject,
      html,
    };

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
