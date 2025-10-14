/**
 * @file route.ts
 * @asymmetrica: GoalsSocket.CurrentMonth
 * @symbol ρ (Consciousness.Goals.CurrentMonth)
 * @scope User-level monthly goal tracking
 * @regime Convergence (focus alignment)
 * @cost O(n) where n = active goals this month
 * @lineage [User → Auth → Goals → Progress.Calculate → Response]
 * @purpose Fetch user's current month goals with real-time progress
 * @validation HTX auth required, user can only see own goals
 *
 * @voltage
 *   Input: { userId?: string }
 *   Output: SocketResponse<GoalWithProgress[]>
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
import {
  createSocketResponse,
  createErrorResponse,
  SocketErrorCode,
} from "@/lib/sockets/socket-types";
import { withDatabaseRetry } from "@/lib/sockets/socket-error";
import { withCache } from "@/lib/sockets/socket-cache";

/**
 * Goal with calculated progress
 */
interface GoalWithProgress {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  startDate: Date;
  endDate: Date;
  category: string | null;
  isActive: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Calculated fields
  progress: {
    percentage: number;
    remaining: number;
    isOnTrack: boolean;
    daysRemaining: number;
    dailyPaceRequired: number;
    currentDailyPace: number;
  };
}

/**
 * GET /api/goals/current-month
 *
 * Fetch user's goals for the current month with real-time progress calculation
 * Includes pace analysis and on-track indicators
 *
 * @returns SocketResponse<GoalWithProgress[]>
 */
