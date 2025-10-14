/**
 * Conflicts List API - Asymmetrica Protocol
 * σ: ConflictsListAPI | ρ: app.api.conflicts.list | γ: Backend | κ: O(1) | λ: State_Query
 *
 * GET /api/conflicts/list
 *
 * Returns current conflict state with progress and merit/debt
 *
 * Author: Agent ROMEO
 * Date: October 9, 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { Conflict, ConflictStatus } from "@/lib/vedic/conflict-detector";

// Mock conflict store (in production, use Redis/Database)
const mockConflicts: Conflict[] = [];

export async function GET(request: NextRequest) {
  try {
    // In production, query from streaming conflict manager
    // For now, return mock data

    const pending = mockConflicts.filter(
      (c) => c.status === ConflictStatus.PENDING,
    );
    const resolved = mockConflicts.filter(
      (c) => c.status !== ConflictStatus.PENDING,
    );

    const merit =
      resolved.length > 0
        ? resolved.reduce((sum, c) => sum + c.confidence, 0) /
          mockConflicts.length
        : 0;

    const debt = pending.length;

    return NextResponse.json({
      success: true,
      conflicts: mockConflicts,
      progress: {
        batchId: "demo-batch",
        phase: "DETECTING",
        filesProcessed: 3,
        totalFiles: 5,
        conflictsDetected: mockConflicts.length,
        conflictsResolved: resolved.length,
        merit,
        debt,
        eta: 30,
      },
      meritDebt: {
        merit,
        debt,
        ratio: merit / (debt + 1),
        quality:
          merit >= 0.9 ? "EXCELLENT" : merit >= 0.75 ? "GOOD" : "MODERATE",
      },
    });
  } catch (error) {
    console.error("Failed to list conflicts:", error);

    return NextResponse.json(
      { success: false, error: "Failed to list conflicts" },
      { status: 500 },
    );
  }
}
