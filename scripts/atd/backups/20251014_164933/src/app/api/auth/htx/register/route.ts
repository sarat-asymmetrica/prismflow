/**
 * HTX Authentication - User Registration Route
 *
 * POST /api/auth/htx/register
 *
 * Registers a new user with HTX authentication.
 * Validates public key format and stores user in database.
 *
 * Cross-pollinated from iPermit HTX fixes:
 * - Accept multiple public key formats (SPKI, raw, X25519)
 * - Specific error messages for debugging
 * - Proper key length validation
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { z } from "zod";

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schema
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  htxPublicKey: z.string().min(32, "Invalid public key"),
});

/**
 * POST /api/auth/htx/register
 *
 * Register a new HTX user
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, fullName, htxPublicKey } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Validate public key format
    // Support multiple formats: SPKI (91 bytes), P-256 (65 bytes), X25519 (32 bytes)
    let keyBytes: Buffer;
    let keyFormat: string;

    try {
      keyBytes = Buffer.from(htxPublicKey, "base64");

      // Determine key format based on length
      if (keyBytes.length === 32) {
        keyFormat = "x25519";
      } else if (keyBytes.length === 65) {
        keyFormat = "p256";
      } else if (keyBytes.length === 91) {
        keyFormat = "spki";
      } else {
        throw new Error(
          `Invalid key length: ${keyBytes.length} bytes. Expected 32, 65, or 91 bytes.`,
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Invalid public key format",
          details: error.message,
        },
        { status: 400 },
      );
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        htxPublicKey,
        htxKeyFormat: keyFormat,
        isActive: true,
        isVerified: false, // Can implement email verification later
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("[HTX Register] New user registered:", {
      email: user.email,
      keyFormat,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Registration successful",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[HTX Register] Error:", error);

    // Check for Prisma unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Registration failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
