/**
 * SMS service — supports Africa's Talking (default), Twilio, and others.
 * Falls back to console logging in development.
 */

interface SmsInput {
  to: string; // E.164 format, e.g. +251911234567
  message: string;
}

export async function sendSms(input: SmsInput): Promise<{ ok: boolean; id?: string }> {
  const provider = process.env.SMS_PROVIDER ?? "africastalking";

  // Africa's Talking
  if (provider === "africastalking") {
    const apiKey = process.env.SMS_API_KEY;
    const username = process.env.SMS_USERNAME;
    if (!apiKey || !username) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`\n📱 [DEV SMS to ${input.to}]: ${input.message}\n`);
        return { ok: true, id: "dev" };
      }
      throw new Error("Africa's Talking credentials missing");
    }
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: new URLSearchParams({
        username,
        to: input.to,
        message: input.message,
        from: process.env.SMS_SENDER_ID ?? "NutriMed",
      }),
    });
    if (!res.ok) throw new Error(`SMS failed: ${res.status}`);
    const data = await res.json();
    return { ok: true, id: data?.SMSMessageData?.Recipients?.[0]?.messageId };
  }

  // Twilio
  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) throw new Error("Twilio credentials missing");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: input.to,
          From: process.env.TWILIO_FROM ?? "",
          Body: input.message,
        }),
      }
    );
    if (!res.ok) throw new Error(`Twilio SMS failed: ${res.status}`);
    const data = await res.json();
    return { ok: true, id: data.sid };
  }

  // Dev fallback
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📱 [DEV SMS to ${input.to}]: ${input.message}\n`);
    return { ok: true, id: "dev" };
  }

  throw new Error("No SMS provider configured");
}

// Common SMS templates
export const smsTemplates = {
  otp: (code: string) => `Your NutriMed verification code is: ${code}. Valid for 10 minutes. Do not share.`,
  appointmentReminder: (date: string) =>
    `Reminder: Your NutriMed appointment is on ${date}. Reply CANCEL to cancel.`,
  planReady: () =>
    `Your personalized nutrition plan is ready. Log in to view: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plan`,
  followUpDue: () =>
    `Time for your NutriMed check-in. Please update your progress: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/progress`,
};