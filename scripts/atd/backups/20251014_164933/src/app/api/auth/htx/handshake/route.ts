/**
 * HTX Authentication - Handshake Route
 *
 * POST /api/auth/htx/handshake
 *
 * Authenticates user by validating public key and creating session.
 * This is the core authentication endpoint.
 *
 * Cross-pollinated from iPermit HTX fixes:
 * - Validate public key matches stored key
 * - Generate secure session tokens (crypto.randomBytes)
 * - Set reasonable expiry (30 days)
 * - Update lastLoginAt timestamp
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { z } from "zod";
import crypto from "crypto";

// Initialize Prisma client
const prisma = new PrismaClient();

// In-memory session store (TODO: Replace with Redis in production)
const sessions = new Map<string, { userId: string; createdAt: number }>();

// Validation schema
const HandshakeSchema = z.object({
  email: z.string().email("Invalid email address"),
  clientPublicKey: z.string().min(32, "Invalid public key"),
});

/**
 * POST /api/auth/htx/handshake
 *
 * Authenticate user and create session
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = HandshakeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, clientPublicKey } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        htxPublicKey: true,
        isActive: true,
        role: true,
        permissions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 401 });
    }

    // Validate client public key matches stored key
    if (user.htxPublicKey !== clientPublicKey) {
      console.warn("[HTX Handshake] Public key mismatch for user:", email);
      return NextResponse.json(
        { error: "Public key mismatch" },
        { status: 401 },
      );
    }

    // Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString("base64url");

    // Calculate expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Get client info from request
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create session in database
    const session = await prisma.hTXSession.create({
      data: {
        userId: user.id,
        sessionToken,
        publicKey: clientPublicKey,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Store in memory cache for fast lookup
    sessions.set(sessionToken, {
      userId: user.id,
      createdAt: Date.now(),
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    console.log("[HTX Handshake] Authentication successful:", {
      email: user.email,
      userId: user.id,
      sessionId: session.id,
    });

    // Return success with session token
    return NextResponse.json({
      success: true,
      accessToken: sessionToken,
      tokenType: "bearer",
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions || {},
      },
    });
  } catch (error: any) {
    console.error("[HTX Handshake] Error:", error);

    return NextResponse.json(
      {
        error: "Handshake failed",
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

/**
 * Clean up expired sessions periodically
 * TODO: Move to background job in production
 */
setInterval(
  async () => {
    try {
      const now = new Date();
      await prisma.hTXSession.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
    } catch (error) {
      console.error("[HTX Session Cleanup] Error:", error);
    }
  },
  60 * 60 * 1000,
); // Every hour
