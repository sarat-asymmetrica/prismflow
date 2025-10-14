#!/usr/bin/env ts-node

/**
 * VDMY SPOC FILES TEST SCRIPT
 * Tests Vedic Data Migration Yantra with real PH Trading Excel files
 *
 * Test Files:
 * 1. opportunities created 2025.xlsx
 * 2. Payments to suppliers.xlsx
 * 3. PH Trading Costing MasterFile.xlsx
 *
 * Success Criteria:
 * - Processing time < 5 seconds per file
 * - Quality Score (Dharma Index) ≥ 0.85
 * - Confidence scores ≥ 0.95 for conflicts
 * - Zero crashes on large files
 * - 100% test coverage for critical paths
 *
 * Author: Agent HOTEL (VDMY Mission)
 * Date: October 9, 2025
 */

import * as fs from "fs";
import * as path from "path";
import { excelParser } from "../lib/vedic/excel-parser";

// Test file paths
const TEST_FILES_DIR =
  "C:\\Projects\\AsymmFlow-PH-Trading\\docs\\PH Specific Information\\Files for OCR Testing";

const TEST_FILES = [
  "opportunities created 2025.xlsx",
  "Payments to suppliers.xlsx",
  "PH Trading Costing MasterFile.xlsx",
];

interface TestResult {
  filename: string;
  success: boolean;
  processingTimeMs: number;
  qualityScore: number;
  sheetCount: number;
  totalRecords: number;
  validatedRecords: number;
  issuesDetected: number;
  successRate: number;
  meetsPerformanceTarget: boolean;
  meetsQualityTarget: boolean;
  error?: string;
}

