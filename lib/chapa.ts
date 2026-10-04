import crypto from "crypto";

const CHAPA_BASE = process.env.CHAPA_BASE ?? "https://api.chapa.co";
const CHAPA_SECRET = process.env.CHAPA_SECRET ?? "";
const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET ?? "";
export const CHAPA_PUBLIC = process.env.CHAPA_PUBLIC ?? "";

export interface ChapaInitializeInput {
  amount: number | string;
  currency?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  description?: string;
  meta?: Record<string, unknown>;
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

export interface ChapaInitializeResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    charge: number;
    status: "success" | "pending" | "failed";
    reference: string;
    created_at: string;
    method: string;
    customer: { email: string; phone: string };
  };
}

export async function initializeChapaTransaction(
  input: ChapaInitializeInput
): Promise<ChapaInitializeResponse> {
  const res = await fetch(`${CHAPA_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amount),
      currency: input.currency ?? "ETB",
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber,
      tx_ref: input.txRef,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      description: input.description,
      customization: {
        title: "NutriMed Ethiopia",
        description: input.description ?? "Healthcare payment",
      },
      meta: input.meta,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chapa initialize failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function verifyChapaTransaction(
  txRef: string
): Promise<ChapaVerifyResponse> {
  const res = await fetch(
    `${CHAPA_BASE}/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${CHAPA_SECRET}` },
    }
  );
  if (!res.ok) {
    throw new Error(`Chapa verify failed: ${res.status}`);
  }
  return res.json();
}

export function generateTxRef(prefix: string = "NM"): string {
  return `${prefix}-${generateReceiptNumber()}-${Date.now()}`;
}

export function verifyChapaWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!CHAPA_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", CHAPA_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

