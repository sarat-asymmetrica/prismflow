/**
 * HTX User Seeding Script
 *
 * Seeds test users for HTX authentication development/testing.
 * Generates valid HTX keys for realistic testing.
 *
 * Usage:
 *   npx tsx prisma/seed-htx-users.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Generate a test HTX public key
 * In production, users generate these client-side
 */
function generateTestPublicKey(format: "x25519" | "p256" | "spki"): string {
  let keyBytes: Buffer;

  switch (format) {
    case "x25519":
      // X25519 public key is 32 bytes
      keyBytes = crypto.randomBytes(32);
      break;

    case "p256":
      // P-256 uncompressed public key is 65 bytes (0x04 + 32 + 32)
      keyBytes = Buffer.concat([
        Buffer.from([0x04]), // Uncompressed point marker
        crypto.randomBytes(32), // X coordinate
        crypto.randomBytes(32), // Y coordinate
      ]);
      break;

    case "spki":
      // SPKI format is 91 bytes for X25519
      // (Simplified - real SPKI would have ASN.1 structure)
      keyBytes = crypto.randomBytes(91);
      break;
  }

  return keyBytes.toString("base64");
}

async function main() {
  console.log("🔐 Seeding HTX test users...");

  // Test User 1: Sarat (Admin)
  const sarat = await prisma.user.upsert({
    where: { email: "sarat@asymmetrica.ai" },
    update: {},
    create: {
      email: "sarat@asymmetrica.ai",
      fullName: "Sarat Chandran",
      htxPublicKey: generateTestPublicKey("x25519"),
      htxKeyFormat: "x25519",
      isActive: true,
      isVerified: true,
      role: "SUPERADMIN",
      permissions: {
        all: true,
        customers: { read: true, write: true, delete: true },
        orders: { read: true, write: true, delete: true },
        invoices: { read: true, write: true, delete: true },
        settings: { read: true, write: true },
      },
    },
  });
  console.log("✅ Created user:", sarat.email, "(SUPERADMIN)");

  // Test User 2: Anand (Admin)
  const anand = await prisma.user.upsert({
    where: { email: "anand.989@gmail.com" },
    update: {},
    create: {
      email: "anand.989@gmail.com",
      fullName: "Anand Sarat",
      htxPublicKey: generateTestPublicKey("p256"),
      htxKeyFormat: "p256",
      isActive: true,
      isVerified: true,
      role: "ADMIN",
      permissions: {
        customers: { read: true, write: true },
        orders: { read: true, write: true },
        invoices: { read: true, write: true },
        reports: { read: true },
      },
    },
  });
  console.log("✅ Created user:", anand.email, "(ADMIN)");

  // Test User 3: Test User (Regular User)
  const testUser = await prisma.user.upsert({
    where: { email: "test@asymmflow.com" },
    update: {},
    create: {
      email: "test@asymmflow.com",
      fullName: "Test User",
      htxPublicKey: generateTestPublicKey("spki"),
      htxKeyFormat: "spki",
      isActive: true,
      isVerified: true,
      role: "USER",
      permissions: {
        customers: { read: true },
        orders: { read: true },
        invoices: { read: true },
      },
    },
  });
  console.log("✅ Created user:", testUser.email, "(USER)");

  // Test User 4: Demo User (For HTX demo page)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@htx.local" },
    update: {},
    create: {
      email: "demo@htx.local",
      fullName: "HTX Demo User",
      htxPublicKey: generateTestPublicKey("x25519"),
      htxKeyFormat: "x25519",
      isActive: true,
      isVerified: true,
      role: "USER",
      permissions: {
        customers: { read: true },
        demo: { read: true, write: true },
      },
    },
  });
  console.log("✅ Created user:", demoUser.email, "(DEMO)");

  // Test User 5: Inactive User (For testing disabled accounts)
  const inactiveUser = await prisma.user.upsert({
    where: { email: "inactive@test.com" },
    update: {},
    create: {
      email: "inactive@test.com",
      fullName: "Inactive User",
      htxPublicKey: generateTestPublicKey("x25519"),
      htxKeyFormat: "x25519",
      isActive: false, // Disabled account
      isVerified: false,
      role: "USER",
    },
  });
  console.log(
    "✅ Created user:",
    inactiveUser.email,
    "(INACTIVE - for testing)",
  );

  console.log("\n🎉 HTX user seeding complete!");
  console.log("\n📝 Test Credentials:");
  console.log("-------------------");
  console.log("1. sarat@asymmetrica.ai (SUPERADMIN)");
  console.log(`   Public Key: ${sarat.htxPublicKey?.substring(0, 32)}...`);
  console.log("2. anand.989@gmail.com (ADMIN)");
  console.log(`   Public Key: ${anand.htxPublicKey?.substring(0, 32)}...`);
  console.log("3. test@asymmflow.com (USER)");
  console.log(`   Public Key: ${testUser.htxPublicKey?.substring(0, 32)}...`);
  console.log("4. demo@htx.local (DEMO)");
  console.log(`   Public Key: ${demoUser.htxPublicKey?.substring(0, 32)}...`);
  console.log("5. inactive@test.com (INACTIVE)");
  console.log("\n💡 Use these public keys in your HTX handshake requests!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