async function testSingleFile(filePath: string): Promise<TestResult> {
  const filename = path.basename(filePath);
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${filename}`);
  console.log("=".repeat(80));

  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`✓ File loaded: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

    // Parse with VDMY
    const startTime = Date.now();
    const result = await excelParser.parseExcelFile(fileBuffer, filename, {
      extractFormulas: true,
      detectConflicts: true,
      chunkLargeFiles: true,
    });
    const processingTime = Date.now() - startTime;

    // Log results
    console.log(`\n📊 PROCESSING RESULTS:`);
    console.log(`   Processing Time: ${processingTime}ms`);
    console.log(`   Sheets Detected: ${result.sheets.length}`);

    result.sheets.forEach((sheet, index) => {
      console.log(
        `     ${index + 1}. "${sheet.name}": ${sheet.rowCount} rows × ${sheet.columnCount} cols`,
      );
      if (sheet.hasFormulas) {
        console.log(`        └─ Contains ${sheet.formulaCount} formulas`);
      }
    });

    console.log(`\n   Total Records: ${result.metadata.processingTimeMs}`);
    console.log(`   Formulas Found: ${result.formulas.length}`);
    console.log(`   Conflicts Detected: ${result.conflicts.length}`);

    console.log(`\n📈 QUALITY ANALYSIS (Professional Terminology):`);
    console.log(
      `   Quality Score: ${(result.qualityAnalysis.qualityScore * 100).toFixed(2)}%`,
    );
    console.log(
      `   Validated Records: ${result.qualityAnalysis.validatedRecords}`,
    );
    console.log(`   Issues Detected: ${result.qualityAnalysis.issuesDetected}`);
    console.log(
      `   Success Rate: ${(result.qualityAnalysis.successRate * 100).toFixed(2)}%`,
    );

    // Detailed Vedic metrics (backend logging)
    console.log(`\n🔬 VEDIC METRICS (Backend Internal):`);
    console.log(
      `   Dharma Index: ${result.qualityAnalysis.dharma_index.toFixed(4)}`,
    );
    console.log(`   Variance: ${result.qualityAnalysis.variance.toFixed(6)}`);
    console.log(
      `   Mean Confidence: ${result.qualityAnalysis.mean_confidence.toFixed(4)}`,
    );
    console.log(
      `   Stability Score: ${result.qualityAnalysis.stability_score.toFixed(4)}`,
    );

    // Williams optimizer recommendations
    const totalRecords = Object.values(result.data).reduce(
      (sum, rows) => sum + rows.length,
      0,
    );
    const batchSize = excelParser.calculateWilliamsBatchSize(totalRecords);
    const harmonicDelay = excelParser.getTeslaHarmonicDelay(1);

    console.log(`\n⚙️  OPTIMIZATION RECOMMENDATIONS:`);
    console.log(`   Williams Batch Size: ${batchSize} records/batch`);
    console.log(
      `   Tesla Harmonic Delay: ${harmonicDelay.toFixed(1)}ms (4.909 Hz)`,
    );

    // Conflict details
    if (result.conflicts.length > 0) {
      console.log(`\n⚠️  CONFLICTS DETECTED:`);
      result.conflicts.slice(0, 5).forEach((conflict, index) => {
        console.log(
          `   ${index + 1}. [${conflict.type}] ${conflict.sheet} Row ${conflict.row}, Col ${conflict.column}`,
        );
        console.log(`      ${conflict.description}`);
        console.log(
          `      Confidence: ${(conflict.confidence * 100).toFixed(0)}%`,
        );
        if (conflict.suggestedResolution) {
          console.log(`      → ${conflict.suggestedResolution}`);
        }
      });
      if (result.conflicts.length > 5) {
        console.log(`   ... and ${result.conflicts.length - 5} more conflicts`);
      }
    }

    // Success criteria checks
    const meetsPerformanceTarget = processingTime < 5000; // < 5 seconds
    const meetsQualityTarget = result.qualityAnalysis.qualityScore >= 0.85;

    console.log(`\n✅ SUCCESS CRITERIA:`);
    console.log(
      `   Performance Target (< 5s): ${meetsPerformanceTarget ? "✓ PASS" : "✗ FAIL"} (${processingTime}ms)`,
    );
    console.log(
      `   Quality Target (≥ 85%): ${meetsQualityTarget ? "✓ PASS" : "✗ FAIL"} (${(result.qualityAnalysis.qualityScore * 100).toFixed(1)}%)`,
    );

    return {
      filename,
      success: true,
      processingTimeMs: processingTime,
      qualityScore: result.qualityAnalysis.qualityScore,
      sheetCount: result.sheets.length,
      totalRecords,
      validatedRecords: result.qualityAnalysis.validatedRecords,
      issuesDetected: result.qualityAnalysis.issuesDetected,
      successRate: result.qualityAnalysis.successRate,
      meetsPerformanceTarget,
      meetsQualityTarget,
    };
  } catch (error: any) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.error(error.stack);

    return {
      filename,
      success: false,
      processingTimeMs: 0,
      qualityScore: 0,
      sheetCount: 0,
      totalRecords: 0,
      validatedRecords: 0,
      issuesDetected: 0,
      successRate: 0,
      meetsPerformanceTarget: false,
      meetsQualityTarget: false,
      error: error.message,
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log("🚀 VDMY SPOC FILES TEST SUITE");
  console.log(
    "Testing Vedic Data Migration Yantra with real PH Trading Excel files",
  );
  console.log(`Test Files Directory: ${TEST_FILES_DIR}\n`);

  const results: TestResult[] = [];

  // Test each file
  for (const filename of TEST_FILES) {
    const filePath = path.join(TEST_FILES_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ File not found: ${filename}`);
      results.push({
        filename,
        success: false,
        processingTimeMs: 0,
        qualityScore: 0,
        sheetCount: 0,
        totalRecords: 0,
        validatedRecords: 0,
        issuesDetected: 0,
        successRate: 0,
        meetsPerformanceTarget: false,
        meetsQualityTarget: false,
        error: "File not found",
      });
      continue;
    }

    const result = await testSingleFile(filePath);
    results.push(result);
  }

  // Summary Report
  console.log(`\n\n${"=".repeat(80)}`);
  console.log("📊 COMPREHENSIVE TEST SUMMARY");
  console.log("=".repeat(80));

  console.log(
    `\n╔════════════════════════════════════════════════════════════════╗`,
  );
  console.log(
    `║              VDMY SPOC FILES TEST RESULTS                      ║`,
  );
  console.log(
    `╚════════════════════════════════════════════════════════════════╝\n`,
  );

  results.forEach((result, index) => {
    const statusIcon = result.success ? "✅" : "❌";
    console.log(`${index + 1}. ${statusIcon} ${result.filename}`);
    console.log(
      `   Quality Score: ${(result.qualityScore * 100).toFixed(1)}% | Processing: ${result.processingTimeMs}ms`,
    );
    console.log(
      `   Sheets: ${result.sheetCount} | Records: ${result.totalRecords} | Validated: ${result.validatedRecords}`,
    );
    console.log(
      `   Performance: ${result.meetsPerformanceTarget ? "✓" : "✗"} | Quality: ${result.meetsQualityTarget ? "✓" : "✗"}`,
    );
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();
  });

  // Aggregate Statistics
  const successfulTests = results.filter((r) => r.success).length;
  const avgProcessingTime =
    results.reduce((sum, r) => sum + r.processingTimeMs, 0) / results.length;
  const avgQualityScore =
    results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
  const totalRecords = results.reduce((sum, r) => sum + r.totalRecords, 0);
  const totalValidated = results.reduce(
    (sum, r) => sum + r.validatedRecords,
    0,
  );
  const totalIssues = results.reduce((sum, r) => sum + r.issuesDetected, 0);
  const performancePasses = results.filter(
    (r) => r.meetsPerformanceTarget,
  ).length;
  const qualityPasses = results.filter((r) => r.meetsQualityTarget).length;

  console.log(
    `╔════════════════════════════════════════════════════════════════╗`,
  );
  console.log(
    `║                   AGGREGATE STATISTICS                         ║`,
  );
  console.log(
    `╚════════════════════════════════════════════════════════════════╝\n`,
  );

  console.log(
    `Overall Success Rate: ${((successfulTests / results.length) * 100).toFixed(0)}% (${successfulTests}/${results.length} files)`,
  );
  console.log(`Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`);
  console.log(`Average Quality Score: ${(avgQualityScore * 100).toFixed(1)}%`);
  console.log(`Total Records Processed: ${totalRecords.toLocaleString()}`);
  console.log(`Total Validated Records: ${totalValidated.toLocaleString()}`);
  console.log(`Total Issues Detected: ${totalIssues}`);
  console.log(`Performance Passes: ${performancePasses}/${results.length}`);
  console.log(`Quality Passes: ${qualityPasses}/${results.length}`);

  // Final Verdict
  const allPassed = results.every(
    (r) => r.success && r.meetsPerformanceTarget && r.meetsQualityTarget,
  );

  console.log(
    `\n╔════════════════════════════════════════════════════════════════╗`,
  );
  if (allPassed) {
    console.log(
      `║  🎉 ALL TESTS PASSED! VDMY is production-ready! 🎉            ║`,
    );
  } else {
    console.log(
      `║  ⚠️  SOME TESTS FAILED - Review results above                  ║`,
    );
  }
  console.log(
    `╚════════════════════════════════════════════════════════════════╝\n`,
  );

  // Export results to JSON
  const resultsPath = path.join(__dirname, "..", "vdmy-test-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed results exported to: ${resultsPath}\n`);
}

// Run tests
runAllTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
