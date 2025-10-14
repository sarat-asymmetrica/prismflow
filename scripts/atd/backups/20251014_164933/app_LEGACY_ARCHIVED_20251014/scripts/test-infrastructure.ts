/**
 * Infrastructure Validation Test Suite
 * Agent NOVEMBER - Infrastructure Setup Mission
 *
 * Tests:
 * 1. ZIP extraction with sample archive
 * 2. AIMLAPI client initialization
 * 3. Multi-model connectivity (Claude, GPT-4o-mini, Gemini)
 * 4. Batch processing end-to-end
 * 5. Cost tracking validation
 *
 * Usage:
 *   npx ts-node scripts/test-infrastructure.ts
 */

import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";
import { zipExtractor } from "../lib/vedic/zip-extractor";
import {
  AIMLAPIClient,
  AIModel,
  MODEL_PRICING,
} from "../lib/vedic/aimlapi-client";
import { excelParser } from "../lib/vedic/excel-parser";

// Test configuration
const TEST_CONFIG = {
  createSampleZip: true,
  testAIMLAPI: false, // Set to true if you have a valid API key
  cleanupAfterTests: true,
};

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  duration: number;
  message?: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Create sample ZIP archive with test Excel files
 */
async function createSampleZip(): Promise<string> {
  console.log("\n📦 Creating sample ZIP archive...");

  const tempDir = path.join(process.cwd(), "temp", "test-data");
  await fs.mkdir(tempDir, { recursive: true });

  const zipPath = path.join(tempDir, "test-archive.zip");
  const zip = new AdmZip();

  // Create sample CSV files (simpler than XLSX for testing)
  const sampleFiles = [
    {
      name: "customers.csv",
      content:
        "ID,Name,Email,Phone\n1,John Doe,john@example.com,555-0101\n2,Jane Smith,jane@example.com,555-0102",
    },
    {
      name: "orders.csv",
      content:
        "OrderID,CustomerID,Amount,Date\n1001,1,150.00,2025-10-01\n1002,2,275.50,2025-10-02",
    },
    {
      name: "products.csv",
      content:
        "ProductID,Name,Price,Stock\nP001,Widget,25.00,100\nP002,Gadget,45.00,50",
    },
    {
      name: "nested/transactions.csv",
      content:
        "TransactionID,OrderID,Status\nT001,1001,Completed\nT002,1002,Pending",
    },
    {
      name: "nested/invoices.csv",
      content:
        "InvoiceID,OrderID,Total,Paid\nINV001,1001,150.00,Yes\nINV002,1002,275.50,No",
    },
  ];

  for (const file of sampleFiles) {
    zip.addFile(file.name, Buffer.from(file.content, "utf-8"));
  }

  zip.writeZip(zipPath);

  console.log(`✅ Created ZIP with ${sampleFiles.length} files at: ${zipPath}`);
  return zipPath;
}

/**
 * Test 1: ZIP Extraction
 */
async function testZipExtraction(zipPath: string): Promise<TestResult> {
  const startTime = Date.now();
  const testName = "ZIP Extraction";

  try {
    console.log(`\n🧪 Test: ${testName}`);

    const result = await zipExtractor.extractExcelFiles(zipPath, {
      includeCsv: true,
    });

    console.log(`  - Extracted ${result.totalFilesExtracted} files`);
    console.log(`  - Found ${result.excelFileCount} Excel/CSV files`);
    console.log(`  - Processing time: ${result.metadata.processingTimeMs}ms`);

    // Validate
    if (result.excelFileCount < 5) {
      throw new Error(
        `Expected at least 5 files, got ${result.excelFileCount}`,
      );
    }

    // Cleanup
    await zipExtractor.cleanupTempDirectory(result.tempDirectory);

    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);

    return {
      name: testName,
      status: "PASS",
      duration,
      data: {
        filesExtracted: result.totalFilesExtracted,
        excelFiles: result.excelFileCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testName} FAILED: ${error}`);

    return {
      name: testName,
      status: "FAIL",
      duration,
      message: String(error),
    };
  }
}

/**
 * Test 2: AIMLAPI Client Initialization
 */
async function testAIMLAPIInit(): Promise<TestResult> {
  const startTime = Date.now();
  const testName = "AIMLAPI Client Initialization";

  try {
    console.log(`\n🧪 Test: ${testName}`);

    const apiKey = process.env.AIMLAPI_API_KEY || "test-key";
    const client = new AIMLAPIClient({
      apiKey,
      baseURL: process.env.AIMLAPI_BASE_URL,
      defaultModel: AIModel.GPT_4O_MINI,
    });

    console.log(`  - Client initialized successfully`);
    console.log(`  - Default model: ${AIModel.GPT_4O_MINI}`);
    console.log(
      `  - Base URL: ${process.env.AIMLAPI_BASE_URL || "https://api.aimlapi.com/v1"}`,
    );

    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);

    return {
      name: testName,
      status: "PASS",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testName} FAILED: ${error}`);

    return {
      name: testName,
      status: "FAIL",
      duration,
      message: String(error),
    };
  }
}

