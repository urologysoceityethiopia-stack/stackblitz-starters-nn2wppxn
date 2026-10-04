/**
 * requires RSA-signed payloads and merchant app registration.
 * Wire to your live credentials in production.
 */

import crypto from "crypto";

interface TelebirrConfig {
  appId: string;
  appKey: string;
  publicKey: string;
  shortCode: string;
  env: "sandbox" | "production";
}

function getConfig(): TelebirrConfig {
  return {
    appId: process.env.TELEBIRR_APP_ID ?? "",
    appKey: process.env.TELEBIRR_APP_KEY ?? "",
    publicKey: process.env.TELEBIRR_PUBLIC_KEY ?? "",
    shortCode: process.env.TELEBIRR_SHORT_CODE ?? "",
    env: (process.env.TELEBIRR_ENV as "sandbox" | "production") ?? "sandbox",
  };
}

const BASE_URLS = {
  sandbox: "https://developerportal.ethiotelecom.et:8443",
  production: "https://api.telebirr.com",
};

export interface TelebirrPrepayInput {
  outTradeNo: string;
  subject: string;
  totalAmount: number; // ETB
  notifyUrl: string;
  returnUrl: string;
}

export interface TelebirrPrepayResponse {
  code: string;
  message: string;
  data: {
    prepayId: string;
    bizRedirectUrl: string;
  };
}

export async function createTelebirrPrepay(
  input: TelebirrPrepayInput
): Promise<TelebirrPrepayResponse> {
  const cfg = getConfig();
  const base = BASE_URLS[cfg.env];

  const payload = {
    appid: cfg.appId,
    merch_code: cfg.shortCode,
    nonce_str: crypto.randomBytes(16).toString("hex"),
    out_trade_no: input.outTradeNo,
    subject: input.subject,
    total_amount: input.totalAmount.toFixed(2),
    notify_url: input.notifyUrl,
    return_url: input.returnUrl,
    timestamp: Date.now().toString(),
  };

  // In production: RSA sign with merchant private key, encrypt with Telebirr public key.
  // This is a placeholder for the signing flow.
  const res = await fetch(`${base}/payment/v1/precreate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Id": cfg.appId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Telebirr prepay failed: ${res.status}`);
  }
  return res.json();
}

export async function queryTelebirrOrder(outTradeNo: string) {
  const cfg = getConfig();
  const base = BASE_URLS[cfg.env];
  const res = await fetch(
    `${base}/payment/v1/query?out_trade_no=${encodeURIComponent(outTradeNo)}`,
    { headers: { "X-App-Id": cfg.appId } }
  );
  if (!res.ok) throw new Error(`Telebirr query failed: ${res.status}`);
  return res.json();
}