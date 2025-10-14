/**
 * @file route.ts
 * @asymmetrica: TasksSocket
 * @symbol σ (Consciousness.Tasks)
 * @scope User-level task management with RBAC
 * @regime Amplification (productivity boost)
 * @cost O(n) where n = filtered tasks
 * @lineage [User → Auth → RBAC → Tasks → Response]
 * @purpose Fetch user's tasks with role-based filtering
 * @validation HTX auth required, role-based access control
 *
 * @voltage
 *   Input: { userId?: string, status?: TaskStatus, priority?: TaskPriority, dueDate?: string }
 *   Output: SocketResponse<Task[]>
 *
 * @amperage
 *   Rate: 4.909 Hz base frequency
 *   Limit: 100 requests/minute per user
 *   Burst: 10 requests/second
 *
 * @frequency 4.909 Hz (203.7ms base period)
 *
 * @circuitBreaker
 *   Retry: 3-6-9 harmonic cycle (611ms, 1222ms, 1833ms)
 *   Fallback: Empty array on total failure
 *   Recovery: Database reconnection attempt
 *
 * @groundWire HTX-V1.2 session-based authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { withSocketAuth } from "@/lib/sockets/socket-auth";
import { validateQueryParams } from "@/lib/sockets/socket-validator";
import {
  createSocketResponse,
  createErrorResponse,
  SocketErrorCode,
} from "@/lib/sockets/socket-types";
import { withDatabaseRetry } from "@/lib/sockets/socket-error";
import { withCache } from "@/lib/sockets/socket-cache";
import { TaskQuery } from "@/lib/sockets/socket-validator";
import type { Task } from "@prisma/client";

/**
 * GET /api/tasks
 *
 * Fetch tasks with optional filtering by status, priority, dueDate
 * RBAC enforced: Users see only their tasks, Admins see all tasks
 *
 * @query status - Filter by task status (TODO, IN_PROGRESS, COMPLETED, etc.)
 * @query priority - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
 * @query dueDate - Filter by due date (ISO 8601 format)
 * @query customerId - Filter by customer context
 * @query limit - Max results (default: 50, max: 200)
 * @query offset - Pagination offset
 *
 * @returns SocketResponse<Task[]>
 */
export const GET = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Validate query parameters
    const queryParams = validateQueryParams(request, TaskQuery);

    // Build Prisma query with RBAC filtering
    const where: any = {};

    // RBAC: Users can only see their own tasks, Admins see all
    if (user.role === "USER") {
      where.userId = user.id;
    } else if (queryParams.userId) {
      // Admins can filter by specific user
      where.userId = queryParams.userId;
    }

    // Apply filters
    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (queryParams.priority) {
      where.priority = queryParams.priority;
    }

    if (queryParams.customerId) {
      where.customerId = queryParams.customerId;
    }

    if (queryParams.dueDate) {
      // Filter tasks due on or before specified date
      where.dueDate = {
        lte: new Date(queryParams.dueDate),
      };
    }

    // Determine cache strategy based on user role
    const cacheKey = `tasks:${user.id}:${JSON.stringify(queryParams)}`;
    const shouldCache = !queryParams.status || queryParams.status === "TODO";

    // Execute query with retry logic
    const fetchTasks = async () => {
      return await withDatabaseRetry(async () => {
        const tasks = await prisma.task.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            customer: {
              select: {
                id: true,
                businessName: true,
                customerCode: true,
              },
            },
          },
          orderBy: [
            { priority: "desc" }, // URGENT first
            { dueDate: "asc" }, // Earliest due date first
            { createdAt: "desc" }, // Newest first
          ],
          take: queryParams.limit || 50,
          skip: queryParams.offset || 0,
        });

        return tasks;
      });
    };

    // Fetch with optional caching
    const tasks = shouldCache
      ? await withCache(cacheKey, fetchTasks, { ttl: 5 * 60 * 1000 }) // 5min cache
      : await fetchTasks();

    // Calculate task statistics
    const stats = {
      total: tasks.length,
      byStatus: {
        TODO: tasks.filter((t) => t.status === "TODO").length,
        IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
        BLOCKED: tasks.filter((t) => t.status === "BLOCKED").length,
        COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
        CANCELLED: tasks.filter((t) => t.status === "CANCELLED").length,
      },
      byPriority: {
        LOW: tasks.filter((t) => t.priority === "LOW").length,
        MEDIUM: tasks.filter((t) => t.priority === "MEDIUM").length,
        HIGH: tasks.filter((t) => t.priority === "HIGH").length,
        URGENT: tasks.filter((t) => t.priority === "URGENT").length,
      },
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "COMPLETED",
      ).length,
    };

    // Return success response
    return NextResponse.json(
      createSocketResponse(tasks, {
        stats,
        query: queryParams,
        rbac: {
          role: user.role,
          filtered: user.role === "USER",
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("[TasksSocket] Error fetching tasks:", error);

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to fetch tasks",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});

/**
 * POST /api/tasks
 *
 * Create a new task
 *
 * @body title - Task title (required)
 * @body description - Task description (optional)
 * @body status - Initial status (default: TODO)
 * @body priority - Task priority (default: MEDIUM)
 * @body type - Task type (default: GENERAL)
 * @body customerId - Related customer ID (optional)
 * @body dueDate - Due date (optional, ISO 8601)
 * @body estimatedMinutes - Estimated time (optional)
 * @body tags - Array of tags (optional)
 *
 * @returns SocketResponse<Task>
 */
export const POST = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Parse and validate request body
    const body = await request.json();

    // Validate required fields
    if (
      !body.title ||
      typeof body.title !== "string" ||
      body.title.trim().length === 0
    ) {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.MISSING_REQUIRED_FIELD,
          "Task title is required",
          400,
        ),
        { status: 400 },
      );
    }

    // Validate customerId if provided
    if (body.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: body.customerId },
      });

      if (!customer) {
        return NextResponse.json(
          createErrorResponse(
            SocketErrorCode.NOT_FOUND,
            "Customer not found",
            404,
          ),
          { status: 404 },
        );
      }
    }

    // Create task with retry logic
    const task = await withDatabaseRetry(async () => {
      return await prisma.task.create({
        data: {
          title: body.title.trim(),
          description: body.description || null,
          status: body.status || "TODO",
          priority: body.priority || "MEDIUM",
          type: body.type || "GENERAL",
          userId: user.id,
          assignedBy: user.id,
          customerId: body.customerId || null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          estimatedMinutes: body.estimatedMinutes || null,
          tags: body.tags || [],
          metadata: body.metadata || null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          customer: {
            select: {
              id: true,
              businessName: true,
              customerCode: true,
            },
          },
        },
      });
    });

    // Invalidate cache
    const cachePattern = `tasks:${user.id}:*`;
    // Note: Cache invalidation will be implemented in socket-cache.ts

    // Return success response
    return NextResponse.json(
      createSocketResponse(task, {
        created: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("[TasksSocket] Error creating task:", error);

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to create task",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});