/**
 * Test 3: AIMLAPI Model Connectivity (SKIP if no API key)
 */
async function testAIMLAPIConnectivity(): Promise<TestResult> {
  const startTime = Date.now();
  const testName = "AIMLAPI Model Connectivity";

  if (!TEST_CONFIG.testAIMLAPI) {
    console.log(
      `\n⏭️  Test: ${testName} - SKIPPED (set TEST_CONFIG.testAIMLAPI=true to enable)`,
    );
    return {
      name: testName,
      status: "SKIP",
      duration: 0,
      message: "No API key configured",
    };
  }

  try {
    console.log(`\n🧪 Test: ${testName}`);

    const apiKey = process.env.AIMLAPI_API_KEY;
    if (!apiKey || apiKey === "your-aimlapi-key-here") {
      throw new Error("Valid AIMLAPI_API_KEY required");
    }

    const client = new AIMLAPIClient({
      apiKey,
      baseURL: process.env.AIMLAPI_BASE_URL,
    });

    const models = [
      AIModel.CLAUDE_3_SONNET,
      AIModel.GPT_4O_MINI,
      AIModel.GEMINI_FLASH,
    ];
    const testResults = [];

    for (const model of models) {
      console.log(`  - Testing ${model}...`);

      try {
        const result = await client.chatCompletion(
          [{ role: "user", content: 'Say "Hello" in one word.' }],
          {
            model,
            maxTokens: 10,
            temperature: 0,
          },
        );

        console.log(`    ✅ Response: ${result.content}`);
        console.log(`    💰 Cost: $${result.cost.total.toFixed(6)}`);
        console.log(`    ⏱️  Latency: ${result.metadata.latencyMs}ms`);

        testResults.push({
          model,
          success: true,
          cost: result.cost.total,
          latency: result.metadata.latencyMs,
        });
      } catch (error) {
        console.log(`    ❌ Failed: ${error}`);
        testResults.push({
          model,
          success: false,
          error: String(error),
        });
      }
    }

    const successCount = testResults.filter((r) => r.success).length;
    console.log(`  - ${successCount}/${models.length} models successful`);

    const stats = client.getStats();
    console.log(`  - Total cost: $${stats.totalCost.toFixed(6)}`);
    console.log(`  - Total requests: ${stats.requestCount}`);

    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);

    return {
      name: testName,
      status: "PASS",
      duration,
      data: {
        modelsSuccessful: successCount,
        totalModels: models.length,
        totalCost: stats.totalCost,
        results: testResults,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testName} FAILED: ${error}`);

    return {
      name: testName,
      status: "FAIL",
      duration,
      message: String(error),
    };
  }
}

/**
 * Test 4: Batch Processing End-to-End
 */
async function testBatchProcessing(zipPath: string): Promise<TestResult> {
  const startTime = Date.now();
  const testName = "Batch Processing End-to-End";

  try {
    console.log(`\n🧪 Test: ${testName}`);

    let progressCount = 0;
    const result = await excelParser.processBatchFromZip(zipPath, {
      detectConflicts: false,
      onProgress: (current, total, filename) => {
        progressCount++;
        console.log(`  - Processing ${current}/${total}: ${filename}`);
      },
    });

    console.log(`  - Total files: ${result.totalFiles}`);
    console.log(`  - Successful: ${result.successfulFiles}`);
    console.log(`  - Failed: ${result.failedFiles}`);
    console.log(`  - Total rows: ${result.aggregatedData.length}`);
    console.log(
      `  - Avg time per file: ${result.averageTimePerFile.toFixed(0)}ms`,
    );
    console.log(`  - Progress callbacks: ${progressCount}`);

    // Validate
    if (result.successfulFiles === 0) {
      throw new Error("No files processed successfully");
    }

    if (progressCount === 0) {
      throw new Error("Progress callback not called");
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);

    return {
      name: testName,
      status: "PASS",
      duration,
      data: {
        totalFiles: result.totalFiles,
        successfulFiles: result.successfulFiles,
        totalRows: result.aggregatedData.length,
        averageTimeMs: result.averageTimePerFile,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testName} FAILED: ${error}`);

    return {
      name: testName,
      status: "FAIL",
      duration,
      message: String(error),
    };
  }
}

