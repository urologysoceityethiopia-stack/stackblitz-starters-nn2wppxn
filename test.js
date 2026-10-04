const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadDotEnv() {
  const envPath = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    console.warn(".env file not found at", envPath);
    return;
  }

  const envContents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of envContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

if (!process.env.DATABASE_URL && process.env.DIRECT_URL) {
  console.log("DATABASE_URL missing; falling back to DIRECT_URL for Prisma.");
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Prisma test script...");
  console.log("DATABASE_URL present:", Boolean(process.env.DATABASE_URL));
  console.log("DATABASE_URL value:", process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 40) + "..." : "(missing)");

  const delegate = prisma.test_messages;
  if (!delegate || typeof delegate.findMany !== "function") {
    throw new Error(
      "Prisma model delegate not found. Check your Prisma schema and use the correct model name."
    );
  }

  const messages = await delegate.findMany({ take: 20 });
  console.log("Fetched messages:", messages);
}

main()
  .catch((error) => {
    console.error("Error in test script:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });