import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { AuthError } from "./auth";
import { prisma } from "./prisma";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json<ApiError>(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return fail("UNAUTHORIZED", err.message, err.status);
  }
  if (err instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Invalid request body", 422, err.flatten());
  }
  if (err instanceof Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api error]", err);
    }
    return fail("INTERNAL_ERROR", err.message, 500);
  }
  return fail("UNKNOWN", "An unexpected error occurred", 500);
}

export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

export async function parseFormData<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const form = await req.formData();
  const obj: Record<string, unknown> = {};
  form.forEach((v, k) => {
    if (k in obj) {
      const cur = obj[k];
      obj[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
    } else {
      obj[k] = v;
    }
  });
  return schema.parse(obj);
}

// In-memory rate limiter (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  max: number = 100,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: max - record.count, resetAt: record.resetAt };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Audit log helper
export async function logAudit(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  const { prisma } = await import("./prisma");
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action as never,
      entity: params.entity,
      entityId: params.entityId,
      changes: params.changes as never,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}