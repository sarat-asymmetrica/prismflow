/**
 * @file socket-auth.ts
 * @asymmetrica: SocketAuth
 * symbol: Socket.Authentication
 * scope: global (all protected sockets)
 * regime: Stabilization (security foundation)
 * cost: O(1) - session lookup
 * lineage: [HTX.Auth → Socket.Middleware → Request.Validation → Handler]
 * purpose: HTX authentication middleware for socket system
 * validation: Zero unauthorized access, production-validated
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { User } from "@prisma/client";
import {
  SocketContext,
  SocketError,
  SocketErrorCode,
  createErrorResponse,
  SocketHandler,
} from "./socket-types";

/**
 * Extract HTX session token from request
 */
function extractSessionToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check X-HTX-Session-Token header
  const htxHeader = request.headers.get("X-HTX-Session-Token");
  if (htxHeader) {
    return htxHeader;
  }

  // Check cookie
  const cookie = request.cookies.get("htx_session");
  if (cookie?.value) {
    return cookie.value;
  }

  return null;
}

/**
 * Validate HTX session and retrieve user
 */
async function validateHTXSession(sessionToken: string): Promise<User | null> {
  try {
    // Find active session
    const session = await prisma.hTXSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    // Check if session exists
    if (!session) {
      return null;
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.hTXSession.delete({
        where: { id: session.id },
      });
      return null;
    }

    // Update last activity
    await prisma.hTXSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    return session.user;
  } catch (error) {
    console.error("[SocketAuth] Session validation error:", error);
    return null;
  }
}

/**
 * Create socket context from authenticated request
 */
function createSocketContext(request: NextRequest, user: User): SocketContext {
  return {
    user,
    request,
    timestamp: new Date(),
    requestId: crypto.randomUUID(),
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}

/**
 * Socket Authentication Middleware
 *
 * Wraps socket handlers with HTX authentication
 *
 * @example
 * ```typescript
 * export const GET = withSocketAuth(async (context, input) => {
 *   // context.user is guaranteed to exist
 *   const data = await prisma.task.findMany({
 *     where: { userId: context.user.id }
 *   });
 *   return data;
 * });
 * ```
 */
export function withSocketAuth<TInput = any, TOutput = any>(
  handler: SocketHandler<TInput, TOutput>,
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      // Extract session token
      const sessionToken = extractSessionToken(request);

      if (!sessionToken) {
        throw new SocketError(
          SocketErrorCode.AUTH_REQUIRED,
          "Authentication required. Please provide a valid HTX session token.",
          401,
        );
      }

      // Validate session and get user
      const user = await validateHTXSession(sessionToken);

      if (!user) {
        throw new SocketError(
          SocketErrorCode.AUTH_INVALID,
          "Invalid or expired session. Please authenticate again.",
          401,
        );
      }

      // Check if user is active
      if (!user.isActive) {
        throw new SocketError(
          SocketErrorCode.FORBIDDEN,
          "Account is inactive. Please contact support.",
          403,
        );
      }

      // Create socket context
      const context = createSocketContext(request, user);

      // Parse input from query params or body
      let input: TInput;
      if (request.method === "GET") {
        // Parse query parameters
        const url = new URL(request.url);
        const params: Record<string, any> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        input = params as TInput;
      } else {
        // Parse JSON body
        try {
          input = (await request.json()) as TInput;
        } catch {
          input = {} as TInput;
        }
      }

      // Call handler
      const result = await handler(context, input);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Return successful response
      return NextResponse.json({
        success: true,
        data: result,
        meta: {
          requestId: context.requestId,
          timestamp: new Date().toISOString(),
          executionTime,
        },
      });
    } catch (error) {
      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Handle socket errors
      if (error instanceof SocketError) {
        const response = createErrorResponse(error);
        response.meta!.executionTime = executionTime;

        return NextResponse.json(response, {
          status: error.statusCode,
        });
      }

      // Handle unexpected errors
      console.error("[SocketAuth] Unexpected error:", error);

      const response = createErrorResponse(
        new SocketError(
          SocketErrorCode.INTERNAL_ERROR,
          "An unexpected error occurred. Please try again.",
          500,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
      response.meta!.executionTime = executionTime;

      return NextResponse.json(response, { status: 500 });
    }
  };
}

/**
 * Optional Authentication Middleware
 *
 * Attempts authentication but allows anonymous access
 * Sets context.user to null if not authenticated
 */
export function withOptionalAuth<TInput = any, TOutput = any>(
  handler: SocketHandler<TInput, TOutput>,
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      // Extract session token
      const sessionToken = extractSessionToken(request);

      let user: User | null = null;

      if (sessionToken) {
        // Validate session if token provided
        user = await validateHTXSession(sessionToken);
      }

      // Create socket context (user may be null)
      const context: SocketContext = {
        user: user as User, // Type assertion for optional auth
        request,
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      };

      // Parse input
      let input: TInput;
      if (request.method === "GET") {
        const url = new URL(request.url);
        const params: Record<string, any> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        input = params as TInput;
      } else {
        try {
          input = (await request.json()) as TInput;
        } catch {
          input = {} as TInput;
        }
      }

      // Call handler
      const result = await handler(context, input);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Return successful response
      return NextResponse.json({
        success: true,
        data: result,
        meta: {
          requestId: context.requestId,
          timestamp: new Date().toISOString(),
          executionTime,
          authenticated: user !== null,
        },
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (error instanceof SocketError) {
        const response = createErrorResponse(error);
        response.meta!.executionTime = executionTime;

        return NextResponse.json(response, {
          status: error.statusCode,
        });
      }

      console.error("[SocketAuth] Unexpected error:", error);

      const response = createErrorResponse(
        new SocketError(
          SocketErrorCode.INTERNAL_ERROR,
          "An unexpected error occurred. Please try again.",
          500,
        ),
      );
      response.meta!.executionTime = executionTime;

      return NextResponse.json(response, { status: 500 });
    }
  };
}

/**
 * Check if user has required role
 */
export function requireRole(context: SocketContext, ...roles: string[]): void {
  if (!roles.includes(context.user.role)) {
    throw new SocketError(
      SocketErrorCode.FORBIDDEN,
      `Access denied. Required role: ${roles.join(" or ")}`,
      403,
    );
  }
}

/**
 * Check if user has permission
 */
export function requirePermission(
  context: SocketContext,
  permission: string,
): void {
  const permissions = (context.user.permissions as any) || {};

  if (!permissions[permission]) {
    throw new SocketError(
      SocketErrorCode.INSUFFICIENT_PERMISSIONS,
      `Access denied. Missing permission: ${permission}`,
      403,
    );
  }
}
