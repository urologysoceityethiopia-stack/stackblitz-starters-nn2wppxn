/**
 * Email service — supports SMTP (Nodemailer) and Resend.
 * Falls back to console logging in development.
 */

import nodemailer from "nodemailer";

interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  if (!host || !user || !password) return null;
  return { host, port, user, password };
}

let cachedTransporter: any = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const smtp = getSmtpConfig();
  if (!smtp) return null;
  cachedTransporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.password },
  });
  return cachedTransporter;
}

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean; id?: string }> {
  const from = process.env.EMAIL_FROM ?? "no-reply@nutrimed.et";

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, id: data.id };
    }
  }

  // 2. Try SMTP
  const transporter = getTransporter();
  if (transporter) {
    const info = await transporter.sendMail({
      from,
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
    return { ok: true, id: info.messageId };
  }

  // 3. Dev fallback
  if (process.env.NODE_ENV !== "production") {
    console.log("\n📧 [DEV EMAIL]");
    console.log("To:", input.to);
    console.log("Subject:", input.subject);
    console.log("---");
    console.log(input.text ?? input.html);
    console.log("---\n");
    return { ok: true, id: "dev" };
  }

  throw new Error("No email provider configured");
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>NutriMed Ethiopia</title></head>
  <body style="margin:0;padding:0;background:#f5f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;">
      <div style="text-align:center;padding-bottom:24px;border-bottom:2px solid #28a195;">
        <h1 style="margin:0;color:#28a195;font-size:24px;">NutriMed Ethiopia</h1>
        <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Doctor-Led Digital Nutrition</p>
      </div>
      <div style="padding:32px 0;color:#1f2937;line-height:1.6;">${content}</div>
      <div style="padding-top:24px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
        <p>© ${new Date().getFullYear()} NutriMed Ethiopia. All rights reserved.</p>
        <p>Addis Ababa, Ethiopia · <a href="mailto:support@nutrimed.et" style="color:#28a195;">support@nutrimed.et</a></p>
      </div>
    </div>
  </body>
</html>`;
}

export function welcomeEmail(firstName: string) {
  return {
    subject: "Welcome to NutriMed Ethiopia",
    html: emailLayout(`
      <h2>Welcome, ${firstName}!</h2>
      <p>Thank you for joining NutriMed Ethiopia. We're honored to support your health journey.</p>
      <p>Here's what to do next:</p>
      <ol>
        <li>Complete your health assessment</li>
        <li>Upload any recent lab results</li>
        <li>Book your first consultation</li>
      </ol>
      <p style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#28a195;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
      </p>
    `),
  };
}

export function otpEmail(name: string, code: string) {
  return {
    subject: "Your NutriMed verification code",
    html: emailLayout(`
      <h2>Verification Code</h2>
      <p>Hello ${name},</p>
      <p>Use this code to continue:</p>
      <div style="background:#f0fbf9;border:2px dashed #28a195;padding:24px;text-align:center;margin:24px 0;border-radius:8px;">
        <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#174542;">${code}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;">This code expires in 10 minutes. If you didn't request it, please ignore this email.</p>
    `),
  };
}

export function appointmentConfirmation(
  clientName: string,
  doctorName: string,
  dateTime: string,
  type: string
) {
  return {
    subject: "Appointment Confirmed — NutriMed Ethiopia",
    html: emailLayout(`
      <h2>Appointment Confirmed ✓</h2>
      <p>Hello ${clientName},</p>
      <p>Your appointment with <strong>${doctorName}</strong> has been confirmed.</p>
      <div style="background:#f0fbf9;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:4px 0;"><strong>When:</strong> ${dateTime}</p>
        <p style="margin:4px 0;"><strong>Type:</strong> ${type}</p>
      </div>
      <p>You'll receive a reminder 24 hours and 1 hour before your appointment.</p>
    `),
  };
}

export function planReadyEmail(clientName: string, planTitle: string) {
  return {
    subject: "Your Personalized Nutrition Plan is Ready",
    html: emailLayout(`
      <h2>Your plan is ready, ${clientName} ✨</h2>
      <p>Dr. has prepared a personalized nutrition plan for you:</p>
      <div style="background:#f0fbf9;padding:20px;border-radius:8px;margin:20px 0;">
        <strong style="color:#174542;font-size:18px;">${planTitle}</strong>
      </div>
      <p>Log in to your portal to view the full plan, including Ethiopian food substitutions and fasting-friendly versions.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plan" style="background:#28a195;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View My Plan</a>
      </p>
    `),
  };
}