export const GET = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Calculate current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Cache key for current month goals
    const cacheKey = `goals:current-month:${user.id}:${startOfMonth.toISOString()}`;

    // Fetch goals with caching (1 minute TTL for real-time feel)
    const fetchGoals = async () => {
      return await withDatabaseRetry(async () => {
        // Fetch active monthly goals that overlap with current month
        const goals = await prisma.Goal.findMany({
          where: {
            userId: user.id,
            isActive: true,
            period: "MONTHLY",
            startDate: {
              lte: endOfMonth,
            },
            endDate: {
              gte: startOfMonth,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: [
            { endDate: "asc" }, // Earliest deadline first
            { createdAt: "desc" }, // Newest first
          ],
        });

        return goals;
      });
    };

    const goals = await withCache(cacheKey, fetchGoals, { ttl: 60 * 1000 }); // 1min cache

    // Calculate progress for each goal
    const goalsWithProgress: GoalWithProgress[] = goals.map((goal) => {
      const percentage =
        goal.targetValue > 0
          ? Math.min(
              Math.round((goal.currentValue / goal.targetValue) * 100),
              100,
            )
          : 0;

      const remaining = Math.max(goal.targetValue - goal.currentValue, 0);

      // Calculate days remaining
      const daysRemaining = Math.max(
        Math.ceil(
          (new Date(goal.endDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        0,
      );

      // Calculate days elapsed
      const totalDays = Math.ceil(
        (new Date(goal.endDate).getTime() -
          new Date(goal.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const daysElapsed = Math.max(totalDays - daysRemaining, 0);

      // Calculate daily pace
      const currentDailyPace =
        daysElapsed > 0 ? goal.currentValue / daysElapsed : 0;
      const dailyPaceRequired =
        daysRemaining > 0 ? remaining / daysRemaining : remaining;

      // Determine if on track (current pace >= 80% of required pace)
      const isOnTrack =
        percentage >= 100 || currentDailyPace >= dailyPaceRequired * 0.8;

      return {
        ...goal,
        progress: {
          percentage,
          remaining,
          isOnTrack,
          daysRemaining,
          dailyPaceRequired: Math.round(dailyPaceRequired * 100) / 100,
          currentDailyPace: Math.round(currentDailyPace * 100) / 100,
        },
      };
    });

    // Calculate aggregate statistics
    const stats = {
      total: goalsWithProgress.length,
      completed: goalsWithProgress.filter((g) => g.progress.percentage >= 100)
        .length,
      onTrack: goalsWithProgress.filter((g) => g.progress.isOnTrack).length,
      offTrack: goalsWithProgress.filter(
        (g) => !g.progress.isOnTrack && g.progress.percentage < 100,
      ).length,
      averageProgress:
        goalsWithProgress.length > 0
          ? Math.round(
              goalsWithProgress.reduce(
                (sum, g) => sum + g.progress.percentage,
                0,
              ) / goalsWithProgress.length,
            )
          : 0,
      byCategory: goalsWithProgress.reduce(
        (acc, g) => {
          const cat = g.category || "uncategorized";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    // Return success response
    return NextResponse.json(
      createSocketResponse(goalsWithProgress, {
        stats,
        period: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
          daysRemaining: Math.max(
            Math.ceil(
              (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            ),
            0,
          ),
        },
        timestamp: now.toISOString(),
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("[GoalsSocket] Error fetching current month goals:", error);

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to fetch current month goals",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/goals/current-month
 *
 * Update progress for a specific goal
 *
 * @body goalId - Goal ID to update (required)
 * @body currentValue - New current value (required)
 *
 * @returns SocketResponse<GoalWithProgress>
 */
export const PATCH = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Parse and validate request body
    const body = await request.json();

    // Validate required fields
    if (!body.goalId || typeof body.goalId !== "string") {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.MISSING_REQUIRED_FIELD,
          "Goal ID is required",
          400,
        ),
        { status: 400 },
      );
    }

    if (
      body.currentValue === undefined ||
      typeof body.currentValue !== "number"
    ) {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.MISSING_REQUIRED_FIELD,
          "Current value is required",
          400,
        ),
        { status: 400 },
      );
    }

    // Update goal with retry logic
    const updatedGoal = await withDatabaseRetry(async () => {
      // Verify goal belongs to user
      const existingGoal = await prisma.Goal.findUnique({
        where: { id: body.goalId },
      });

      if (!existingGoal) {
        throw new Error("Goal not found");
      }

      if (existingGoal.userId !== user.id && user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Check if goal is now completed
      const isCompleted = body.currentValue >= existingGoal.targetValue;

      return await prisma.Goal.update({
        where: { id: body.goalId },
        data: {
          currentValue: body.currentValue,
          completedAt:
            isCompleted && !existingGoal.completedAt
              ? new Date()
              : existingGoal.completedAt,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    });

    // Calculate progress
    const now = new Date();
    const percentage =
      updatedGoal.targetValue > 0
        ? Math.min(
            Math.round(
              (updatedGoal.currentValue / updatedGoal.targetValue) * 100,
            ),
            100,
          )
        : 0;

    const remaining = Math.max(
      updatedGoal.targetValue - updatedGoal.currentValue,
      0,
    );

    const daysRemaining = Math.max(
      Math.ceil(
        (new Date(updatedGoal.endDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
      0,
    );

    const totalDays = Math.ceil(
      (new Date(updatedGoal.endDate).getTime() -
        new Date(updatedGoal.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const daysElapsed = Math.max(totalDays - daysRemaining, 0);

    const currentDailyPace =
      daysElapsed > 0 ? updatedGoal.currentValue / daysElapsed : 0;
    const dailyPaceRequired =
      daysRemaining > 0 ? remaining / daysRemaining : remaining;

    const isOnTrack =
      percentage >= 100 || currentDailyPace >= dailyPaceRequired * 0.8;

    const goalWithProgress: GoalWithProgress = {
      ...updatedGoal,
      progress: {
        percentage,
        remaining,
        isOnTrack,
        daysRemaining,
        dailyPaceRequired: Math.round(dailyPaceRequired * 100) / 100,
        currentDailyPace: Math.round(currentDailyPace * 100) / 100,
      },
    };

    // Invalidate cache
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const cacheKey = `goals:current-month:${user.id}:${startOfMonth.toISOString()}`;
    // Note: Cache invalidation will be implemented in socket-cache.ts

    // Return success response
    return NextResponse.json(
      createSocketResponse(goalWithProgress, {
        updated: true,
        timestamp: now.toISOString(),
      }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[GoalsSocket] Error updating goal:", error);

    if (error.message === "Goal not found") {
      return NextResponse.json(
        createErrorResponse(SocketErrorCode.NOT_FOUND, "Goal not found", 404),
        { status: 404 },
      );
    }

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.FORBIDDEN,
          "You do not have permission to update this goal",
          403,
        ),
        { status: 403 },
      );
    }

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to update goal",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});
