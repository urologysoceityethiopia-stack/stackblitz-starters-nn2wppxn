/**
 * Secure file storage — abstracts S3, R2, and local file system.
 * Default = local in dev, S3 in production.
 */

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  category: string;
  userId: string;
}

interface UploadResult {
  storageKey: string;
  url: string;
  size: number;
  checksum: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
];

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? "10", 10);

function getProvider(): "local" | "s3" | "r2" {
  return (process.env.STORAGE_PROVIDER as "local" | "s3" | "r2") ?? "local";
}

function generateStorageKey(category: string, userId: string, originalName: string) {
  const ext = path.extname(originalName);
  const random = crypto.randomBytes(8).toString("hex");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  return `${category}/${date}/${userId}/${random}${ext}`;
}

function computeChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
    throw new Error(`Unsupported file type: ${input.mimeType}`);
  }
  const sizeMB = input.buffer.length / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    throw new Error(`File too large: ${sizeMB.toFixed(1)}MB > ${MAX_SIZE_MB}MB`);
  }

  const storageKey = generateStorageKey(input.category, input.userId, input.originalName);
  const checksum = computeChecksum(input.buffer);
  const provider = getProvider();

  if (provider === "local") {
    const uploadDir = path.join(process.cwd(), "public", "uploads", path.dirname(storageKey));
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(process.cwd(), "public", "uploads", storageKey);
    await fs.writeFile(filePath, input.buffer);
    return {
      storageKey,
      url: `/uploads/${storageKey}`,
      size: input.buffer.length,
      checksum,
    };
  }

  if (provider === "s3" || provider === "r2") {
    // Lazy import AWS SDK to keep dev lightweight
    // Production: configure @aws-sdk/client-s3 and use PutObjectCommand
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.STORAGE_REGION,
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET!,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
        Metadata: { checksum, userId: input.userId, category: input.category },
      })
    );
    const url =
      process.env.STORAGE_PUBLIC_URL ?? `https://${process.env.STORAGE_BUCKET}.s3.${process.env.STORAGE_REGION}.amazonaws.com/${storageKey}`;
    return { storageKey, url, size: input.buffer.length, checksum };
  }

  throw new Error(`Unknown storage provider: ${provider}`);
}

export async function deleteFile(storageKey: string): Promise<void> {
  const provider = getProvider();
  if (provider === "local") {
    const filePath = path.join(process.cwd(), "public", "uploads", storageKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore
    }
    return;
  }
  if (provider === "s3" || provider === "r2") {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.STORAGE_REGION,
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    });
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.STORAGE_BUCKET!,
        Key: storageKey,
      })
    );
  }
}

export async function getSignedUrl(storageKey: string, expiresIn = 3600): Promise<string> {
  const provider = getProvider();
  if (provider === "local") return `/uploads/${storageKey}`;
  if (provider === "s3" || provider === "r2") {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = new S3Client({
      region: process.env.STORAGE_REGION,
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    });
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.STORAGE_BUCKET!,
        Key: storageKey,
      }),
      { expiresIn }
    );
  }
  return "";
}

export { ALLOWED_MIME_TYPES, MAX_SIZE_MB };