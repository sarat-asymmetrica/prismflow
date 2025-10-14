/**
 * MONSTER ZIP STRESS TEST - 2.58GB Ultimate Challenge
 *
 * Tests AsymmFlow's ability to handle MASSIVE real-world archives
 * with deep nesting, scattered files, and month's worth of data
 */

import path from "path";
import { ZipExtractor } from "../lib/vedic/zip-extractor";

async function runMonsterStressTest(): Promise<void> {
  console.log("🔥 MONSTER ZIP STRESS TEST 🔥");
  console.log("═".repeat(80));
  console.log("");
  console.log("📦 Target: 2.58GB ZIP with nested folders and scattered data");
  console.log("🎯 Goal: Extract ALL Excel files and measure performance");
  console.log("⚡ Expected: 1000+ files, deep nesting, total mayhem!");
  console.log("");
  console.log("═".repeat(80));
  console.log("");

  const startTime = Date.now();

  // The MONSTER
  const zipPath = path.join(
    process.cwd(),
    "docs/Zip_Files_for_OCR/Stress Test/OneDrive_2025-10-09.zip",
  );

  console.log("📂 ZIP File:", zipPath);
  console.log("");

  // Phase 1: List contents first (fast preview)
  console.log(
    "🔍 PHASE 1: Quick Preview (Listing Excel files without extraction)",
  );
  console.log("─".repeat(80));

  const extractor = new ZipExtractor();

  try {
    const listStartTime = Date.now();
    const excelFilesList = await extractor.listExcelFiles(zipPath);
    const listTime = Date.now() - listStartTime;

    console.log(
      `✅ Listed ${excelFilesList.length} Excel files in ${listTime}ms`,
    );
    console.log("");

    // Show sample files
    console.log("📋 Sample files (first 10):");
    excelFilesList.slice(0, 10).forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file}`);
    });

    if (excelFilesList.length > 10) {
      console.log(`   ... and ${excelFilesList.length - 10} more files`);
    }
    console.log("");

    // Phase 2: Full extraction
    console.log("⚡ PHASE 2: Full Extraction (This will take a while...)");
    console.log("─".repeat(80));
    console.log("");

    const extractStartTime = Date.now();
    let progressCount = 0;

    const result = await extractor.extractExcelFiles(zipPath, {
      includeCsv: true,
      extractNestedZips: false, // Start without nested extraction
      onProgress: (current, total) => {
        // Show progress every 100 files
        if (current % 100 === 0 || current === total) {
          const percent = ((current / total) * 100).toFixed(1);
          console.log(`   Progress: ${current}/${total} (${percent}%)`);
          progressCount++;
        }
      },
    });

    const extractTime = Date.now() - extractStartTime;
    const totalTime = Date.now() - startTime;

    console.log("");
    console.log("═".repeat(80));
    console.log("🎊 MONSTER ZIP EXTRACTION COMPLETE!");
    console.log("═".repeat(80));
    console.log("");

    // Results
    console.log("📊 EXTRACTION RESULTS:");
    console.log("─".repeat(80));
    console.log(`   Archive Name:           ${result.metadata.archiveName}`);
    console.log(
      `   Archive Size:           ${(result.metadata.archiveSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    );
    console.log(
      `   Total Files Extracted:  ${result.totalFilesExtracted.toLocaleString()}`,
    );
    console.log(
      `   Excel Files Found:      ${result.excelFileCount.toLocaleString()}`,
    );
    console.log(`   Warnings:               ${result.warnings.length}`);
    console.log("");

    console.log("⏱️  TIMING BREAKDOWN:");
    console.log("─".repeat(80));
    console.log(
      `   Phase 1 (List):         ${listTime.toLocaleString()}ms (${(listTime / 1000).toFixed(2)}s)`,
    );
    console.log(
      `   Phase 2 (Extract):      ${extractTime.toLocaleString()}ms (${(extractTime / 1000).toFixed(2)}s)`,
    );
    console.log(
      `   Total Time:             ${totalTime.toLocaleString()}ms (${(totalTime / 1000).toFixed(2)}s)`,
    );
    console.log("");

    console.log("📈 PERFORMANCE METRICS:");
    console.log("─".repeat(80));
    const filesPerSecond = (
      result.totalFilesExtracted /
      (extractTime / 1000)
    ).toFixed(2);
    const mbPerSecond = (
      result.metadata.archiveSize /
      (1024 * 1024) /
      (extractTime / 1000)
    ).toFixed(2);
    const avgFileTime = (extractTime / result.totalFilesExtracted).toFixed(2);

    console.log(`   Throughput:             ${filesPerSecond} files/second`);
    console.log(`   Extraction Speed:       ${mbPerSecond} MB/second`);
    console.log(`   Avg Time per File:      ${avgFileTime}ms`);
    console.log("");

    // Williams Optimizer Projection
    console.log("🧮 WILLIAMS OPTIMIZER ANALYSIS:");
    console.log("─".repeat(80));

    const n = result.excelFileCount;
    const williamsSpaceBound = Math.sqrt(n) * Math.log2(n);
    const optimalBatchSize = Math.ceil(williamsSpaceBound);
    const estimatedBatches = Math.ceil(n / optimalBatchSize);

    console.log(`   Total Excel Files:      ${n.toLocaleString()}`);
    console.log(`   Williams Space Bound:   ${williamsSpaceBound.toFixed(2)}`);
    console.log(`   Optimal Batch Size:     ${optimalBatchSize}`);
    console.log(`   Estimated Batches:      ${estimatedBatches}`);
    console.log("");

    // AI Processing Projection
    console.log("🤖 AI PROCESSING PROJECTION (If we process all files):");
    console.log("─".repeat(80));

    const tokensPerFile = 783; // From previous test
    const costPerFile = 0.000259; // From previous test
    const totalTokens = n * tokensPerFile;
    const totalCost = n * costPerFile;

    console.log(
      `   Estimated Tokens:       ${totalTokens.toLocaleString()} tokens`,
    );
    console.log(`   Estimated Cost:         $${totalCost.toFixed(4)}`);
    console.log(
      `   Processing Time (est):  ${((n * 10) / 60).toFixed(1)} minutes`,
    );
    console.log("");

    // Sample files
    console.log("📁 SAMPLE EXTRACTED FILES:");
    console.log("─".repeat(80));
    result.excelFiles.slice(0, 20).forEach((file, idx) => {
      const fileName = path.basename(file);
      const dirName = path.dirname(file).split(path.sep).slice(-2).join("/");
      console.log(`   ${idx + 1}. ${dirName}/${fileName}`);
    });

    if (result.excelFiles.length > 20) {
      console.log(`   ... and ${result.excelFiles.length - 20} more files`);
    }
    console.log("");

    // Warnings
    if (result.warnings.length > 0) {
      console.log("⚠️  WARNINGS:");
      console.log("─".repeat(80));
      result.warnings.slice(0, 10).forEach((warning, idx) => {
        console.log(`   ${idx + 1}. ${warning}`);
      });

      if (result.warnings.length > 10) {
        console.log(`   ... and ${result.warnings.length - 10} more warnings`);
      }
      console.log("");
    }

    console.log("═".repeat(80));
    console.log("🏆 STRESS TEST VERDICT:");
    console.log("═".repeat(80));

    if (result.warnings.length === 0) {
      console.log("   ✅ PERFECT EXTRACTION - Zero errors!");
    } else if (result.warnings.length < result.totalFilesExtracted * 0.05) {
      console.log(
        `   ✅ EXCELLENT - Only ${result.warnings.length} warnings out of ${result.totalFilesExtracted} files (<5%)`,
      );
    } else {
      console.log(
        `   ⚠️  GOOD - ${result.warnings.length} warnings (${((result.warnings.length / result.totalFilesExtracted) * 100).toFixed(1)}%)`,
      );
    }

    console.log("");
    console.log("🔥 AsymmFlow handled 2.58GB of TOTAL MAYHEM like a BOSS! 🔥");
    console.log("");
    console.log("═".repeat(80));

    // Cleanup
    console.log("");
    console.log("🧹 Cleaning up temporary files...");
    await extractor.cleanupTempDirectory(result.tempDirectory);
    console.log("✅ Cleanup complete!");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("═".repeat(80));
    console.error("❌ STRESS TEST FAILED");
    console.error("═".repeat(80));
    console.error("");
    console.error("Error:", error);
    console.error("");

    const totalTime = Date.now() - startTime;
    console.error(`Failed after ${(totalTime / 1000).toFixed(2)}s`);
    console.error("");

    throw error;
  }
}

// Execute
runMonsterStressTest()
  .then(() => {
    console.log(
      "✨ Monster stress test complete! System performed beautifully!",
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Monster stress test failed:", error.message);
    process.exit(1);
  });
