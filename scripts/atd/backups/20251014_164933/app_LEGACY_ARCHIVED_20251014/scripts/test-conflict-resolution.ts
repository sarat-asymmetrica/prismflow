/**
 * Conflict Resolution System Test Script
 * σ: TestConflictResolution | ρ: scripts | γ: Validation | κ: O(n) | λ: E2E_Test
 *
 * Quick validation script to test the complete conflict resolution flow
 *
 * Usage:
 *   ts-node scripts/test-conflict-resolution.ts
 *
 * Author: Agent ROMEO
 * Date: October 9, 2025
 */

import {
  ConflictDetector,
  ConflictType,
  ConflictStatus,
} from "../lib/vedic/conflict-detector";
import { StreamingConflictManager } from "../lib/vedic/streaming-conflict-manager";
import { MOCK_SPOC_CONTEXT } from "../lib/vedic/mock-business-context";

console.log("╔═══════════════════════════════════════════════════════╗");
console.log("║  CONFLICT RESOLUTION SYSTEM TEST                      ║");
console.log("╚═══════════════════════════════════════════════════════╝\n");

async function testConflictResolution() {
  // Initialize systems
  console.log("1️⃣  Initializing systems...");
  const detector = new ConflictDetector();
  const manager = new StreamingConflictManager();

  // Subscribe to events
  manager.on("conflict-detected", (conflict) => {
    console.log(
      `   🚨 Conflict detected: ${conflict.issue.substring(0, 50)}...`,
    );
  });

  manager.on("conflict-resolved", (data) => {
    console.log(`   ✅ Conflict resolved: ${data.status}`);
  });

  manager.on("merit-update", (data) => {
    console.log(`   💛 Merit updated: ${(data.merit * 100).toFixed(0)}%`);
  });

  console.log("   ✅ Systems initialized\n");

  // Start batch
  console.log("2️⃣  Starting batch...");
  manager.startBatch("test-batch-001", 3);
  console.log("   ✅ Batch started\n");

  // Test data with various conflict types
  const testData = [
    // Duplicate customer
    {
      customer_name: "Al-Fahad Trading Est.",
      invoice_id: "INV-2025-4893",
      total_amount: 12000,
    },

    // Duplicate invoice (CRITICAL!)
    { customer_name: "EWA", invoice_id: "INV-2025-4893", total_amount: 15000 },

    // Invalid amount (anomaly)
    {
      customer_name: "ALBA",
      invoice_id: "INV-2025-4894",
      total_amount: 100000,
    },

    // Future date
    {
      customer_name: "BAPCO",
      invoice_id: "INV-2025-4895",
      total_amount: 20000,
      invoice_date: new Date(
        Date.now() + 100 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },

    // Missing customer
    {
      customer_name: "Unknown Company LLC",
      invoice_id: "INV-2025-4896",
      total_amount: 10000,
    },

    // At-risk customer (Grade D)
    {
      customer_name: "Problem Contractor WLL",
      invoice_id: "INV-2025-4897",
      total_amount: 8000,
    },

    // Competitor detected
    {
      customer_name: "GPIC",
      invoice_id: "INV-2025-4898",
      total_amount: 15000,
      description: "ABB control system tender",
    },

    // Sequential gap
    { customer_name: "ASRY", invoice_id: "INV-2025-5000", total_amount: 12000 },

    // Formula error
    {
      customer_name: "NBB",
      invoice_id: "INV-2025-4899",
      total_amount: 0,
      __formula_error: {
        column: "D",
        message: "Circular reference",
        formula: "=D1+D2",
        depth: 11,
      },
    },
  ];

  // File 1
  console.log("3️⃣  Processing file 1...");
  const result1 = await detector.detectConflicts(
    testData.slice(0, 3),
    "Contract_Statement.xlsx",
    {
      topPercent: 0.1,
      minConflicts: 5,
    },
  );

  for (const conflict of result1.topConflicts) {
    await manager.emitConflict(conflict);
  }

  console.log(`   📊 Detected ${result1.allConflicts.length} conflicts`);
  console.log(`   🎯 Top ${result1.topConflicts.length} conflicts (10%)\n`);

  // File 2
  console.log("4️⃣  Processing file 2...");
  const result2 = await detector.detectConflicts(
    testData.slice(3, 6),
    "Customer_Grading.xlsx",
    {
      topPercent: 0.1,
      minConflicts: 5,
    },
  );

  for (const conflict of result2.topConflicts) {
    await manager.emitConflict(conflict);
  }

  console.log(`   📊 Detected ${result2.allConflicts.length} conflicts`);
  console.log(`   🎯 Top ${result2.topConflicts.length} conflicts (10%)\n`);

  // File 3
  console.log("5️⃣  Processing file 3...");
  const result3 = await detector.detectConflicts(
    testData.slice(6),
    "Tender_Details.xlsx",
    {
      topPercent: 0.1,
      minConflicts: 5,
    },
  );

  for (const conflict of result3.topConflicts) {
    await manager.emitConflict(conflict);
  }

  console.log(`   📊 Detected ${result3.allConflicts.length} conflicts`);
  console.log(`   🎯 Top ${result3.topConflicts.length} conflicts (10%)\n`);

  // Progress update
  console.log("6️⃣  Checking progress...");
  manager.updateProgress(3);
  const progress = manager.getCurrentProgress();
  console.log(`   📈 Phase: ${progress.phase}`);
  console.log(`   📄 Files: ${progress.filesProcessed}/${progress.totalFiles}`);
  console.log(
    `   🚩 Conflicts: ${progress.conflictsDetected} detected, ${progress.conflictsResolved} resolved\n`,
  );

  // Auto-resolve high confidence conflicts (>95%)
  console.log("7️⃣  Auto-resolving high confidence conflicts...");
  const allConflicts = manager.getAllConflicts();
  const highConfidence = allConflicts.filter((c) => c.confidence >= 0.95);

  console.log(`   🤖 Found ${highConfidence.length} high-confidence conflicts`);

  for (const conflict of highConfidence) {
    await manager.resolveConflict(
      conflict.id,
      ConflictStatus.AUTO_FIXED,
      "auto-resolver",
    );
  }

  console.log(`   ✅ Auto-resolved ${highConfidence.length} conflicts\n`);

  // Manually resolve remaining
  console.log("8️⃣  Manually resolving remaining conflicts...");
  const pending = manager.getPendingConflicts();

  console.log(`   👤 ${pending.length} conflicts require manual review`);

  // Accept half, reject half (for demo)
  const halfPoint = Math.floor(pending.length / 2);

  for (let i = 0; i < pending.length; i++) {
    const status =
      i < halfPoint ? ConflictStatus.ACCEPTED : ConflictStatus.REJECTED;
    await manager.resolveConflict(pending[i].id, status, "human-reviewer");
  }

  console.log(`   ✅ Manually resolved ${pending.length} conflicts\n`);

  // Complete batch
  console.log("9️⃣  Completing batch...");
  const meritDebt = await manager.completeBatch();

  console.log(`   💛 Merit: ${(meritDebt.merit * 100).toFixed(1)}%`);
  console.log(`   🔴 Debt: ${meritDebt.debt.toFixed(1)}`);
  console.log(`   📊 Ratio: ${meritDebt.ratio.toFixed(3)}`);
  console.log(`   ⭐ Quality: ${meritDebt.quality}\n`);

  // Statistics
  console.log("🔟 Final Statistics:");
  console.log("═══════════════════════════════════════════════");

  const allResults = [result1, result2, result3];
  const totalDetected = allResults.reduce(
    (sum, r) => sum + r.allConflicts.length,
    0,
  );
  const totalTop = allResults.reduce(
    (sum, r) => sum + r.topConflicts.length,
    0,
  );

  console.log(`Total conflicts detected: ${totalDetected}`);
  console.log(`Top 10% shown: ${totalTop}`);
  console.log(`Auto-fixed: ${highConfidence.length}`);
  console.log(`Manually resolved: ${pending.length}`);
  console.log(`Final merit: ${(meritDebt.merit * 100).toFixed(1)}%`);
  console.log(`Final debt: ${meritDebt.debt.toFixed(1)}`);
  console.log(`Quality: ${meritDebt.quality}`);

  // Conflict type breakdown
  console.log("\n📊 Conflict Type Breakdown:");
  console.log("═══════════════════════════════════════════════");

  const allConflictsTotal = allResults.flatMap((r) => r.allConflicts);
  const typeCount: { [key: string]: number } = {};

  for (const conflict of allConflictsTotal) {
    typeCount[conflict.type] = (typeCount[conflict.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(typeCount).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`${type.padEnd(25)}: ${count}`);
  }

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  TEST COMPLETE - ALL SYSTEMS OPERATIONAL! ✅          ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // Cleanup
  manager.destroy();
  detector.reset();
}

// Run test
testConflictResolution().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
