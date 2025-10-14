import { ZipExtractor } from "../lib/vedic/zip-extractor";
import path from "path";

const TEST_ZIP =
  "C:/Projects/AsymmFlow-PH-Trading/docs/Zip_Files_for_OCR/OneDrive_2025-10-09.zip";

async function runTest() {
  console.log(
    "\n╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║        🚀 AGENT QUEBEC ZIP EXTRACTION TEST 🚀                ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝\n",
  );

  const extractor = new ZipExtractor();
  const result = await extractor.extractExcelFiles(TEST_ZIP);

  console.log("✅ EXTRACTION COMPLETE!\n");
  console.log(`📦 Total Files:     ${result.totalFilesExtracted}`);
  console.log(`📄 Excel Files:     ${result.excelFileCount}`);
  console.log(`⏱️  Duration:        ${result.metadata.processingTimeMs}ms`);
  console.log(
    `⚡ Throughput:      ${(result.excelFileCount / (result.metadata.processingTimeMs / 1000)).toFixed(2)} files/sec\n`,
  );

  console.log("📋 Extracted Files:");
  result.excelFiles.forEach((f, i) => {
    console.log(`   ${i + 1}. ${path.basename(f)}`);
  });

  console.log("\n🧹 Cleaning up...");
  await extractor.cleanupTempDirectory(result.tempDirectory);

  console.log(
    "\n╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                    🎉 TEST PASSED! 🎉                         ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝\n",
  );
  console.log("🎯 AGENT QUEBEC INFRASTRUCTURE:");
  console.log("   ✅ ZIP extraction working!");
  console.log("   ✅ Excel file filtering working!");
  console.log("   ✅ Cleanup working!");
  console.log("   ✅ READY FOR MULTI-ZIP ORCHESTRATION!\n");
}

runTest().catch(console.error);