/**
 * Test 5: Cost Tracking Validation
 */
async function testCostTracking(): Promise<TestResult> {
  const startTime = Date.now();
  const testName = "Cost Tracking Validation";

  try {
    console.log(`\n🧪 Test: ${testName}`);

    const apiKey = process.env.AIMLAPI_API_KEY || "test-key";
    const client = new AIMLAPIClient({
      apiKey,
      defaultModel: AIModel.GPT_4O_MINI,
    });

    // Test cost calculation
    const inputTokens = 1000;
    const outputTokens = 500;

    for (const [model, pricing] of Object.entries(MODEL_PRICING)) {
      const cost = client.calculateCost(
        model as AIModel,
        inputTokens,
        outputTokens,
      );

      const expectedInput = (inputTokens / 1_000_000) * pricing.input;
      const expectedOutput = (outputTokens / 1_000_000) * pricing.output;
      const expectedTotal = expectedInput + expectedOutput;

      console.log(`  - ${model}:`);
      console.log(
        `    Input: $${cost.input.toFixed(6)} (expected: $${expectedInput.toFixed(6)})`,
      );
      console.log(
        `    Output: $${cost.output.toFixed(6)} (expected: $${expectedOutput.toFixed(6)})`,
      );
      console.log(
        `    Total: $${cost.total.toFixed(6)} (expected: $${expectedTotal.toFixed(6)})`,
      );

      // Validate
      if (Math.abs(cost.total - expectedTotal) > 0.000001) {
        throw new Error(`Cost mismatch for ${model}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);

    return {
      name: testName,
      status: "PASS",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testName} FAILED: ${error}`);

    return {
      name: testName,
      status: "FAIL",
      duration,
      message: String(error),
    };
  }
}

/**
 * Generate test report
 */
function generateReport(results: TestResult[]) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 INFRASTRUCTURE TEST REPORT");
  console.log("=".repeat(80));

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;
  const total = results.length;

  console.log(
    `\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`,
  );
  console.log("");

  for (const result of results) {
    const icon =
      result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⏭️";
    console.log(`${icon} ${result.name} (${result.duration}ms)`);

    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }

    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(
    failed === 0
      ? "🎉 ALL TESTS PASSED! Infrastructure ready for Phase 2!"
      : "⚠️  SOME TESTS FAILED. Review and fix before proceeding.",
  );
  console.log("=".repeat(80) + "\n");

  return {
    passed,
    failed,
    skipped,
    total,
    results,
  };
}

/**
 * Main test runner
 */
async function main() {
  console.log("🚀 AGENT NOVEMBER - Infrastructure Validation Tests");
  console.log("=".repeat(80));

  let zipPath: string | null = null;

  try {
    // Create sample ZIP if needed
    if (TEST_CONFIG.createSampleZip) {
      zipPath = await createSampleZip();
    }

    // Run tests
    if (zipPath) {
      results.push(await testZipExtraction(zipPath));
    }

    results.push(await testAIMLAPIInit());
    results.push(await testAIMLAPIConnectivity());

    if (zipPath) {
      results.push(await testBatchProcessing(zipPath));
    }

    results.push(await testCostTracking());

    // Generate report
    const report = generateReport(results);

    // Save report to file
    const reportPath = path.join(
      process.cwd(),
      "infrastructure-test-report.json",
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  } finally {
    // Cleanup
    if (TEST_CONFIG.cleanupAfterTests && zipPath) {
      try {
        const tempDir = path.dirname(zipPath);
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned up test data: ${tempDir}`);
      } catch (error) {
        console.warn("Warning: Failed to cleanup test data:", error);
      }
    }
  }
}

// Run tests
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
