/**
 * HTX Authentication - Current User Route
 *
 * GET /api/auth/htx/me
 *
 * Returns current authenticated user information.
 * Validates session token and returns user details.
 *
 * Cross-pollinated from iPermit HTX fixes:
 * - Extract token from Authorization header
 * - Validate session expiry
 * - Return specific error messages
 * - Check user is still active
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * GET /api/auth/htx/me
 *
 * Get current authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Find session by token
    const session = await prisma.hTXSession.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            permissions: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await prisma.hTXSession.delete({
        where: { id: session.id },
      });

      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Check if user is still active
    if (!session.user.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 401 });
    }

    // Update last activity timestamp
    await prisma.hTXSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    // Return user information
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
      permissions: session.user.permissions || {},
      createdAt: session.user.createdAt,
      lastLoginAt: session.user.lastLoginAt,
      sessionExpiresAt: session.expiresAt,
    });
  } catch (error: any) {
    console.error("[HTX Me] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to get user",
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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
